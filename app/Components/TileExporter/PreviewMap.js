import d3 from 'd3'

import Key from '../../Keys'

import store from '../../Redux/Store'
import {updateZoom, updatePointZoom} from '../../Redux/Action'
import reducer from '../../Redux/Reducer'


var PreviewMap = (function() {

  var width,height;
  var neSvg, nSvg, nwSvg, eSvg, svg, wSvg, seSvg, sSvg, swSvg;

  var previewProjection;


  var config = {
    baseURL: "http://vector.mapzen.com/osm",
    dataKind: "earth,water,buildings",
    fileFormat: "json"
  }

  function init() {

    width = 100;
    height = 100;

    neSvg = d3.select('#preview-north-east')
            .append('svg')
            .attr('width',width)
            .attr('height',height);

    nSvg = d3.select('#preview-north')
            .append('svg')
            .attr('width',width)
            .attr('height',height);

    nwSvg = d3.select('#preview-north-west')
            .append('svg')
            .attr('width',width)
            .attr('height',height);

    eSvg = d3.select('#preview-east')
            .append('svg')
            .attr('width',width)
            .attr('height',height);

    svg = d3.select('#preview-center')
            .append('svg')
            .attr('width',width)
            .attr('height',height);

    wSvg = d3.select('#preview-west')
            .append('svg')
            .attr('width',width)
            .attr('height',height);


    seSvg = d3.select('#preview-south-east')
            .append('svg')
            .attr('width',width)
            .attr('height',height);

    sSvg = d3.select('#preview-south')
            .append('svg')
            .attr('width',width)
            .attr('height',height);

    swSvg = d3.select('#preview-south-west')
            .append('svg')
            .attr('width',width)
            .attr('height',height);

  }

  function drawData() {

    drawTheTile(buildQueryURL(1,-1), neSvg)
    drawTheTile(buildQueryURL(0,-1), nSvg)
    drawTheTile(buildQueryURL(-1,-1), nwSvg)

    drawTheTile(buildQueryURL(1,0), eSvg)
    drawTheTile(buildQueryURL(0,0), svg)
    drawTheTile(buildQueryURL(-1,0), wSvg)

    drawTheTile(buildQueryURL(1,1), seSvg)
    drawTheTile(buildQueryURL(0,1), sSvg)
    drawTheTile(buildQueryURL(-1,1), swSvg)

  }

  function drawTheTile(url, element) {

    var zoom = store.getState().zoom

    d3.json(url.callURL, function(err,json) {
            previewProjection = d3.geo.mercator()
      .center([url.centerLatLon.lon, url.centerLatLon.lat])
      //this are carved based on zoom 16, fit into 100px * 100px rect
      .scale(600000* 100/57 * Math.pow(2,(zoom-16)))
      .precision(.0)
      .translate([0, 0])

    if(err) console.log('err!');

    else {
      for(var obj in json) {
        var j;

        for(j = 0; j< json[obj].features.length; j++) {
          var geoFeature = json[obj].features[j];
          var previewPath = d3.geo.path().projection(previewProjection);
          var previewFeature = previewPath(geoFeature);

          if(previewFeature !== undefined) {
             if(previewFeature.indexOf('a') > 0) ;
             else {
              element.append('path')
                .attr('d', previewFeature);
              }
            }
          }
        }
      }
    })
  }

  function destroy() {

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


  function buildQueryURL(eastWest, northSouth) {

    var inputLon = store.getState().lon; //parseFloat(lon);//-74.0059700;
    var inputLat = store.getState().lat;//parseFloat(lat);//40.7142700;
    var zoom = store.getState().zoom;

    //falttening geocode by converting them to mercator tile nums
    var tLon = long2tile(inputLon, zoom) + eastWest;
    var tLat = lat2tile(inputLat , zoom) + northSouth;


    var callURL =  config.baseURL + '/' + config.dataKind + '/' + zoom + '/' + tLon + '/' + tLat + '.' + config.fileFormat + '?api_key=' + Key.vectorTile;


    var centerLatLon =  {
      lat: tile2Lat(tLat, zoom),
      lon: tile2Lon(tLon, zoom)
    }
    return {
      callURL: callURL,
      centerLatLon: centerLatLon
    }
  }


  init();

  return {
    drawData: drawData,
    destroy: destroy
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
  return (tileLon*360/Math.pow(2,zoom)-180);
}

function tile2Lat(tileLat, zoom) {
  return ((360/Math.PI) * Math.atan(Math.pow( Math.E, (Math.PI - 2*Math.PI*tileLat/(Math.pow(2,zoom)))))-90);
}

module.exports = PreviewMap

// import d3 from 'd3'

// var PreviewMap = (function() {

//   var width,height;
//   var svg;


//   function init() {

//     width = 100;
//     height = 100;

//     svg = d3.select('#svg-preview-map')
//             .append('svg')
//             .attr('width',width)
//             .attr('height',height);
//   }

//   function drawData(feature) {

//     svg.append('path')
//       .attr('class','preview-path')
//       .attr('d', feature);
//   }

//   function destroy() {
//     svg.selectAll('*').remove();
//   }

//   init();

//   return {
//     drawData: drawData,
//     destroy: destroy
//   }
// })();

// module.exports = PreviewMap;