function updatePoint(latLon) {
  return {
    type: 'updateLatLon',
    lat: parseFloat(latLon.lat),
    lon: parseFloat(latLon.lon)
  };
}

function updateZoom(zoomLevel) {
  return {
    type: 'updateZoom',
    zoom: parseInt(zoomLevel, 10)
  };
}

function updateTileNum(tileLatLon) {
  return {
    type: 'updateZoom',
    tileLat: parseInt(tileLatLon.lat, 10),
    tileLon: parseInt(tileLatLon.lon, 10)
  };
}

function updatePointZoom(latLonZoom) {
  return {
    type: 'updatePointZoom',
    lat: parseFloat(latLonZoom.lat),
    lon: parseFloat(latLonZoom.lon),
    zoom: parseInt(latLonZoom.zoom, 10)
  };
}

module.exports = { updatePoint, updateTileNum, updateZoom, updatePointZoom };
