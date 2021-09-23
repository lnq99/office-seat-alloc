import Konva from 'konva'

class Zone extends Konva.Rect {
  constructor(obj) {
    obj.name = 'zone'
    obj.fill = '#87ceeb80'
    obj.draggable = true
    super(obj)
  }

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

export default Zone
