// import PreviewUnit from './PreviewUnit';
import store from '../../Redux/Store';
import { updatePointZoom } from '../../Redux/Action';

class QueryChecker {
  constructor(exporter) {
    QueryChecker.checkQueries(exporter);
  }

  static checkQueries(exporter) {
    const _lon = QueryChecker.getParameterByName('lon');
    const _lat = QueryChecker.getParameterByName('lat');
    let _zoom = QueryChecker.getParameterByName('zoom');

    if (_lon !== null && _lat !== null && _zoom !== null) {
      _zoom = _zoom.replace(/[^0-9]+/g, '');
      document.zoomRadio.zoomLevel.value = _zoom;
      store.dispatch(updatePointZoom({
        lat: _lat,
        lon: _lon,
        zoom: _zoom
      }));
      exporter.fetchTheTile(exporter.buildQueryURL());
      document.getElementById('exportBtn').disabled = false;
    }
  }

  static updateQueryString(paramObj) {
    const params = [];
    for (const key of Object.keys(paramObj)) {
      params.push(`${encodeURIComponent(key)}=${encodeURIComponent(paramObj[key])}`);
    }

    const newUrl = `${window.location.origin}${window.location.pathname}?${params.join('&')}`;
    window.history.replaceState({}, '', newUrl);
  }

  static getParameterByName(_name) {
    const url = window.location.href;
    const name = _name.replace(/[\[\]]/g, '\\$&'); // eslint-disable-line
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

}

export default QueryChecker;
