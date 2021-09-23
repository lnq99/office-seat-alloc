const SAT = require('sat')

console.log(new SAT.Vector(3, 4).rotate(Math.PI / 3))

export default function seatAlloc(numSeat, w, h, polygons, door) {
  console.log(w, h, polygons)

  // const V = new SAT.Vector(w / 2, h / 2)
  const A = Math.atan(h / w)
  const L = Math.sqrt(w ** 2 + h ** 2) / 2

  console.log(A, L)

  // console.log(new Rectangle())

  let seats = []

  for (let polygon of polygons) {
    let points = []
    for (let p of polygon) points.push([p.x, p.y])

    if (!isClockwise(points)) points = points.reverse()

    seats = seats.concat(seatAlloc1(w, h, points, A, L))
  }

  console.log(seats)

  return seats
}

function seatAlloc1(w, h, points, a, l) {
  let edges = []

  for (let i = 0; i < points.length - 1; i++) {
    edges.push([points[i], points[i + 1]])
  }
  edges.push([points[points.length - 1], points[0]])

  const res = []

  let i = 1

  for (let edge of edges) {
    let angle = calcAngle(edge)
    let v = new SAT.Vector(edge[1][0] - edge[0][0], edge[1][1] - edge[0][1])
    v.normalize().scale(l, l).rotate(-a)
    console.log(v)
    let seat = [edge[0][0] + v.x, edge[0][1] + v.y]
    res.push([...seat, angle, i++])
  }

  // let res = [
  //   [3, 8, 0],
  //   [15, 27, 0.2]
  // ]
  return res
}

function calcAngle(edge) {
  let dy = Math.abs(edge[1][1] - edge[0][1])
  let dx = Math.abs(edge[1][0] - edge[0][0])

  return Math.atan(
    // Math.abs(edge[1][1] - edge[0][1]) / Math.abs(edge[1][0] - edge[0][0])
    dy / dx
  )
}

function isClockwise(points) {
  let sum = 0
  const l = points.length
  for (let i = 0; i < l; i++) {
    const v1 = points[i]
    const v2 = points[(i + 1) % l]
    sum += (v2[0] - v1[0]) * (v2[1] + v1[1])
  }
  return sum > 0
}

function to(params) {}
