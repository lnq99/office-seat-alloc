import Konva from 'konva'

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

class Selection extends Konva.Rect {
  constructor() {
    super({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      stroke: '#d0312d',
      dash: [2, 2],
      listening: false
    })
  }

  posStart
  posNow

  startDrag(posIn) {
    this.posStart = { x: posIn.x, y: posIn.y }
    this.posNow = { x: posIn.x, y: posIn.y }
  }

  updateDrag(posIn) {
    this.posNow = { x: posIn.x, y: posIn.y }
    let posRect = reverse(this.posStart, this.posNow)
    this.x(posRect.x1)
    this.y(posRect.y1)
    this.width(posRect.x2 - posRect.x1)
    this.height(posRect.y2 - posRect.y1)
    this.visible(true)
  }
}

export default Selection
