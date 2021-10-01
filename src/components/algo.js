export default function seatAlloc(zones, seatWidth, seatHeight) {
  console.log(zones, seatWidth, seatHeight)
  let res = []
  for (let z of zones) {
    seatAllocOneRect(z, seatWidth, seatHeight).forEach((point) => {
      res.push([
        z.x + point[0],
        z.y + point[1],
        seatWidth,
        seatHeight,
        z.rotation
      ])
    })
  }
  return res
}

function seatAllocOneRect(rect, seatWidth, seatHeight) {
  let { width, height, rotation } = rect
  let gap = 10

  let wArr, hArr

  // if (Math.random() > 0.5) {
  let lenLeft = width - gap
  let n = Math.floor(lenLeft / seatWidth)
  lenLeft = width - n * seatWidth
  let nGap = Math.floor(lenLeft / gap)

  nGap = 1

  let wGap = lenLeft / nGap

  wArr = new Array(n + nGap)
  wArr[Math.floor((n + nGap) / 2)] = wGap

  let m = Math.floor(height / (2 * seatHeight + gap)) * 2
  nGap = m / 2

  lenLeft = height - m * seatHeight - nGap * gap
  if (lenLeft > gap + seatHeight) {
    lenLeft -= seatHeight
    m++
    nGap++
  }

  lenLeft = height - m * seatHeight
  let hGap = lenLeft / nGap

  hArr = new Array(m + nGap)
  for (let i = 1; i < m + nGap; i += 3) {
    hArr[i] = hGap
  }

  // } else {
  //   let lenLeft = height - gap
  //   console.log(lenLeft / seatWidth)
  // }

  console.log(hArr)
  console.log(wArr)

  let [vw, vh, v] = vecStride(seatWidth, seatHeight, rotation)

  let gw = [v[0] * wGap, -v[1] * wGap]
  let gh = [v[1] * hGap, v[0] * hGap]

  // console.log(vw, vh, gw, gh, v)
  // console.log(wGap, hGap)

  let res = []

  let x = 0,
    y = 0

  for (let i = 0; i < hArr.length; i++) {
    if (hArr[i]) {
      x += gh[0]
      y += gh[1]
      continue
    }
    let xi = x,
      yi = y
    for (let j = 0; j < wArr.length; j++) {
      if (wArr[j]) {
        xi += gw[0]
        yi += gw[1]
      } else {
        res.push([xi, yi])
        xi += vw[0]
        yi += vw[1]
      }
    }
    x += vh[0]
    y += vh[1]
  }

  return res
}

function vecStride(w, h, angle) {
  let a = (-angle / 180) * Math.PI
  let s = Math.sin(a)
  let c = Math.cos(a)
  return [
    [w * c, -w * s],
    [h * s, h * c],
    [c, s]
  ]
}
