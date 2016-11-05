import PreviewUnit from './PreviewUnit';
import { navigateTile } from './Exporter';

let PreviewMap = (function () {

  var previewSvgs;

  function init() {
    const neSvg = new PreviewUnit('preview-north-east');
    const nSvg = new PreviewUnit('preview-north');
    const nwSvg = new PreviewUnit('preview-north-west');
    const eSvg = new PreviewUnit('preview-center-east');
    const centerSvg = new PreviewUnit('preview-center');
    const wSvg = new PreviewUnit('preview-center-west');
    const seSvg = new PreviewUnit('preview-south-east');
    const sSvg = new PreviewUnit('preview-south');
    const swSvg = new PreviewUnit('preview-south-west');

    previewSvgs = {
      neS: neSvg,
      nS: nSvg,
      nwS: nwSvg,
      eS: eSvg,
      centerS: centerSvg,
      wS: wSvg,
      seS: seSvg,
      sS: sSvg,
      swS: swSvg,
    }
  }

  function _drawData() {
    for (let svg in previewSvgs) {
      previewSvgs[svg].drawData();
    }
  }

  function _destroy() {
    for (let svg in previewSvgs) {
      previewSvgs[svg].destroy()
    }
  }


  init();

  return {
    drawData: _drawData,
    destroy: _destroy
  };

})();


module.exports = PreviewMap;
