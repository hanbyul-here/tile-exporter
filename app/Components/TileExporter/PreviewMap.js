import PreviewUnit from './PreviewUnit';

class PreviewMap {
  constructor(exporter) {
    this.previewSvgs = [
      new PreviewUnit('preview-north-east', exporter),
      new PreviewUnit('preview-north', exporter),
      new PreviewUnit('preview-north-west', exporter),
      new PreviewUnit('preview-center-east', exporter),
      new PreviewUnit('preview-center', exporter),
      new PreviewUnit('preview-center-west', exporter),
      new PreviewUnit('preview-south-east', exporter),
      new PreviewUnit('preview-south', exporter),
      new PreviewUnit('preview-south-west', exporter)
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
