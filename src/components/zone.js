import Konva from 'konva'

class Zone extends Konva.Rect {
  constructor(obj) {
    obj.name = 'zone'
    obj.fill = '#87ceeb80'
    obj.draggable = true
    super(obj)

    this.isWidthMajor = true

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

    let scale = this.getAbsoluteScale().x

    return {
      x: position.x / scale,
      y: position.y / scale,
      width: size.width,
      height: size.height,
      rotation: rotation,
      isWidthMajor: this.isWidthMajor,
      id: this._id
    }
  }
}

export default Zone
