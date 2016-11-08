import { lon2tile, lat2tile } from '../Components/TileExporter/MapSpells';

const initialState = {
  lat: 40.71427,
  lon: -74.00597,
  tileLat: lat2tile(40.71427),
  tileLon: lon2tile(-74.00597),
  zoom: 16
};

function tileInfo(state = initialState, action = {}) {
  switch (action.type) {
    case 'updateLatLon':
      return {
        ...state,
        lat: action.lat,
        lon: action.lon,
        tileLat: lat2tile(action.lat, state.zoom),
        tileLon: lon2tile(action.lon, state.zoom)
      };
    case 'updateZoom':
      return {
        ...state,
        tileLat: lat2tile(parseFloat(state.lat), action.zoom),
        tileLon: lon2tile(parseFloat(state.lon), action.zoom),
        zoom: action.zoom
      };
    case 'updatePointZoom':
      return {
        zoom: action.zoom,
        lat: action.lat,
        lon: action.lon,
        tileLat: lat2tile(action.lat, action.zoom),
        tileLon: lon2tile(action.lon, action.zoom)
      };
    default:
      return state;
  }
}

export default tileInfo;

