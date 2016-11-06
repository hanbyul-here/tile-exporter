import PreviewUnit from './PreviewUnit';

class PreviewMap {
  constructor() {
    this.previewSvgs = [
      new PreviewUnit('preview-north-east'),
      new PreviewUnit('preview-north'),
      new PreviewUnit('preview-north-west'),
      new PreviewUnit('preview-center-east'),
      new PreviewUnit('preview-center'),
      new PreviewUnit('preview-center-west'),
      new PreviewUnit('preview-south-east'),
      new PreviewUnit('preview-south'),
      new PreviewUnit('preview-south-west')
    ];
  }

  drawData() {
    this.previewSvgs.map(svg => svg.drawData());
  }

  destroy() {
    this.previewSvgs.map(svg => svg.destroy());
  }
}

export default PreviewMap;
