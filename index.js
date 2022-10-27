var filterList = ['Threshold', 'Sharpen', 'Sobel'];

var shapeList = [
  'Arrow',
  'Ruler',
  'Protractor',
  'Rectangle',
  'Roi',
  'Ellipse',
  'Circle',
  'FreeHand'
];

var toolList = {
  Scroll: {},
  Opacity: {},
  WindowLevel: {},
  ZoomAndPan: {},
  Draw: {
    options: shapeList,
    type: 'factory',
    events: ['drawcreate', 'drawchange', 'drawmove', 'drawdelete']
  },
  Livewire: {
    events: ['drawcreate', 'drawchange', 'drawmove', 'drawdelete']
  },
  Filter: {
    options: filterList,
    type: 'instance',
    events: ['filterrun', 'filterundo']
  },
  Floodfill: {
    events: ['drawcreate', 'drawchange', 'drawmove', 'drawdelete']
  }
};

// initialise the application
var options = {
  dataViewConfigs: {'*': [{divId: 'layerGroup0'}]},
  tools: toolList
};

// main application
var app = new dwv.App();
app.init(options);
// activate tool once done loading
app.addEventListener('load', function () {
  app.setTool('Scroll');

  app.setTool('Draw');
  app.setDrawShape(toolList.Draw.options[0]);

});


function receiveMessage(event)
{
      console.log(event.data, "FFFFFFFFF")
      let data = JSON.parse(event.data)
      if (data.type == "setDicom"){
        app.loadURLs([data.data])
      } else if(data.type == "setTool"){
        app.setTool('Draw');
        app.setDrawShape("Circle");
      }
}
window.addEventListener("message", receiveMessage, false);


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
