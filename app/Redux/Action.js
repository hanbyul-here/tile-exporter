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

export function updatePointZoom(latLonZoom) {
  console.log(latLonZoom)
  return {
    type: 'updatePointZoom',
    lat: latLonZoom.lat,
    lng: latLonZoom.lon,
    zoom: latLonZoom.zoom
  }
}

