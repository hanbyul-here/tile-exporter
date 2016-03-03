import Redux, { createStore, compose, combineReducers } from 'redux';


const initialState = {
  lat:  40.71427,
  lon: -74.00597,
  zoom: 16

}

function tileInfo(state = initialState, action = {}) {

  switch(action.type) {
    case 'updateLatLon':
      return {
        ...state,
        lat: action.lat,
        lon: action.lon
      };
    case 'updateZoom':
      return {
        ...state,
        zoom: action.zoom
      }
    case 'updatePointZoom':
      return {
        zoom: action.zoom,
        lat: action.lat,
        lon: action.lon
      }
    default:
      return state;
  }
}

module.exports = tileInfo;

