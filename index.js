
var app = new dwv.App();


var circleFactory = new dwv.tool.draw.CircleFactory();
var roiFactory = new dwv.tool.draw.RoiFactory();


var tools = {
  Scroll: {},
  Draw: {
    options: ['Circle', 'Roi'],
    type: 'factory'
  },
  ZoomAndPan: {},
  WindowLevel: {},
  Filter: {}
};

app.init({
  dataViewConfigs: {'*': [{divId: 'layerGroup0'}]},
  tools: tools
});

parent.postMessage({'type': 'getDicom', data: ""}, "*")

app.addEventListener('load', function () {
  app.setTool('Draw');
  app.setDrawShape('Circle')
});


function createCircle(circleData) {
    var point1 = new dwv.math.Point2D(circleData.center.x, circleData.center.y)
    var point2 = new dwv.math.Point2D(circleData.center.x, circleData.center.y+circleData.radius)
    app.setTool('Draw');
    var styles = app.getToolboxController().getSelectedTool().style
    app.undo()
    var draw = circleFactory.create(
        [point1, point2], 
        styles,
        app.getActiveLayerGroup().getActiveViewLayer().getViewController()
    )
    
    draw.id(dwv.math.guid());
    draw.draggable(true)
    draw.addEventListener('mouseover', () => {
        document.body.style.cursor = 'pointer'
    })
    draw.addEventListener('mouseout', () => {
        document.body.style.cursor = 'default'
    })
    //drawCommand = new dwv.tool.DrawGroupCommand(draw, 'circle-group', app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer()['.position-group'][0], false)
    posGroup = app.getActiveLayerGroup().getActiveDrawLayer().getDrawController().getCurrentPosGroup()
    posGroup.add(draw)
    app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().listening(true)
    //drawCommand.execute()
    //app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().find('.position-group')[0].add(draw)
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
    draw.id(dwv.math.guid());
    draw.draggable(true)
    draw.addEventListener('mouseover', () => {
        document.body.style.cursor = 'pointer'
    })
    draw.addEventListener('mouseout', () => {
        document.body.style.cursor = 'default'
    })
    //drawCommand = new dwv.tool.DrawGroupCommand(draw, 'circle-group', app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer()['.position-group'][0], false)
    posGroup = app.getActiveLayerGroup().getActiveDrawLayer().getDrawController().getCurrentPosGroup()
    posGroup.add(draw)
    app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().listening(true)

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
    roisAttrs = app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().getChildren().filter(e => e.attrs.name == 'roi-group').map(
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
    roisAttrs = roisAttrs.concat(app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().children[0].children.filter(e => e.attrs.name == 'roi-group').map((e) => {
        return e.children.filter((e) => e.attrs.name == 'shape').map(e => e.attrs)
    }))
    return roisAttrs.flat().map((e) => {
        var points = [];
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
        } else if (data.data == 'Roi' || data.data == 'Circle'){
          app.setTool('Draw');
          app.setDrawShape(data.data);
        }
        else if (data.data == 'ZoomAndPan') {
            app.setTool('ZoomAndPan');
        }
        else if (data.data == 'WindowLevel') {
            app.setTool('WindowLevel')
        }
      }
      else if (data.type == 'setDraws') {
        createDraws(data)
      }
      else if (data.type == 'getDraws') {
        parent.postMessage({'type': 'returnDraws', data: postDraws()}, "*")
      }
      else if (data.type == 'deleteSelected') {
        app.getActiveLayerGroup().getActiveDrawLayer().getKonvaStage().find('#'+findActive())[0].destroy()
      }
      else if (data.type == 'setContrast') {
        document.getElementById("layerGroup0").style = `filter: contrast(${data.data}%);`
      }
}
window.addEventListener("message", receiveMessage, false);


function findActive() {
    activeCandidates = app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().getChildren().map(
        (e) => {
            return e.children.filter(
                (ee) => {
                    console.log(e)
                    return ee.attrs.name == 'anchor'
                }
            )
        }
    )
    activeCandidates = activeCandidates.concat(app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().children[0].children.map((e) => {
        return e.children.filter((e) => e.attrs.name == 'anchor')
    }))
    active = new Set(activeCandidates.flat().map(e => e.parent.id()))
    console.log(activeCandidates, active)
    return [...active][0]
}


app.addEventListener('loadend', function () {
  //range.max = app.getImage(0).getGeometry().getSize().get(2) - 1;
});

app.loadURLs(['https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm'])

app.addEventListener('load', () => {
    
    // createCircle({
    //     type: 'Circle',
    //     center: {
    //         x: 10, y: 100
    //     },
    //     radius: 100
    // })
    // setTimeout(() => {
    //     console.log(app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().children)
    // }, 3000)
    // createRoi({
    //     type: 'Roi',
    //     points: [
    //         {
    //             x: 100, y: 100
    //         },
    //         {
    //             x: 10, y: 100
    //         }
    //     ]
    // })
    // app.setDrawShape('Roi')
    // setTimeout(() => {
    // }, 3000)
    // setTimeout(() => {
    // }, 5000)
})

app.addEventListener('slicechange', function () {
  // update slider on slice change (for ex via mouse wheel)
  var lg = app.getLayerGroupById(0);
  var vc = lg.getActiveViewLayer().getViewController();
  range.value = vc.getCurrentPosition().k;
});
// range.oninput = function () {
//   var lg = app.getLayerGroupById(0);
//   var vc = lg.getActiveViewLayer().getViewController();
//   var index = vc.getCurrentIndex();
//   var values = index.getValues();
//   values[2] = this.value;
//   vc.setCurrentIndex(new dwv.math.Index(values));
// }

