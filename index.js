// create the dwv app
var app = new dwv.App();
// initialise with the id of the container div
app.init({
  dataViewConfigs: {'*': [{divId: 'layerGroup0'}]},
  tools: {
    Scroll: {}
  }
});
// activate tool once done loading
app.addEventListener('load', function () {
  app.setTool('Scroll');
});
// load dicom data
app.loadURLs(['https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm','https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323707.dcm','https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323563.dcm']);

// 
var range = document.getElementById('sliceRange');
range.min = 0;
app.addEventListener('loadend', function () {
  range.max = app.getImage(0).getGeometry().getSize().get(2) - 1;
});
app.addEventListener('slicechange', function () {
  // update slider on slice change (for ex via mouse wheel)
  var lg = app.getLayerGroupById(0);
  var vc = lg.getActiveViewLayer().getViewController();
  range.value = vc.getCurrentPosition().k;
});
range.oninput = function () {
  var lg = app.getLayerGroupById(0);
  var vc = lg.getActiveViewLayer().getViewController();
  var index = vc.getCurrentIndex();
  var values = index.getValues();
  values[2] = this.value;
  vc.setCurrentIndex(new dwv.math.Index(values));
}
