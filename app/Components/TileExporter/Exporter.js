import d3 from 'd3';
import THREE from 'three';
import D3d from '../../libs/D3-Three';
import OBJExporter from '../../libs/OBJ-Exporter';
import OrbitControls from '../../libs/OrbitControl';

import PreviewMap from './PreviewMap';
import { tile2Lon, tile2Lat } from './MapSpells';

import Key from '../../Keys';

import store from '../../Redux/Store';
import { updateZoom, updatePoint, updatePointZoom } from '../../Redux/Action';
import BasicScene from './BasicScene';

import '../../libs/Triangulation';
// Changes the way Threejs does triangulation
THREE.Triangulation.setLibrary('earcut');

var TileExporter = (function () {
  var basicScene;
  var previewMap;;
  var buildingGroup, exporter;

  const dthreed = new D3d();
  var exporter = new OBJExporter();

  const config = {
    baseURL: "https://tile.mapzen.com/mapzen/vector/v1",
    dataKind: "all",
    fileFormat: "json"
  }
  function initScene() {
    basicScene = new BasicScene();
    previewMap = new PreviewMap();
  }

  function attachEvents() {
    var exportBtn = document.getElementById('exportBtn');

    exportBtn.addEventListener( 'click', function() {
      fetchTheTile(buildQueryURL());
    });

     var nwBtn = document.getElementById('preview-north-west');
     var nBtn = document.getElementById('preview-north');
     var neBtn = document.getElementById('preview-north-east');

     var wBtn = document.getElementById('preview-center-west');

     var eBtn = document.getElementById('preview-center-east');

     var swBtn = document.getElementById('preview-south-west');
     var sBtn = document.getElementById('preview-south');
     var seBtn = document.getElementById('preview-south-east');

    //navigating tile
    nwBtn.addEventListener('click', function() {
      navigateTile(-1, -1)
    });
    nBtn.addEventListener('click', function() {
      navigateTile(0, -1)
    });
    neBtn.addEventListener('click', function() {
      navigateTile(1, -1)
    });

    wBtn.addEventListener('click', function() {
      navigateTile(-1, 0)
    });
    eBtn.addEventListener('click', function() {
      navigateTile(1, 0)
    });

    swBtn.addEventListener('click', function() {
      navigateTile(-1, 1)
    });
    sBtn.addEventListener('click', function() {
      navigateTile(0, 1)
    });
    seBtn.addEventListener('click', function() {
      navigateTile(1, 1)
    });

    var zoomRad = document.zoomRadio.zoomLevel;
    var prev = null;

    for(var i = 0; i < zoomRad.length; i++) {
      zoomRad[i].onclick = function() {
          if(this !== prev) {
            prev = this;
          }
          var zoomLevel = parseInt(prev.value);
         store.dispatch(updateZoom(zoomLevel));
        }
      }

    //for mobile ui, toggle main control
    var mainControl = document.getElementById('main-control');
    document.getElementById('hide-toggle').addEventListener('click', function() {
      if(mainControl.style.display  !== 'none') {
        mainControl.style.display = 'none';
        this.innerHTML = 'Show control';
      }
      else {
        mainControl.style.display = 'block';
        this.innerHTML = 'Hide control';
      }
    });

    window.addEventListener( 'resize', basicScene.onWindowResize, false );
    //check query string
    checkQueries();
  }

  function navigateTile(ew, ns) {
    var tLon = store.getState().tileLon + ew;
    var tLat = store.getState().tileLat + ns;

    var _zoom = store.getState().zoom;
    var newLatLonZoom = {
      lon: tile2Lon(tLon, _zoom),
      lat: tile2Lat(tLat, _zoom),
      zoom: _zoom
    }

    store.dispatch(updatePoint(newLatLonZoom));
    fetchTheTile(buildQueryURL());
    updateQueryString(newLatLonZoom);

    document.getElementById('lat').innerHTML = newLatLonZoom.lat;
    document.getElementById('lon').innerHTML = newLatLonZoom.lon;
  }

  function buildQueryURL() {
    var inputLon = store.getState().lon;
    var inputLat = store.getState().lat;
    var tLon = store.getState().tileLon;
    var tLat = store.getState().tileLat;
    var zoom = store.getState().zoom;

    updateQueryString({
      'lon': inputLon,
      'lat': inputLat,
      'zoom': zoom
    });

    var callURL =  config.baseURL + '/' + config.dataKind + '/' + zoom + '/' + tLon + '/' + tLat + '.' + config.fileFormat + '?api_key=' + Key.vectorTile;
    console.log(callURL);
    return callURL;
  }

  function fetchTheTile(callURL) {
    var tileX, tileY, tileW, tileH;

    setLoadingBar(true);

    var buildings = [];
    var heights = [];

    //get rid of current Tile from scene if there is any
    basicScene.removeObject(buildingGroup);
    //get rid of current preview
    previewMap.destroy();

    var projection = d3.geo.mercator()
      .center([store.getState().lon, store.getState().lat])
      .scale(1000000)
      .precision(0.0)
      .translate([0,0])

    // Will flip the Y coordinates that result from the geo projection
    var flipY = d3.geo.transform({
      point : function(x,y){
        this.stream.point(x,-y)
      }
    });

    // Mercator Geo Projection then flipped in Y
    // Solution taken from http://stackoverflow.com/a/31647135/3049530
    var projectionThenFlipY = {
        stream: function(s) {
            return projection.stream(flipY.stream(s));
        }
     };

    //draw previewmap
    previewMap.drawData();
    // converting d3 path(svg) to three shape
    //converting geocode to mercator tile nums
    d3.json(callURL, function(err,json) {
      if(err) console.log('err!');
      else {
        for(var obj in json) {
          for(var j = 0; j< json[obj].features.length; j++) {

            var geoFeature = json[obj].features[j];
            var path = d3.geo.path().projection(projectionThenFlipY);

            var defaultHeight = 13;

            if(obj === 'earth') {
              var b = path.bounds(geoFeature);
              tileX = b[0][0];
              tileY = b[0][1];
              tileW = b[1][0] - b[0][0];
              tileH = b[1][1] - b[0][1];
              defaultHeight = 10;
            } else if(obj === 'water') {
              defaultHeight = 6;
            } else if(obj === 'landuse') {
              defaultHeight = 15;
            } else if(obj === 'buildings') {
              defaultHeight = 25;
            }

            //path = d3.geo.path().projection(projection);
            var feature = path(geoFeature);

            if(feature !== undefined) {
              // 'a' command is not implemented in d3-three, skipping for now.
              // 'a' is SVG path command for Ellpitic Arc Curve. https://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands
              if(feature.indexOf('a') > 0) ;
              else {
                var mesh = dthreed.exportSVG(feature);
                buildings.push(mesh);
                var h = (geoFeature.properties['height']+10) || defaultHeight;
                heights.push(h);
              }
            }
          }
        }

        var obj = {};
        obj.paths = buildings;

        obj.amounts = heights || defaultHeight;
        buildingGroup = new THREE.Group();
        //buildingGroup.rotation.x = Math.PI;
        buildingGroup.translateX(-(tileX+tileW)/2);
        buildingGroup.translateY(-tileY-tileH/2 );

        basicScene.addObject(buildingGroup);
        addGeoObject(obj);
      }
      setLoadingBar(false);
    });
  }

  function addGeoObject(svgObject) {
    var path, material, amount, simpleShapes, simpleShape, shape3d, toAdd, results = [];

    var thePaths = svgObject.paths;
    var theAmounts = svgObject.amounts;

    var color = new THREE.Color("#5c5c5c");

    // This is normal material for exporter
    material = new THREE.MeshLambertMaterial({
      color: color
    });

    var i,j,k,len1;

    for (i = 0; i < thePaths.length; i++) {
      amount = theAmounts[i];
      simpleShapes = thePaths[i];
      len1 = simpleShapes.length;

      //adding all the buildings to the group!
      for (j = 0; j < len1; ++j) {

        simpleShape = simpleShapes[j];
        try {
          shape3d = simpleShape.extrude({
            amount: amount/ 6,
            bevelEnabled: false
          });

          var mesh = new THREE.Mesh(shape3d, material);
          buildingGroup.add(mesh);
        } catch(e) {
          console.log(e.message);
        }

      }
    }
    enableDownloadLink();
  }

  function reverseWindingOrder(object3D) {
    // This function is written by Immugio at Stack Overflow
    // http://stackoverflow.com/questions/28630097/flip-mirror-any-object-with-three-js
    // it had TODO: Something is missing, the objects are flipped alright but the light reflection on them is somehow broken
    // this application ignored light reflection using flat shade material

    if (object3D.type === "Mesh") {

      var geometry = object3D.geometry;

      for (var i = 0, l = geometry.faces.length; i < l; i++) {
          var face = geometry.faces[i];
          var temp = face.a;
          face.a = face.c;
          face.c = temp;
      }

      var faceVertexUvs = geometry.faceVertexUvs[0];

      for (i = 0, l = faceVertexUvs.length; i < l; i++) {

        var vector2 = faceVertexUvs[i][0];
        faceVertexUvs[i][0] = faceVertexUvs[i][2];
        faceVertexUvs[i][2] = vector2;
      }

      geometry.computeFaceNormals();
      //geometry.computeVertexNormals();
    }

    if (object3D.children) {
      for (var j = 0, jl = object3D.children.length; j < jl; j++) {
        reverseWindingOrder(object3D.children[j]);
      }
    }
  }

  function enableDownloadLink() {

    var buildingObj = exportToObj()
    var exportA = document.getElementById('exportA');
    exportA.className = "";
    exportA.download = 'tile'+store.getState().tileLon +'-'+store.getState().tileLat+'-'+store.getState().zoom+'.obj';

    var blob = new Blob([buildingObj], {type: 'text'});
    var url = URL.createObjectURL(blob);
    exportA.href = url;
  }

  function exportToObj () {
    var result = exporter.parse(basicScene.getScene);
    return result;
  }


  function checkQueries() {
    var _lon = getParameterByName('lon');
    var _lat = getParameterByName('lat');
    var _zoom = getParameterByName('zoom');

    if(_lon !== null && _lat !== null && _zoom !== null) {

      _zoom = _zoom.replace(/[^0-9]+/g, '');

      document.getElementById('lat').innerHTML = _lat;
      document.getElementById('lon').innerHTML = _lon;

      document.zoomRadio.zoomLevel.value = _zoom;

      store.dispatch(updatePointZoom({
        lat: _lat,
        lon: _lon,
        zoom: _zoom
      }))
      fetchTheTile(buildQueryURL());
      document.getElementById('exportBtn').disabled  = false;
    }
  }

  function updateQueryString(paramObj) {
    var url = window.location.origin + window.location.pathname;
    var newUrl = url + '?';
    var params = [];
    for(var key in paramObj) {
      params.push(encodeURIComponent(key) + "=" + encodeURIComponent(paramObj[key]));
    }
    newUrl += params.join("&");
    window.history.replaceState({},'',newUrl);
  }

  function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  function setLoadingBar(on) {
    if (on) document.getElementById('loading-bar').style.display = 'block';
    else document.getElementById('loading-bar').style.display = 'none';
  }

  return {
    initScene: initScene,
    attachEvents: attachEvents
  }
})();

module.exports = TileExporter;
