import Konva from 'konva'

class Seat extends Konva.Rect {
  constructor(obj) {
    obj.name = 'seat'
    obj.fill = '#8888'
    obj.stroke = '#111d'
    obj.strokeWidth = 1
    obj.draggable = true
    obj.sceneFunc = function (context, shape) {
      let w = shape.width()
      let h = shape.height()
      context.beginPath()
      if (shape.getAttr('isWidthMajor')) {
        let a = h / 4
        let startHeightRect, startHeightCircle
        if (shape.getAttr('isFlip')) {
          startHeightRect = 2 * a
          startHeightCircle = a
        } else {
          startHeightRect = 0
          startHeightCircle = 3 * a
        }
        context.ellipse(w / 2, startHeightCircle, a, a, 0, 0, 2 * Math.PI)
        context.moveTo(0, startHeightRect)
        context.rect(0, startHeightRect, w, 2 * a)
      } else {
        let a = w / 4
        let startWidthRect, startWidthCircle
        if (shape.getAttr('isFlip')) {
          startWidthRect = 2 * a
          startWidthCircle = a
        } else {
          startWidthRect = 0
          startWidthCircle = 3 * a
        }
        context.ellipse(startWidthCircle, h / 2, a, a, 0, 0, 2 * Math.PI)
        context.moveTo(startWidthRect, 0)
        context.rect(startWidthRect, 0, 2 * a, h)
        // context.rect(0, 0, 2 * a, h)
        // context.moveTo(w, h / 2)
        // context.ellipse(3 * a, h / 2, a, a, 0, 0, 2 * Math.PI)
      }
      context.closePath()

      // (!) Konva specific method, it is very important
      context.fillStrokeShape(shape)
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
