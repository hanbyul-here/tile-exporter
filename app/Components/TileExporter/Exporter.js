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
import { updatePoint } from '../../Redux/Action';
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
  }

  attachEvents() {
    this.domHelper.attachEvents();
    window.addEventListener('resize', () => { this.basicScene.onWindowResize(); });
  }

  get tileConfig() {  // eslint-disable-line
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
    const tLon = store.getState().tileLon + tilePos.ew;
    const tLat = store.getState().tileLat + tilePos.ns;

    const _zoom = store.getState().zoom;
    const newLatLonZoom = {
      lon: tile2Lon(tLon, _zoom),
      lat: tile2Lat(tLat, _zoom),
      zoom: _zoom
    };

    store.dispatch(updatePoint(newLatLonZoom));
    this.fetchTheTile(this.buildQueryURL());
  }

  buildQueryURL() { // eslint-disable-line
    const tLon = store.getState().tileLon;
    const tLat = store.getState().tileLat;
    const zoom = store.getState().zoom;

    const config = {
      baseURL: 'https://tile.mapzen.com/mapzen/vector/v1',
      dataKind: 'all',
      fileFormat: 'json'
    };

    const callURL = `${config.baseURL}/${config.dataKind}/${zoom}/${tLon}/${tLat}.${config.fileFormat}?api_key=${Key.vectorTile}`;
    console.log(callURL);
    return callURL;
  }

  fetchTheTile(callURL) {
    this.domHelper.showLoadingBar();

    // get rid of current Tile from scene if there is any
    this.basicScene.removeObject('geoObjectsGroup');

    // get rid of current preview
    this.previewMap.destroy();

    // draw previewmap
    this.previewMap.drawData();

    d3.json(callURL, (err, json) => {
      if (err) {
        console.log(`Error during fetching json from the tile server ${err}`);
      } else {
        this.basicScene.addObject(this.bakeTile(json));
      }
      // Update hash value
      QueryChecker.updateQueryString({
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
    // var tileX, tileY, tileW, tileH;
    const projection = d3.geo.mercator()
      .center([store.getState().lon, store.getState().lat])
      .scale(1000000)
      .precision(0.0)
      .translate([0, 0]);

    // Will flip the Y coordinates that result from the geo projection
    const flipY = d3.geo.transform({
      point(x, y) {
        this.stream.point(x, -y);
      }
    });

    // Mercator Geo Projection then flipped in Y
    // Solution taken from http://stackoverflow.com/a/31647135/3049530
    const projectionThenFlipY = {
      stream(s) {
        return projection.stream(flipY.stream(s));
      }
    };
    const path = d3.geo.path().projection(projectionThenFlipY);

    const geoObj = this.tileConfig;
    for (var obj in json) { // eslint-disable-line
      const pathWithHeights = [];
      for (const geoFeature of json[obj].features) {
        const feature = path(geoFeature);
        // 'a' command is not implemented in d3-three, skipping for now.
        // 'a' is SVG path command for Ellpitic Arc Curve. https://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands
        if (feature.indexOf('a') < 0) {
          const mesh = this.dthreed.exportSVG(feature);

          const h = geoFeature.properties['height'] || geoObj[obj]['height'];  // eslint-disable-line

          pathWithHeights.push({
            threeMesh: mesh,
            height: h
          });
        }
      }
      geoObj[obj].paths = pathWithHeights;
    }

    const geoGroup = this.getThreeGroup(geoObj);
    geoGroup.translateX(-100 / ((-15 + store.getState().zoom) * 2)); //* 2);
    geoGroup.translateY(100 / ((-15 + store.getState().zoom) * 2)); //* 2);
    return geoGroup;
  }

  getThreeGroup(geoGroup) {  // eslint-disable-line
    const geoObjectsGroup = new THREE.Group();
    geoObjectsGroup.name = 'geoObjectsGroup';

    for (const feature of Object.keys(geoGroup)) {
      const color = geoGroup[feature]['color'] || new THREE.Color('#5c5c5c'); // eslint-disable-line
      const material = new THREE.MeshLambertMaterial({ color });
      for (const meshPath of geoGroup[feature].paths) {
        for (const eachMesh of meshPath.threeMesh) {
          const shape3d = eachMesh.extrude({
            amount: meshPath.height,
            bevelEnabled: false
          });
          geoObjectsGroup.add(new THREE.Mesh(shape3d, material));
        }
      }
    }
    return geoObjectsGroup;
  }


  enableDownloadLink() {
    const buildingObj = this.exportToObj();
    const exportA = document.getElementById('exportA');
    exportA.className = '';
    exportA.download = `tile-${store.getState().tileLon}-${store.getState().tileLat}-${store.getState().zoom}.obj`;

    const blob = new Blob([buildingObj], { type: 'text' });
    const url = URL.createObjectURL(blob);
    exportA.href = url;
  }

  exportToObj() {
    const result = this.objExporter.parse(this.basicScene.getScene);
    return result;
  }

}

export default TileExporter;
