import d3 from 'd3';
import { tile2Lon, tile2Lat } from './MapSpells';

import Key from '../../Keys';

import store from '../../Redux/Store';

let PreviewMap = (function () {


  // let neSvg, nSvg, nwSvg, eSvg, svg, wSvg, seSvg, sSvg, swSvg;

  // let tileLon, tileLat;

  const config = {
    baseURL: 'https://tile.mapzen.com/mapzen/vector/v1',
    dataKind: 'all',
    fileFormat: 'json'
  };

  function init() {
    const width = 100;
    const height = 100;

    this.neSvg = d3.select('#preview-north-east')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

    this.nSvg = d3.select('#preview-north')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

    this.nwSvg = d3.select('#preview-north-west')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

    this.eSvg = d3.select('#preview-east')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

    this.svg = d3.select('#preview-center')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

    this.wSvg = d3.select('#preview-west')
            .append('svg')
            .attr('width', width)
            .attr('height', height);


    this.seSvg = d3.select('#preview-south-east')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

    this.sSvg = d3.select('#preview-south')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

    this.swSvg = d3.select('#preview-south-west')
            .append('svg')
            .attr('width', width)
            .attr('height', height);
  }

  function buildQueryURL(eastWest, northSouth) {
    const zoom = store.getState().zoom;

    const tLon = this.tileLon += eastWest;
    const tLat = this.tileLat += northSouth;

    const _callURL = `${config.baseURL}/${config.dataKind}/${zoom}/${tLon}/${tLat}.${config.fileFormat}?api_key=${Key.vectorTile}`;

    const _centerLatLon = {
      lat: tile2Lat(tLat, zoom),
      lon: tile2Lon(tLon, zoom)
    };

    return {
      callURL: _callURL,
      centerLatLon: _centerLatLon
    };
  }

  function drawTheTile(url, element) {
    const zoom = store.getState().zoom;
    const previewProjection = d3.geo.mercator()
      .center([url.centerLatLon.lon, url.centerLatLon.lat])
      // This scale is carved based on zoom 16, fit into 100px * 100px rect
      .scale(600000 * (100 / 57) * Math.pow(2, (zoom - 16)))
      .precision(0)
      .translate([0, 0]);

    d3.json(url.callURL, function (err, json) {
      for (let obj in json) { // eslint-disable-line
        if (err) console.log(`Error : +${err}`);
        else {
          for (let geoFeature of json[obj].features) { // eslint-disable-line
            const previewPath = d3.geo.path().projection(previewProjection);
            const previewFeature = previewPath(geoFeature);
            if (previewFeature.indexOf('a') > 0) ;
            else {
              element.append('path')
                .attr('d', previewFeature);
            }
          }
        }
      }
    });
  }

  function _drawData(_tileLon, _tileLat) {
    this.tileLon = _tileLon;
    this.tileLat = _tileLat;

    drawTheTile(buildQueryURL(1, -1), neSvg);
    drawTheTile(buildQueryURL(0, -1), nSvg);
    drawTheTile(buildQueryURL(-1, -1), nwSvg);

    drawTheTile(buildQueryURL(1, 0), eSvg);
    drawTheTile(buildQueryURL(0, 0), svg);
    drawTheTile(buildQueryURL(-1, 0), wSvg);

    drawTheTile(buildQueryURL(1, 1), seSvg);
    drawTheTile(buildQueryURL(0, 1), sSvg);
    drawTheTile(buildQueryURL(-1, 1), swSvg);
  }

  function _destroy() {
    neSvg.selectAll('*').remove();
    nSvg.selectAll('*').remove();
    nwSvg.selectAll('*').remove();
    eSvg.selectAll('*').remove();
    svg.selectAll('*').remove();
    wSvg.selectAll('*').remove();
    seSvg.selectAll('*').remove();
    sSvg.selectAll('*').remove();
    swSvg.selectAll('*').remove();
  }


  init();

  return {
    drawData: _drawData,
    destroy: _destroy
  };
})();


module.exports = PreviewMap;
