import d3 from 'd3';
import store from '../../Redux/Store';
import Key from '../../Keys';
import { tile2Lon, tile2Lat } from './MapSpells';
import Exporter from './Exporter';

class BasicScene {

  constructor(domID) {
    const width = 100;
    const height = 100;

    this.svg = d3.select(`#${domID}`)
            .append('svg')
            .attr('width', width)
            .attr('height', height);
    this.tilePos = this.getTilePos(domID);
  }

  get config () {
    return {
      baseURL: 'https://tile.mapzen.com/mapzen/vector/v1',
      dataKind: 'all',
      fileFormat: 'json'
    };
  }

  getTilePos(domID) {
    // Figure out tile number based on Preview element's ID
    let tilePos = {
      ns: 0,
      ew: 0
    };

    const tilepos = domID.split('-');

    if (tilePos[1] === 'south') tilePos.ns = 1;
    if (tilePos[1] === 'north') tilePos.ns = -1;

    if (tilePos.length > 2) {
      if (tilePos[2] === 'east') tilePos.ew = 1;
      if (tilePos[2] === 'west') tilePos.ew = -1;
    }

    return tilePos
  }

  drawTheTile(url) {
    const zoom = store.getState().zoom;
    const previewProjection = d3.geo.mercator()
      .center([url.centerLatLon.lon, url.centerLatLon.lat])
      // This scale is carved based on zoom 16, fit into 100px * 100px rect
      .scale(600000 * (100 / 57) * Math.pow(2, (zoom - 16)))
      .precision(0)
      .translate([0, 0]);

    const svg = this.svg;

    d3.json(url.callURL, function (err, json) {
      for (let obj in json) { // eslint-disable-line
        if (err) console.log(`Error : +${err}`);
        else {
          for (let geoFeature of json[obj].features) { // eslint-disable-line
            const previewPath = d3.geo.path().projection(previewProjection);
            const previewFeature = previewPath(geoFeature);
            if (previewFeature.indexOf('a') > 0) ;
            else {
              svg.append('path')
                .attr('d', previewFeature);
            }
          }
        }
      }
    });
  }

  buildQueryURL() {
    const zoom = store.getState().zoom;

    const tLon = store.getState().tileLon + this.tilePos.ew;
    const tLat = store.getState().tileLat + this.tilePos.ns;

    const _callURL = `${this.config.baseURL}/${this.config.dataKind}/${zoom}/${tLon}/${tLat}.${this.config.fileFormat}?api_key=${Key.vectorTile}`;

    const _centerLatLon = {
      lat: tile2Lat(tLat, zoom),
      lon: tile2Lon(tLon, zoom)
    };

    return {
      callURL: _callURL,
      centerLatLon: _centerLatLon
    };
  }

  drawData() {
    this.drawTheTile(this.buildQueryURL());
  }

  destroy() {
    this.svg.selectAll('*').remove();
  }

}

module.exports = BasicScene;