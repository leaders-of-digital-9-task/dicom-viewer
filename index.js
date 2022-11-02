
var app = new dwv.App();


var circleFactory = new dwv.tool.draw.CircleFactory();
var roiFactory = new dwv.tool.draw.RoiFactory();
var freeHandFactory = new dwv.tool.draw.FreeHandFactory();
var rulerFactory = new dwv.tool.draw.RulerFactory();
var rectFactory = new dwv.tool.draw.RectangleFactory();
schema = []


var tools = {
  Scroll: {},
  Draw: {
    options: ['Circle', 'Roi', 'FreeHand', 'Ruler', 'Rectangle'],
    type: 'factory',
    events: ['drawcreate', 'drawchange', 'drawmove', 'drawdelete']
  },
  ZoomAndPan: {},
  WindowLevel: {},
  Filter: {},
  Livewire: {
    events: ['drawcreate', 'drawchange', 'drawmove', 'drawdelete']
  },
  Floodfill: {
    events: ['drawcreate', 'drawchange', 'drawmove', 'drawdelete']
  }
};

app.init({
  dataViewConfigs: {'*': [{divId: 'layerGroup0'}]},
  tools: tools
});
parent.postMessage({'type': 'getDicom', data: ""}, "*")

app.addEventListener('load', function () {

//   setTimeout(() => {
//     console.log(postRuler())
//   }, 3000)
  currentframeNumber = 0
  setFrame(0)
  app.setTool('Draw')
  app.setDrawShape('Circle')
  app.getActiveLayerGroup().getActiveDrawLayer().getKonvaStage().addEventListener('mouseup', () => {
    console.log(app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer())
    setTimeout(() => {
        parent.postMessage({'type': 'returnDraws', data: postDraws()}, "*")
        //console.log({'type': 'returnDraws', data: postDraws()})
    }, 100)
})
});

function loadSchema(schema) {
    console.log(schema, schema.length)
    urls = []
    picSchema = new Map()
    for (var i = 0; i < schema.length; ++i) {
        console.log(i)
        picSchema.set(schema[i].url, schema[i].figures)
        urls.push(schema[i].url)
    }
    app.loadURLs(urls)
    try{
        createDraws(schema[0].figures)
    } catch {}
    return [urls, picSchema]
}


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
    
    //draw.id(dwv.math.guid());
    draw.id("id")
    draw.draggable(true)
    draw.addEventListener('mouseover', () => {
        document.body.style.cursor = 'pointer'
    })
    draw.addEventListener('mouseout', () => {
        document.body.style.cursor = 'default'
    })
    //drawCommand = new dwv.tool.DrawGroupCommand(draw, 'circle-group', app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer()['.position-group'][0], false)
    posGroup = app.getActiveLayerGroup().getActiveDrawLayer().getDrawController().getCurrentPosGroup()
    console.log(app.getActiveLayerGroup().getActiveDrawLayer().getDrawController())
    posGroup.add(draw)
    app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().listening(true)
    //drawCommand.execute()
    //app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().find('.position-group')[0].add(draw)
}


function createRuler(rulerData) {
    app.setTool('Draw');
    var styles = app.getToolboxController().getSelectedTool().style
    points = rulerData.points.map((e) => {
        return new dwv.math.Point2D(e.x, e.y)
    })

    var draw = rulerFactory.create(
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


function createFreeHand(freeHandData) {
    app.setTool('Draw');
    var styles = app.getToolboxController().getSelectedTool().style
    points = freeHandData.points.map((e) => {
        return new dwv.math.Point2D(e.x, e.y)
    })

    var draw = freeHandFactory.create(
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

function createRectangle(rectangleData) {
    app.setTool('Draw');
    var styles = app.getToolboxController().getSelectedTool().style
    points = rectangleData.points.map((e) => {
        return new dwv.math.Point2D(e.x, e.y)
    })

    var draw = rectFactory.create(
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
        if (e.type == 'FreeHand') {
            createFreeHand(e)
        }
        if (e.type == 'Ruler') {
            createRuler(e.data)
        }
        if (e.type == 'Rectangle') {
            createRectangle(e.data)
        }
    })
}


function postCircles() {

    setTimeout(() => {
        console.log(app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().children[0].children)
    }, 100)
    // circlesAttrs = app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().getChildren().filter(e => e.attrs.name == 'circle-group').map(
    //     (e) => {
    //         //console.log(e)
    //         return e.children.filter(
    //             (ee) => {
    //                 return ee.attrs.name == 'shape'
    //             }
    //         ).map(eee => {return {attrs: eee.attrs, parent: e.attrs}})
    //     }
    // )
    circlesAttrs = []
    circlesAttrs = circlesAttrs.concat(app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().find('.circle-group').map((e) => {
        return e.children.filter((eee) => eee.attrs.name == 'shape').map(ee => {return {attrs: ee.attrs, parent: e.attrs}})
    }))
    //circleAttrs.concat(app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().children[0])
    return circlesAttrs.flat().map((e) => {
        return {
            type: 'Circle',
            center: {
                x: e.attrs.x,
                y: e.attrs.y
            },
            radius: e.attrs.radius,
            id: e.parent.id
        }
    })
}

function postRois() {
    roisAttrs = []
    roisAttrs = roisAttrs.concat(app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().find('.roi-group').map((e) => {
        return e.children.filter((e) => e.attrs.name == 'shape').map(e => {return {attrs: e.attrs, parent: e.parent.attrs}})
    }))
    return roisAttrs.flat().map((e) => {
        console.log(e)
        var points = [];
        for (var i = 0; i < e.attrs.points.length; i+=2) {
            points.push({x: e.attrs.points[i], y: e.attrs.points[i+1]})
        }
        return {
            type: 'Roi',
            points: points,
            id: e.parent.id
        }
    })
}

function postDraws() {
    return JSON.parse(JSON.stringify(
        postCircles().concat(postRois()).concat(postFreeHand()).concat(postRuler()).concat(postRects())
    ))
}

function postRects() {
    roisAttrs = []
    // setTimeout(() => {
    //     console.log(roisAttrs.concat(app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().find('.rectangle-group')), 'rect')
    // }, 1000)
    roisAttrs = roisAttrs.concat(app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().find('.rectangle-group').map((e) => {
        return e.children.filter((e) => e.attrs.name == 'shape').map(e => {return {attrs: e.attrs, parent: e.parent.attrs}})
    }))
    return roisAttrs.flat().map((e) => {
        e.attrs.points = [e.attrs.x, e.attrs.y, e.attrs.x+e.attrs.width, e.attrs.y+e.attrs.height]
        var points = [];
        for (var i = 0; i < e.attrs.points.length; i+=2) {
            points.push({x: e.attrs.points[i], y: e.attrs.points[i+1]})
        }
        return {
            type: 'Rectangle',
            points: points,
            id: e.parent.id
        }
    })
}

function postFreeHand() {
    roisAttrs = []
    roisAttrs = roisAttrs.concat(app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().find('.freeHand-group').map((e) => {
        return e.children.filter((e) => e.attrs.name == 'shape').map(e => {return {attrs: e.attrs, parent: e.parent.attrs}})
    }))
    return roisAttrs.flat().map((e) => {
        var points = [];
        for (var i = 0; i < e.attrs.points.length; i+=2) {
            points.push({x: e.attrs.points[i], y: e.attrs.points[i+1]})
        }
        return {
            type: 'FreeHand',
            points: points,
            id: e.parent.id
        }
    })
}

function postRuler() {
    roisAttrs = []
    roisAttrs = roisAttrs.concat(app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().find('.ruler-group').map((e) => {
        return e.children.filter((e) => e.attrs.name == 'shape').map(e => {return {attrs: e.attrs, parent: e.parent.attrs}})
    }))
    return roisAttrs.flat().map((e) => {
        var points = [];
        for (var i = 0; i < e.attrs.points.length; i+=2) {
            points.push({x: e.attrs.points[i], y: e.attrs.points[i+1]})
        }
        return {
            type: 'Ruler',
            points: points,
            id: e.parent.id
        }
    })
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
        } else if (data.data == 'Roi' || data.data == 'Circle' || data.data == 'FreeHand' || data.data == 'Ruler' || data.data == 'Rectangle'){
          app.setTool('Draw');
          app.setDrawShape(data.data);
        }
        else if (data.data == 'ZoomAndPan') {
            app.setTool('ZoomAndPan');
        }
        else if (data.data == 'WindowLevel') {
            app.setTool('WindowLevel')
        }else {
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
      else if (data.type == 'deleteSelected') {
        app.getActiveLayerGroup().getActiveDrawLayer().getKonvaStage().find('#'+findActive())[0].destroy()
        parent.postMessage({'type': 'returnDrawsDelete', data: postDraws()}, "*")

      }
      else if (data.type == 'setContrast') {
        document.getElementById("layerGroup0").style = `filter: contrast(${data.data}%);`
      }
      else if (data.type == 'deleteById') {
        app.getActiveLayerGroup().getActiveDrawLayer().getKonvaStage().find("#"+data.data)[0].destroy()
      }
      else if (data.type == 'loadSchema') {
        schema = loadSchema(data.data)
      }
      else if (data.type == 'setIndex') {
        setFrame(data.data)
      }
}
window.addEventListener("message", receiveMessage, false);


function findActive() {
    activeCandidates = app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().getChildren().map(
        (e) => {
            return e.children.filter(
                (ee) => {
                    return ee.attrs.name == 'anchor'
                }
            )
        }
    )
    activeCandidates = activeCandidates.concat(app.getActiveLayerGroup().getActiveDrawLayer().getKonvaLayer().children[0].children.map((e) => {
        return e.children.filter((e) => e.attrs.name == 'anchor')
    }))
    active = new Set(activeCandidates.flat().map(e => e.parent.id()))
    return [...active][0]
}


app.addEventListener('loadend', function () {
  //range.max = app.getImage(0).getGeometry().getSize().get(2) - 1;
});

app.addEventListener('drawchange', (e) => {
    console.log(e)
})


schema = [
    {
        'url': 'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm',
        'figures': [
            {type: 'Circle', center: {x: 10, y: 100}, radius: 10},
            {type: 'Roi', points: [{x: 10, y: 20}, {x: 100, y: 50}]}
        ]
    },
    {
        'url': 'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323707.dcm',
        'figures': [
            {type: 'Circle', center: {x: 10, y: 200}, radius: 10},
            {type: 'Roi', points: [{x: 10, y: 30}, {x: 100, y: 50}]}
        ]
    }
]

// console.log(schema[0], "0")

//app.loadURLs(schema[0])


// app.loadURLs([
//     'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm',
//     'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323707.dcm',
//     'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323563.dcm'
// ])
currentframeNumber = 0
function setFrame(frameNumber) {
    var lg = app.getLayerGroupById(0);
    var vc = lg.getActiveViewLayer().getViewController();
    var index = vc.getCurrentIndex();
    var values = index.getValues();
    pics = schema[1].get(schema[0][frameNumber])
    schema[1].set(schema[0][currentframeNumber], postDraws())
    console.log(schema)
    values[2] = frameNumber;
    vc.setCurrentIndex(new dwv.math.Index(values));
    loadPictures(
        pics
    )
    app.setTool('Draw')
    currentframeNumber = frameNumber
}

function loadPictures(pictures) {
    console.log(pictures)
    // app.deleteDraws()
    deleteDraws()
    createDraws({data: pictures})
}

function deleteDraws() {
    app.getActiveLayerGroup().getActiveDrawLayer().getKonvaStage().find('.circle-group').map((e) => e.destroy())
    app.getActiveLayerGroup().getActiveDrawLayer().getKonvaStage().find('.roi-group').map((e) => e.destroy())
    app.getActiveLayerGroup().getActiveDrawLayer().getKonvaStage().find('.freeHand-group').map((e) => e.destroy())
    app.getActiveLayerGroup().getActiveDrawLayer().getKonvaStage().find('.rectangle-group').map((e) => e.destroy())
    app.getActiveLayerGroup().getActiveDrawLayer().getKonvaStage().find('.ruler-group').map((e) => e.destroy())
}

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

