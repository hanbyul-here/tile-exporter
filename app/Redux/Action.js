export function updatePoint(latLon) {
  return {
    type: 'updateLatLon',
    lat: latLon.lat,
    lon: latLon.lon
  }
}

export function updateZoom(zoomLevel) {
  return {
    type: 'updateZoom',
    zoom: zoomLevel
  }
}

export function updatePointZoom(latLon, zoomLevel) {
  return {
    type: 'updatePointZoom',
    lat: latLon.lat,
    lng: latLon.lon,
    zoom: zoomLevel
  }
}

