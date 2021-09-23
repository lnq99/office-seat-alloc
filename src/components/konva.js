import Konva from 'konva'

class Zone extends Konva.Rect {
  getInfo() {
    const size = this.getSize()
    const scale = this.getAbsoluteScale()
    const position = this.getAbsolutePosition()
    const rotation = this.getAbsoluteRotation()

    return {
      width: size.width * scale.x,
      height: size.height * scale.y,
      pos: { x: position.x, y: position.y },
      rotation: rotation
    }
  }
}

class KonvaCanvas {
  constructor(id, width, height, control) {
    this.stage = new Konva.Stage({ container: id, width, height })
    let layer = new Konva.Layer({ draggable: false })
    this.stage.add(layer)

    let stage = this.stage

    // draw a background rect to catch events.
    // let bg = new Konva.Rect({
    //   x: 0,
    //   y: 0,
    //   width,
    //   height,
    //   fill: '#4441'
    // })
    // layer.add(bg)

    // draw a rectangle to be used as the rubber area
    let r2 = new Konva.Rect({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      stroke: '#d0312d',
      dash: [2, 2]
    })
    r2.listening(false) // stop r2 catching our mouse events.
    layer.add(r2)

    let tr = new Konva.Transformer({
      boundBoxFunc: function (oldBox, newBox) {
        return newBox
      }
    })

    layer.add(tr)

    this.stage.batchDraw() // First draw of canvas.

    let posStart
    let posNow
    let mode = ''
    function startDrag(posIn) {
      posStart = { x: posIn.x, y: posIn.y }
      posNow = { x: posIn.x, y: posIn.y }
    }

    function updateDrag(posIn) {
      // update rubber rect position
      posNow = { x: posIn.x, y: posIn.y }
      let posRect = reverse(posStart, posNow)
      r2.x(posRect.x1)
      r2.y(posRect.y1)
      r2.width(posRect.x2 - posRect.x1)
      r2.height(posRect.y2 - posRect.y1)
      r2.visible(true)

      stage.batchDraw() // redraw any changes.
    }

    // reverse co-ords if user drags left / up
    function reverse(r1, r2) {
      let r1x = r1.x,
        r1y = r1.y,
        r2x = r2.x,
        r2y = r2.y,
        d
      if (r1x > r2x) {
        d = Math.abs(r1x - r2x)
        r1x = r2x
        r2x = r1x + d
      }
      if (r1y > r2y) {
        d = Math.abs(r1y - r2y)
        r1y = r2y
        r2y = r1y + d
      }
      return { x1: r1x, y1: r1y, x2: r2x, y2: r2y } // return the corrected rect.
    }

    // start the rubber drawing on mouse down.
    stage.on('mousedown', function (e) {
      if (control.isCreatingZone) {
        mode = 'drawing'
        startDrag({ x: e.evt.layerX, y: e.evt.layerY })
      }
    })

    // update the rubber rect on mouse move - note use of 'mode' var to avoid drawing after mouse released.
    stage.on('mousemove', function (e) {
      if (control.isCreatingZone) {
        if (mode === 'drawing') {
          updateDrag({ x: e.evt.layerX, y: e.evt.layerY })
        }
      }
    })

    // here we create the new rect using the location and dimensions of the drawing rect.
    stage.on('mouseup', function (e) {
      if (control.isCreatingZone) {
        control.isCreatingZone = false
        mode = ''
        r2.visible(false)
        // console.log(r2)
        // debugger // eslint-disable-line no-debugger
        let newRect = new Zone({
          name: 'zone',
          x: r2.x(),
          y: r2.y(),
          width: r2.width(),
          height: r2.height(),
          fill: '#87ceeb80',
          // stroke: 'black',
          draggable: true
          // listening: false
        })
        console.log(newRect)

        layer.add(newRect)
        tr.nodes([newRect])

        // console.log(layer)
        stage.batchDraw()
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
      if (!e.target.hasName('zone')) {
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

  addSeat() {}
}

export default KonvaCanvas
