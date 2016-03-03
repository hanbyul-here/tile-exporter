export function updatePoint(latLon) {
  return {
    type: 'updateLatLon',
    lat: parseFloat(latLon.lat),
    lon: parseFloat(latLon.lon)
  }
}

export function updateZoom(zoomLevel) {
  return {
    type: 'updateZoom',
    zoom: parseInt(zoomLevel)
  }
}

export function updatePointZoom(latLonZoom) {
  return {
    type: 'updatePointZoom',
    lat: parseFloat(latLonZoom.lat),
    lon: parseFloat(latLonZoom.lon),
    zoom: parseInt(latLonZoom.zoom)
  }
}

