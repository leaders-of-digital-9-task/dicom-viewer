
var app = new dwv.App();

var tools = {
  Scroll: {},
  Draw: {
    options: ['Circle', 'Roi'],
    type: 'factory'
  }
};

app.init({
  dataViewConfigs: {'*': [{divId: 'layerGroup0'}]},
  tools: tools
});
app.addEventListener('load', function () {
  app.setTool('Scroll');

  //var layer = new dwv.gui.DrawLayer('layerGroup0')
//   factory = new dwv.tool.draw.CircleFactory();
//   var point1 = new dwv.math.Point2D(10, 10)
//   var point2 = new dwv.math.Point2D(10, 100)
//    var draw =  factory.create([point1, point2], app.getToolboxController().getSelectedTool().style, app.getActiveLayerGroup().getActiveViewLayer().getViewController())
//     app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().add(draw)
//    console.log(app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().getChildren()[0])
});


function receiveMessage(event)
{
      console.log(event.data, "FFFFFFFFF")
      let data = JSON.parse(event.data)
      if (data.type == "setDicom"){
        app.loadURLs([data.data])
      } else if(data.type == "setTool"){
        if (data.data == "null"){
          app.setTool('Scroll');
        } else{
          app.setTool('Draw');
          app.setDrawShape(data.data);
        }

      }
}
window.addEventListener("message", receiveMessage, false);



app.addEventListener("drawchange", function (){
  console.log("DRAWWWWWW")
})




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
