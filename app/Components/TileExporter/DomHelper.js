import store from '../../Redux/Store';
import { updateZoom } from '../../Redux/Action';

class DomHelper {
  constructor(exporter) {
    this.exporter = exporter;
    this.latElem = document.getElementById('lat');
    this.lonElem = document.getElementById('lon');
    this.loadingBar = document.getElementById('loading-bar');
  }

  attachEvents() {
    this._attachExportBtnEvent();
    DomHelper.attachZoomBtnEvent();
    DomHelper.attachControlPanelEvent();
  }

  _attachExportBtnEvent() {
    // Export button event
    const exportBtn = document.getElementById('exportBtn');

    exportBtn.addEventListener('click', () => {
      this.exporter.fetchTheTile(this.exporter.buildQueryURL());
    });
  }

  static attachZoomBtnEvent() {
    // Zoom button event
    const zoomRad = document.zoomRadio.zoomLevel;
    for (const zoomBtn of zoomRad) {
      zoomBtn.addEventListener('click', () => {
        const zoomLevel = parseInt(zoomBtn.value, 10);
        store.dispatch(updateZoom(zoomLevel));
      });
    }
  }

  static attachControlPanelEvent() {
    // Mobile UI (show hide-control button)
    const mainControl = document.getElementById('main-control');
    const toggleBtn = document.getElementById('hide-toggle');

    toggleBtn.addEventListener('click', () => {
      if (mainControl.style.display !== 'none') {
        mainControl.style.display = 'none';
        this.innerHTML = 'Show control';
      } else {
        mainControl.style.display = 'block';
        this.innerHTML = 'Hide control';
      }
    });
  }

  showLoadingBar() {
    this.loadingBar.style.display = 'block';
  }

  hideLoadingBar() {
    this.loadingBar.style.display = 'none';
  }

  displayCoord() {
    this.latElem.innerHTML = store.getState().lat;
    this.lonElem.innerHTML = store.getState().lon;
  }
}

export default DomHelper;
