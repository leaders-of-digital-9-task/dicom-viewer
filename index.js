
var app = new dwv.App();


var circleFactory = new dwv.tool.draw.CircleFactory();
var roiFactory = new dwv.tool.draw.RoiFactory();


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

function createCircle(circleData) {
    var point1 = new dwv.math.Point2D(circleData.center.x, circleData.center.y)
    var point2 = new dwv.math.Point2D(circleData.center.x, circleData.center.y+circleData.radius)
    app.setTool('Draw');
    var styles = app.getToolboxController().getSelectedTool().style
    var draw = circleFactory.create(
        [point1, point2], 
        styles,
        app.getActiveLayerGroup().getActiveViewLayer().getViewController()
    )
    app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().add(draw)
}


function createRoi(circleData) {
    app.setTool('Draw');
    var styles = app.getToolboxController().getSelectedTool().style
    points = circleData.points.map((e) => {
        return new dwv.math.Point2D(e.x, e.y)
    })

    var draw = roiFactory.create(
        points, 
        styles, 
        app.getActiveLayerGroup().getActiveViewLayer().getViewController()
    )
    app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().add(draw)

}


function createDraws(drawsData) {
    drawsData.data.map((e) => {
        if (e.type == 'Circle') {
            createCircle(e)
        }
        if (e.type == 'Roi') {
            createRoi(e)
        }
    })
}


function postCircles() {
    console.log(app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().children)
    circlesAttrs = app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().getChildren().filter(e => e.attrs.name == 'circle-group').map(
        (e) => {
            console.log(e, "eeeeee")
            return e.children.filter(
                (ee) => {
                    console.log(e)
                    return ee.attrs.name == 'shape'
                }
            ).map(e => e.attrs)
        }
    )
    circlesAttrs = circlesAttrs.concat(app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().children[0].children.filter(e => e.attrs.name == 'circle-group').map((e) => {
        return e.children.filter((e) => e.attrs.name == 'shape').map(e => e.attrs)
    }))
    //circleAttrs.concat(app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().children[0])
    return circlesAttrs.flat().map((e) => {
        return {
            type: 'Circle',
            center: {
                x: e.x,
                y: e.y
            },
            radius: e.radius
        }
    })
}

function postRois() {
    console.log(app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().children)
    return app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().children.filter(
        e => e.attrs.name == 'roi-group'
    ).map(e => {
        return e.children.filter(e => e.attrs.name == 'shape')[0].attrs
    }).flat().map((e) => {
        var points = []
        for (var i = 0; i < e.points.length; i+=2) {
            points.push({x: e.points[i], y: e.points[i+1]})
        }
        return {
            type: 'Roi',
            points: points
        }
    })
}


function postDraws() {
    return postCircles().concat(postRois())
}


function receiveMessage(event)
{
      console.log(event.data, "FFFFFFFFF")
      let data = undefined;
      try{
        data = event.data
      }
      catch{
        return
      }
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
      else if (data.type == 'setDraws') {
        createDraws(data)
      }
      else if (data.type == 'getDraws') {
        parent.postMessage({'type': 'returnDraws', data: postDraws()}, "*")
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

app.loadURLs(['https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm'])

app.addEventListener('load', () => {
    app.setTool('Draw')
    createCircle({
        type: 'Circle',
        center: {
            x: 10, y: 100
        },
        radius: 100
    })
    app.setDrawShape('Roi')
    setTimeout(() => {
        app.setDrawShape('Circle')
    }, 3000)
    setTimeout(() => {
        console.log(postRois())
    }, 2000)
})

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

