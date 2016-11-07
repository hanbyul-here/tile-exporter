import d3 from 'd3';
import THREE from 'three';
import D3d from '../../libs/D3-Three';
import '../../libs/OBJ-Exporter';
import OrbitControls from '../../libs/OrbitControl';

import PreviewMap from './PreviewMap';
import QueryChecker from './QueryChecker';
import { tile2Lon, tile2Lat } from './MapSpells';
// import QueryChecker from './QueryChecker';

import Key from '../../Keys';

import store from '../../Redux/Store';
import { updateZoom, updatePoint, updatePointZoom } from '../../Redux/Action';
import BasicScene from './BasicScene';

import '../../libs/Triangulation';
// Changes the way Threejs does triangulation
THREE.Triangulation.setLibrary('earcut');

class TileExporter {
  constructor () {
    this.basicScene = new BasicScene();
    this.previewMap = new PreviewMap(this);
    this.objExporter = new THREE.OBJExporter();
    this.dthreed = new D3d();
    this.queryChecker = new QueryChecker(this);
    this.attachEvents();

  }

  attachEvents() {
    var exportBtn = document.getElementById('exportBtn');

    exportBtn.addEventListener( 'click', () => {
      this.queryChecker.updateQueryString({
        'lon': store.getState().lon,
        'lat': store.getState().lat,
        'zoom': store.getState().zoom
      });
      this.fetchTheTile(this.buildQueryURL());
      this.displayCoord();
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

    window.addEventListener( 'resize', evt => this.basicScene.onWindowResize());
  }

  navigateTile(tilePos) {
    var tLon = store.getState().tileLon + tilePos.ew;
    var tLat = store.getState().tileLat + tilePos.ns;

    var _zoom = store.getState().zoom;
    var newLatLonZoom = {
      lon: tile2Lon(tLon, _zoom),
      lat: tile2Lat(tLat, _zoom),
      zoom: _zoom
    }

    store.dispatch(updatePoint(newLatLonZoom));
    this.fetchTheTile(this.buildQueryURL());
    this.queryChecker.updateQueryString(newLatLonZoom);

    this.displayCoord();
  }

  buildQueryURL() {
    var inputLon = store.getState().lon;
    var inputLat = store.getState().lat;
    var tLon = store.getState().tileLon;
    var tLat = store.getState().tileLat;
    var zoom = store.getState().zoom;

    var config = {
      baseURL: 'https://tile.mapzen.com/mapzen/vector/v1',
      dataKind: 'all',
      fileFormat: 'json'
    };

    var callURL =  config.baseURL + '/' + config.dataKind + '/' + zoom + '/' + tLon + '/' + tLat + '.' + config.fileFormat + '?api_key=' + Key.vectorTile;
    console.log(callURL);
    return callURL;
  }

 fetchTheTile(callURL) {
    this.setLoadingBar(true);

    //get rid of current Tile from scene if there is any
    this.basicScene.removeObject('geoObjectsGroup');

    //get rid of current preview
    this.previewMap.destroy();

    //draw previewmap
    this.previewMap.drawData();
    // converting d3 path(svg) to three shape
    //converting geocode to mercator tile nums

    d3.json(callURL, (err,json) => {
      if (err) {
        console.log(`Error during fetching json from the tile server ${err}`);
      } else {
        var geoGroups = this.bakeTile(json);
        this.basicScene.addObject(geoGroups);

      }
      this.setLoadingBar(false);
      this.enableDownloadLink();
    })
  }

  bakeTile(json) {
    var convertedThreePaths = [];
    var heights = [];
    var tileX, tileY, tileW, tileH;
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
                var mesh = this.dthreed.exportSVG(feature);
                convertedThreePaths.push(mesh);
                var h = (geoFeature.properties['height']+10) || defaultHeight;
                heights.push(h);
              }
            }
          }
        }

        var obj = {
          paths: convertedThreePaths,
          amounts: heights
        }

        var geoGroup = this.getThreeGroup(obj);
        geoGroup.translateX(-(tileX+tileW)/2);
        geoGroup.translateY(-tileY-tileH/2 );
        return geoGroup;
  }

  getThreeGroup(meshObjs) {

    var geoObjectsGroup = new THREE.Group();
    geoObjectsGroup.name = 'geoObjectsGroup';

    var amount, simpleShapes, simpleShape, shape3d, toAdd, results = [];

    var thePaths = meshObjs.paths;
    var theAmounts = meshObjs.amounts;

    var color = new THREE.Color("#5c5c5c");

    // This is normal material for exporter
    var material = new THREE.MeshLambertMaterial({
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
          geoObjectsGroup.add(mesh);
        } catch(e) {
          console.log(e.message);
        }

      }
    }

    return geoObjectsGroup;
  }

  enableDownloadLink() {
    var buildingObj = this.exportToObj();
    var exportA = document.getElementById('exportA');
    exportA.className = "";
    exportA.download = 'tile'+store.getState().tileLon +'-'+store.getState().tileLat+'-'+store.getState().zoom+'.obj';

    var blob = new Blob([buildingObj], {type: 'text'});
    var url = URL.createObjectURL(blob);
    exportA.href = url;
  }

  exportToObj () {
    var result = this.objExporter.parse(this.basicScene.getScene);
    return result;
  }

  setLoadingBar(on) {
    if (on) document.getElementById('loading-bar').style.display = 'block';
    else document.getElementById('loading-bar').style.display = 'none';
  }

  displayCoord() {
    document.getElementById('lat').innerHTML = store.getState().lat;
    document.getElementById('lon').innerHTML = store.getState().lon;
  }
}

export default TileExporter;
