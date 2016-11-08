// import PreviewUnit from './PreviewUnit';
import store from '../../Redux/Store'
import { updatePoint, updatePointZoom } from '../../Redux/Action';

class QueryChecker {
  constructor(exporter) {
    this.checkQueries(exporter);
  }

  checkQueries(exporter) {
    var _lon = this.getParameterByName('lon');
    var _lat = this.getParameterByName('lat');
    var _zoom = this.getParameterByName('zoom');

    if(_lon !== null && _lat !== null && _zoom !== null) {

      _zoom = _zoom.replace(/[^0-9]+/g, '');
      document.zoomRadio.zoomLevel.value = _zoom;
      store.dispatch(updatePointZoom({
        lat: _lat,
        lon: _lon,
        zoom: _zoom
      }))
      exporter.fetchTheTile(exporter.buildQueryURL());
      document.getElementById('exportBtn').disabled  = false;
    }
  }

  updateQueryString(paramObj) {
    var url = window.location.origin + window.location.pathname;
    var newUrl = url + '?';
    var params = [];
    for(var key in paramObj) {
      params.push(encodeURIComponent(key) + "=" + encodeURIComponent(paramObj[key]));
    }
    newUrl += params.join("&");
    window.history.replaceState({},'',newUrl);
  }

  getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

}

export default QueryChecker;
