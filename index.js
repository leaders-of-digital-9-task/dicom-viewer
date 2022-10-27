var app = new dwv.App();

var tools = {
  Draw: {
    options: ['Circle'],
    type: 'factory'
  }
};

app.init({
  dataViewConfigs: {'*': [{divId: 'layerGroup0'}]},
  tools: tools
});
// activate tool once done loading
app.addEventListener('load', function () {
  app.setTool('Draw');
  app.setDrawShape(tools.Draw.options[0]);
  //var layer = new dwv.gui.DrawLayer('layerGroup0')
  factory = new dwv.tool.draw.CircleFactory();
  var point1 = new dwv.math.Point2D(10, 10)
  var point2 = new dwv.math.Point2D(10, 100)
   var draw =  factory.create([point1, point2], app.getToolboxController().getSelectedTool().style, app.getActiveLayerGroup().getActiveViewLayer().getViewController())
    app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().add(draw)
   console.log(app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().getChildren()[0])
});
// load dicom data
app.loadURLs(['https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm']);