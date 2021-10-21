import Konva from 'konva'

class Seat extends Konva.Rect {
  constructor(obj) {
    obj.name = 'seat'
    // obj.fill = '#8888'
    // obj.stroke = '#111d'
    obj.strokeWidth = 0
    obj.draggable = true
    const image = document.getElementById('seat')

    obj.sceneFunc = function (ctx, shape) {
      let w = shape.width()
      let h = shape.height()
      ctx.beginPath()
      ctx.rect(0, 0, w, h)
      if (shape.getAttr('isWidthMajor')) {
        if (shape.getAttr('isFlip')) {
          ctx.transform(1, 0, 0, -1, 0, h)
        }
      } else {
        if (shape.getAttr('isFlip')) ctx.transform(0, 1, -1, 0, w, 0)
        else ctx.transform(0, -1, 1, 0, 0, h)
        ;[w, h] = [h, w]
      }
      ctx.drawImage(image, 0, 0, w, h)
      ctx.closePath()

      // (!) Konva specific method, it is very important
      ctx.fillStrokeShape(shape)
    }
    super(obj)
    this.on('transform', () => {
      this.setAttrs({
        width: this.width() * this.scaleX(),
        height: this.height() * this.scaleY(),
        scaleX: 1,
        scaleY: 1
      })
    })
  }

  getInfo() {
    const size = this.getSize()
    const position = this.getAbsolutePosition()
    const rotation = this.getAbsoluteRotation()

    return {
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.height,
      rotation: rotation
    }
  }
}

export default Seat

// new Seat({
//   x: float (m),
//   y: float (m),
//   width: float (m),
//   height: float (m),
//   rotation: float (radius),
//   groupId: int (zoneId),
//   isWidthMajor: boolean (orientation, horizontal/vertical),
//   isFlip: boolean (relative position between desk and chair)
// })
