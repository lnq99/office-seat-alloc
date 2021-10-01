import Konva from 'konva'
import Zone from './zone'
import Seat from './seat'
import Selection from './selection'

// debugger // eslint-disable-line no-debugger

const tr = new Konva.Transformer({
  boundBoxFunc: (oldBox, newBox) => newBox
})

class KonvaCanvas {
  constructor(id, width, height, control) {
    this.stage = new Konva.Stage({ container: id, width, height })
    const stage = this.stage

    this.layer = new Konva.Layer({ draggable: false })
    const layer = this.layer
    stage.add(layer)

    this.resultLayer = new Konva.Layer({ draggable: false })
    const resultLayer = this.resultLayer
    stage.add(resultLayer)

    const selection = new Selection()
    layer.add(selection)
    layer.add(tr)
    resultLayer.add(tr)

    this._addMetricLine(layer)

    stage.batchDraw()

    let mode = ''

    // start the rubber drawing on mouse down.
    stage.on('mousedown', function (e) {
      if (control.isCreatingZone) {
        mode = 'drawing'
        selection.startDrag({ x: e.evt.layerX, y: e.evt.layerY })
      }
    })

    // update the rubber rect on mouse move - note use of 'mode' var to avoid drawing after mouse released.
    stage.on('mousemove', function (e) {
      if (control.isCreatingZone) {
        if (mode === 'drawing') {
          selection.updateDrag({ x: e.evt.layerX, y: e.evt.layerY })
          stage.batchDraw()
        }
      }
    })

    // here we create the new rect using the location and dimensions of the drawing rect.
    stage.on('mouseup', function (e) {
      if (control.isCreatingZone) {
        mode = ''
        selection.visible(false)

        if (selection.width() + selection.height() > 5) {
          control.isCreatingZone = false

          let newRect = new Zone({
            x: selection.x(),
            y: selection.y(),
            width: selection.width(),
            height: selection.height()
          })

          console.log(newRect)

          layer.add(newRect)
          tr.nodes([newRect])
          stage.batchDraw()
        }
      }
    })

    // clicks should select/deselect shapes
    stage.on('click', function (e) {
      console.log(e.target)
      // if click on empty area - remove all selections
      if (e.target === stage) {
        tr.nodes([])
        return
      }

      // do nothing if clicked NOT on our rectangles
      if (!e.target.hasName('zone') && !e.target.hasName('seat')) {
        return
      }

      // do we pressed shift or ctrl?
      const metaPressed = e.evt.shiftKey || e.evt.ctrlKey
      const isSelected = tr.nodes().indexOf(e.target) >= 0

      if (!metaPressed && !isSelected) {
        // if no key pressed and the node is not selected
        // select just one
        tr.nodes([e.target])
        console.log(e.target.getInfo())
      } else if (metaPressed && isSelected) {
        // if we pressed keys and node was selected
        // we need to remove it from selection:
        const nodes = tr.nodes().slice() // use slice to have new copy of array
        // remove node from array
        nodes.splice(nodes.indexOf(e.target), 1)
        tr.nodes(nodes)
      } else if (metaPressed && !isSelected) {
        // add the node into selection
        const nodes = tr.nodes().concat([e.target])
        tr.nodes(nodes)
      }
    })
  }

  addSeats(seats) {
    // let seats = [
    //   [20, 20, 30, 20, 0],
    //   [50, 20, 30, 20, 0],
    //   [0, 0, 30, 20, 0]
    // ]

    seats.forEach((e) => {
      let newRect = new Seat({
        x: e[0],
        y: e[1],
        width: e[2],
        height: e[3],
        rotation: e[4]
      })
      this.resultLayer.add(newRect)
    })
  }

  removeSelected() {
    tr.nodes().forEach((e) => e.destroy())
  }

  getZones() {
    // this.layer.children.forEach((e) => {
    //   console.log(e instanceof Zone)
    // })

    return this.layer.children
      .filter((e) => e instanceof Zone)
      .map((e) => e.getInfo())
  }

  _addMetricLine(layer) {
    const line = new Konva.Line({
      points: [50, 50, 200, 50],
      stroke: 'green',
      name: 'metric'
    })
    layer.add(line)

    const anchor1 = new Konva.Circle({
      x: line.points()[0],
      y: line.points()[1],
      radius: 5,
      fill: 'lightgreen',
      opacity: 0.5,
      draggable: true,
      name: 'metric'
    })
    layer.add(anchor1)

    const anchor2 = new Konva.Circle({
      x: line.points()[2],
      y: line.points()[3],
      radius: 5,
      fill: 'lightgreen',
      opacity: 0.5,
      draggable: true,
      name: 'metric'
    })
    layer.add(anchor2)

    function updateLine() {
      const points = [anchor1.x(), anchor1.y(), anchor2.x(), anchor2.y()]
      line.points(points)
      layer.batchDraw()
    }

    anchor1.on('dragmove', updateLine)
    anchor2.on('dragmove', updateLine)

    this.toggleMetricLine()
  }

  toggleMetricLine() {
    this.layer.children
      .filter((e) => e.name() == 'metric')
      .forEach((e) => e.visible(!e.visible()))
  }

  getMetricPixel() {
    let [p1, p2] = this.layer.children.filter(
      (e) => e.name() == 'metric' && e instanceof Konva.Circle
    )

    return Math.sqrt((p1.x() - p2.x()) ** 2 + (p1.y() - p2.y()) ** 2)
  }
}

export default KonvaCanvas
