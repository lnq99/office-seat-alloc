import Konva from 'konva'
import Zone from './zone'
import Selection from './selection'

// debugger // eslint-disable-line no-debugger

class KonvaCanvas {
  constructor(id, width, height, control) {
    this.stage = new Konva.Stage({ container: id, width, height })
    const stage = this.stage

    const layer = new Konva.Layer({ draggable: false })
    stage.add(layer)

    const selection = new Selection()
    layer.add(selection)

    const tr = new Konva.Transformer({
      boundBoxFunc: (oldBox, newBox) => newBox
    })
    layer.add(tr)

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
        control.isCreatingZone = false
        mode = ''
        selection.visible(false)

        let newRect = new Zone({
          x: selection.x(),
          y: selection.y(),
          width: selection.width(),
          height: selection.height()
        })

        layer.add(newRect)
        tr.nodes([newRect])
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
