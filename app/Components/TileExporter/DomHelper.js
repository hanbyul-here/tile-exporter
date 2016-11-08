import store from '../../Redux/Store';
import { updateZoom } from '../../Redux/Action';

class DomHelper {
  constructor(exporter) {
    this.exporter = exporter;
    //this.queryChecker = queryChecker;
    this.latElem = document.getElementById('lat');
    this.lonElem = document.getElementById('lon');
    this.loadingBar = document.getElementById('loading-bar');
  }

  attachEvents() {
    this.attachExportBtnEvent();
    this.attachZoomBtnEvent();
    this.attachControlPanelEvent();
  }

  attachExportBtnEvent() {
    // Export button event
    const exportBtn = document.getElementById('exportBtn');

    exportBtn.addEventListener('click', () => {
      this.exporter.fetchTheTile(this.exporter.buildQueryURL());
    });
  }
  attachZoomBtnEvent() {
    // Zoom button event
    const zoomRad = document.zoomRadio.zoomLevel;
    let prev = null;

    for(let i = 0; i < zoomRad.length; i++) {
      zoomRad[i].onclick = function() {
        if(this !== prev) {
          prev = this;
        }
        let zoomLevel = parseInt(prev.value);
        store.dispatch(updateZoom(zoomLevel));
      }
    }
  }
  attachControlPanelEvent() {
    // Mobile UI (show hide-control button)
    const mainControl = document.getElementById('main-control');
    const toggleBtn = document.getElementById('hide-toggle');

    toggleBtn.addEventListener('click', () => {
      if(mainControl.style.display  !== 'none') {
        mainControl.style.display = 'none';
        this.innerHTML = 'Show control';
      }
      else {
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
