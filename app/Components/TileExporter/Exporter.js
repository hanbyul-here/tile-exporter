import d3 from 'd3'
import THREE from 'three'

import D3d from './D3-Three'
import OBJExporter from './OBJ-Exporter';

import OrbitControls from './OrbitControl';
import PreviewMap from './PreviewMap'

import Key from '../../Keys'

import store from '../../Redux/Store'
import {updateZoom, updatePoint, updatePointZoom} from '../../Redux/Action'
import reducer from '../../Redux/Reducer'

var TileExporter = (function() {

  var renderer;
  var scene, camera, controls, buildingGroup, exporter;

  var tileLon, tileLat;

  var w,h;

  var dthreed = new D3d();
  var exporter = new OBJExporter();

  var config = {
    baseURL: "https://tile.mapzen.com/mapzen/vector/v1",
    dataKind: "all",
    fileFormat: "json",
    zoomLevel: 16
  }

  function initScene() {
    w = window.innerWidth;
    h = window.innerHeight;
    /// Global : renderer
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setClearColor( 0xb0b0b0 );
    renderer.setSize( w, h );

    /// Global : scene
    scene = new THREE.Scene();

    /// Global : camera
    camera = new THREE.PerspectiveCamera( 20, w/ h, 1, 1000000 );
    camera.position.set(0, 0, 500 );
    camera.lookAt(new THREE.Vector3(0,0,0))


    /// direct light
    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 1, 1, 1 );
    light.rotation.set( 2, 1, 1 );
    scene.add( light );

    /// ambient light
     var ambientLight = new THREE.AmbientLight(0xffffff);
     scene.add( ambientLight );

    //orbit control
    controls = new OrbitControls( camera, renderer.domElement );
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = false;

    //attach renderer to DOM
    document.body.appendChild( renderer.domElement );
    //initiating animate of rendere at the same time
    animate();
  }


  function animate() {
    requestAnimationFrame( animate );
    controls.update();
    renderer.render( scene, camera );
  }


  function onWindowResize() {

    w = window.innerWidth;
    h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize( w, h );
  }


  function attachEvents() {
    var exportBtn = document.getElementById('exportBtn');

    exportBtn.addEventListener( 'click', function() {
      //var inputLon = document.getElementById('lon').value;
      //var inputLat = document.getElementById('lat').value;
      fetchTheTile(buildQueryURL());
    });

     var nwBtn = document.getElementById('preview-north-west');
     var nBtn = document.getElementById('preview-north');
     var neBtn = document.getElementById('preview-north-east');

     var wBtn = document.getElementById('preview-west');

     var eBtn = document.getElementById('preview-east');

     var swBtn = document.getElementById('preview-south-west');
     var sBtn = document.getElementById('preview-south');
     var seBtn = document.getElementById('preview-south-east');


    //navigating tile
    nwBtn.addEventListener('click', function() {
      navigateTile(-1,-1)
    });
    nBtn.addEventListener('click', function() {
      navigateTile(0,-1)
    });
    neBtn.addEventListener('click', function() {
      navigateTile(1,-1)
    });

    wBtn.addEventListener('click', function() {
      navigateTile(-1,0)
    });
    eBtn.addEventListener('click', function() {
      navigateTile(1,0)
    });

    swBtn.addEventListener('click', function() {
      navigateTile(-1,1)
    });
    sBtn.addEventListener('click', function() {
      navigateTile(0,1)
    });
    seBtn.addEventListener('click', function() {
      navigateTile(1,1)
    });

    var zoomRad = document.zoomRadio.zoomLevel;
    var prev = null;

    for(var i = 0; i < zoomRad.length; i++) {
      zoomRad[i].onclick = function() {
          if(this !== prev) {
            prev = this;
          }
         var zoomLevel = parseInt(prev.value);
         store.dispatch(updateZoom(zoomLevel))
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


    window.addEventListener( 'resize', onWindowResize, false );

    //check query string
    checkQueries();
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
      config.zoomLevel = _zoom;

      store.dispatch(updatePointZoom({
        lat: _lat,
        lon: _lon,
        zoom: _zoom
      }))
      fetchTheTile(buildQueryURL());
      document.getElementById('exportBtn').disabled  = false;
    }
  }



  function navigateTile(eastWest, northSouth) {

    if(tileLon) {
      tileLon += eastWest;
      tileLat += northSouth;

      var zoom = store.getState().zoom;

      var callURL =  config.baseURL + '/' + config.dataKind + '/' + zoom + '/' + tileLon + '/' + tileLat + '.' + config.fileFormat + '?api_key=' + Key.vectorTile;
      var centerLon = tile2Lon(tileLon, zoom);
      var centerLat = tile2Lat(tileLat, zoom);

      var lonLatZoom = {
        lon: centerLon,
        lat: centerLat,
        zoom: zoom
      }

      store.dispatch(updatePoint({
        lon: centerLon,
        lat: centerLat
      }))

      //store.dispatch(updatePointZoom(lonLatZoom))
      fetchTheTile(callURL);

      updateQueryString(lonLatZoom)

      document.getElementById('lat').innerHTML = centerLat;
      document.getElementById('lon').innerHTML = centerLon;
    } else {
      console.log('please select a place')
    }
  }

  function buildQueryURL() {

    var inputLon = store.getState().lon; //parseFloat(lon);//-74.0059700;
    var inputLat = store.getState().lat;//parseFloat(lat);//40.7142700;
    var zoom = store.getState().zoom;
    config.zoomLevel = zoom;

    updateQueryString({
      'lon': inputLon,
      'lat': inputLat,
      'zoom': zoom
    });


    //falttening geocode by converting them to mercator tile nums
    tileLon = long2tile(inputLon, zoom);
    tileLat = lat2tile(inputLat , zoom);

    var callURL =  config.baseURL + '/' + config.dataKind + '/' + zoom + '/' + tileLon + '/' + tileLat + '.' + config.fileFormat + '?api_key=' + Key.vectorTile;
    return callURL;
  }

  var tileX, tileY, tileW, tileH;

  function fetchTheTile(callURL) {

    setLoadingBar(true);

    var buildings = [];
    var heights = [];

    //get rid of current Tile from scene if there is any
    scene.remove(buildingGroup);
    //get rid of current preview
    PreviewMap.destroy();

    //get lon/lat for mercator tile num
    var centerLon = tile2Lon(tileLon, config.zoomLevel);
    var centerLat = tile2Lat(tileLat, config.zoomLevel);

    var previewProjection = d3.geo.mercator()
      .center([centerLon, centerLat])
      //this are carved based on zoom 16
      .scale(600000* 100/58 * Math.pow(2,(config.zoomLevel-16)))
      .precision(.0)
      .translate([0,0])

    var projection = d3.geo.mercator()
      .center([centerLon, centerLat])
      .scale(1000000)
      .precision(.0)
      .translate([0,0])

    // Will flip the Y coordinates that result from the geo projection
    var flipY = d3.geo.transform({
      point : function(x,y){
        this.stream.point(x,-y)
      }
    });

    // Mercator Geo Projection then flipped in Y
    // Solution taken from http://stackoverflow.com/a/31647135/3049530
    var projection_then_flipY = {
        stream: function(s) {
            return projection.stream(flipY.stream(s));
        }
     };

    //draw previewmap
    PreviewMap.drawData(tileLon, tileLat);

    // converting d3 path(svg) to three shape
    //converting geocode to mercator tile nums
    d3.json(callURL, function(err,json) {
      if(err) console.log('err!');
      else {
        for(var obj in json) {
          for(var j = 0; j< json[obj].features.length; j++) {

            var geoFeature = json[obj].features[j];
            var previewPath = d3.geo.path().projection(previewProjection);
            var path = d3.geo.path().projection(projection_then_flipY);

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
            var previewFeature = previewPath(geoFeature);

            if(feature !== undefined) {
              if(previewFeature.indexOf('a') > 0) ;

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

        scene.add( buildingGroup );
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
          console.log('it could not exturde geometry, it can be because of duplicated point of svg.');
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
    exportA.download = 'tile'+tileLon +'-'+tileLat+'-'+store.getState().zoom+'.obj';

    var blob = new Blob([buildingObj], {type: 'text'});
    var url = URL.createObjectURL(blob);
    exportA.href = url;
  }

  function exportToObj () {
    var result = exporter.parse(scene);
    return result;
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
    if(on) document.getElementById('loading-bar').style.display = 'block';
    else document.getElementById('loading-bar').style.display = 'none';
  }

  return {
    initScene: initScene,
    attachEvents: attachEvents
  }
})();

////here all maps spells are!
//convert lat/lon to mercator style number
function long2tile(lon,zoom) {
  return (Math.floor((lon+180)/360*Math.pow(2,zoom)));
}
function lat2tile(lat,zoom)  {
  return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom)));
}

//shold check it will work
function tile2Lon(tileLon, zoom) {
  return (tileLon*360/Math.pow(2,zoom)-180).toFixed(10);
}

function tile2Lat(tileLat, zoom) {
  return ((360/Math.PI) * Math.atan(Math.pow( Math.E, (Math.PI - 2*Math.PI*tileLat/(Math.pow(2,zoom)))))-90).toFixed(10);
}


module.exports = TileExporter;
