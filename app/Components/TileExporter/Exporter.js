import d3 from 'd3';
import THREE from 'three';
import D3d from '../../libs/D3-Three';
import '../../libs/OBJ-Exporter';

import PreviewMap from './PreviewMap';
import QueryChecker from './QueryChecker';
import { tile2Lon, tile2Lat } from './MapSpells';
import DomHelper from './DomHelper';

import Key from '../../Keys';

import store from '../../Redux/Store';
import { updateZoom, updatePoint } from '../../Redux/Action';
import BasicScene from './BasicScene';

import '../../libs/Triangulation';
// Changes the way Threejs does triangulation
THREE.Triangulation.setLibrary('earcut');

class TileExporter {
  constructor() {
    this.basicScene = new BasicScene();
    this.previewMap = new PreviewMap(this);
    this.domHelper = new DomHelper(this);
    this.queryChecker = new QueryChecker(this);

    this.dthreed = new D3d();
    this.objExporter = new THREE.OBJExporter();

    this.domHelper.attachEvents();
    window.addEventListener( 'resize', () => {this.basicScene.onWindowResize();});
  }

  get tileConfig() {
    // These are all features from Mapzen Vector tile all layers
    return {
      water: {
        height: 6
      },
      buildings: {
        height: 25
      },
      places: {
        height: 0
      },
      transit: {
        height: 0
      },
      pois: {
        height: 0
      },
      boundaries: {
        height: 15
      },
      roads: {
        height: 15
      },
      earth: {
        height: 10
      },
      landuse: {
        height: 13
      }
    };
  }

  navigateTile(tilePos) {
    // Update store's coordinates to the new tile.
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
    this.domHelper.showLoadingBar();

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
      // Update hash value
      this.queryChecker.updateQueryString({
        lon: store.getState().lon,
        lat: store.getState().lat,
        zoom: store.getState().zoom
      });

      this.domHelper.displayCoord();
      this.domHelper.hideLoadingBar();
      this.enableDownloadLink();
    });
  }

  bakeTile(json) {
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

     var geoObj = this.tileConfig;
     var convertedThreePaths = [];
      var heights = [];
      for (var obj in json) {
        // var defaultHeight = 13;
        // if(obj === 'earth') {
          // var b = path.bounds(geoFeature);
          // tileX = b[0][0];
          // tileY = b[0][1];
          // tileW = b[1][0] - b[0][0];
          // tileH = b[1][1] - b[0][1];
        //   defaultHeight = 10;
        // } else if(obj === 'water') {
        //   defaultHeight = 6;
        // } else if(obj === 'landuse') {
        //   defaultHeight = 15;
        // } else if(obj === 'buildings') {
        //   defaultHeight = 25;
        // }
        var pathWithHeights = [];
        for (var geoFeature of json[obj].features) {
          var path = d3.geo.path().projection(projectionThenFlipY);
          //path = d3.geo.path().projection(projection);
          var feature = path(geoFeature);

          if(feature !== undefined) {
            // 'a' command is not implemented in d3-three, skipping for now.
            // 'a' is SVG path command for Ellpitic Arc Curve. https://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands
            if(feature.indexOf('a') > 0) ;
            else {
              var mesh = this.dthreed.exportSVG(feature);
              // convertedThreePaths.push(mesh);

              var h = geoFeature.properties['height'] || geoObj[obj].height;
              // heights.push(h);

              pathWithHeights.push({
                threeMesh: mesh,
                height: h
              });

            }
          }
        }
        geoObj[obj].paths = pathWithHeights;
      }

      // var obj = {
      //   paths: convertedThreePaths,
      //   amounts: heights
      // }

      // var geoGroup = this.getThreeGroup(obj);
      var geoGroup = this.getThreeGroup(testObj);
      geoGroup.translateX(-100 / ((-15 + store.getState().zoom)*2)); //* 2);
      geoGroup.translateY(100/ ((-15 + store.getState().zoom)*2)); //* 2);
      // geoGroup.translateX(-(tileX+tileW));
      // geoGroup.translateY(-(tileY+tileH));
      return geoGroup;
  }

  getThreeGroup(geoGroup) {
    var geoObjectsGroup = new THREE.Group();
    geoObjectsGroup.name = 'geoObjectsGroup';

    for(var feature in geoGroup) {
      var color = feature.color || new THREE.Color("#5c5c5c");
      var material = new THREE.MeshLambertMaterial({
        color: color
      });
      for (var meshPath of geoGroup[feature].paths) {
        for (var eachMesh of meshPath.threeMesh) {
          var shape3d = eachMesh.extrude({
            amount: meshPath.height,
            bevelEnabled: false
          })
          var mesh = new THREE.Mesh(shape3d, material);
          geoObjectsGroup.add(mesh);
        }
      }
    }
    return geoObjectsGroup;
  }

  getOldThreeGroup(meshObjs) {

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

}

export default TileExporter;
