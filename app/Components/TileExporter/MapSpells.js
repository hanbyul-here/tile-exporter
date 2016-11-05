// Convert lat/lon to mercator style number
function lon2tile(lon, zoom) {
  return (Math.round((lon+180)/360*Math.pow(2,zoom)));
}
function lat2tile(lat ,zoom)  {
  return (Math.round((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom)));
}
// Reverse functions of the one above to navigate tiles
// Functions done by Matt Blair https://github.com/blair1618 Thank you :)

function tile2Lon(tileLon, zoom) {
  return (tileLon*360/Math.pow(2,zoom)-180).toFixed(7);
}

function tile2Lat(tileLat, zoom) {
  return ((360/Math.PI) * Math.atan(Math.pow( Math.E, (Math.PI - 2*Math.PI*tileLat/(Math.pow(2,zoom)))))-90).toFixed(7);
}

module.exports = { lon2tile, lat2tile, tile2Lon, tile2Lat };
