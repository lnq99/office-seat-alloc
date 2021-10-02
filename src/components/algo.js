export default function seatAlloc(zones, seatWidth, seatHeight, gap) {
  let res = []
  for (let z of zones) {
    let [w, h] = z.isWidthMajor
      ? [seatWidth, seatHeight]
      : [seatHeight, seatWidth]
    seatAllocOneRect(z, seatWidth, seatHeight, gap).forEach((point) => {
      res.push([z.x + point[0], z.y + point[1], w, h, z.rotation, z.id])
    })
  }
  return res
}

function seatAllocOneRect(rect, seatWidth, seatHeight, gap) {
  let { width, height, rotation } = rect

  let wArr, hArr
  let wGap, hGap
  let n, m, nGap
  let lenLeft

  if (rect.isWidthMajor) {
    lenLeft = width - gap
    n = Math.floor(lenLeft / seatWidth)
    lenLeft = width - n * seatWidth
    nGap = Math.min(Math.floor(lenLeft / gap), n - 1)
    wGap = lenLeft / nGap

    let seatWidthIfGapEqualy = (n * seatWidth) / (nGap + 1)
    wArr = new Array(n + nGap)

    for (let i = 1; i <= nGap; i++) {
      wArr[Math.round((i * seatWidthIfGapEqualy) / seatWidth) + i - 1] = wGap
    }

    m = Math.floor(height / (2 * seatHeight + gap)) * 2
    nGap = m / 2

    lenLeft = height - m * seatHeight - nGap * gap
    if (lenLeft > gap + seatHeight) {
      lenLeft -= seatHeight
      m++
      nGap++
    }

    lenLeft = height - m * seatHeight
    hGap = lenLeft / nGap

    hArr = new Array(m + nGap)
    for (let i = 1; i < m + nGap; i += 3) {
      hArr[i] = hGap
    }
  } else {
    lenLeft = height - gap
    m = Math.floor(lenLeft / seatWidth)
    lenLeft = height - m * seatWidth
    nGap = Math.min(Math.floor(lenLeft / gap), m - 1)
    hGap = lenLeft / nGap

    let seatWidthIfGapEqualy = (m * seatWidth) / (nGap + 1)
    hArr = new Array(m + nGap)

    for (let i = 1; i <= nGap; i++) {
      hArr[Math.round((i * seatWidthIfGapEqualy) / seatWidth) + i - 1] = hGap
    }

    n = Math.floor(width / (2 * seatHeight + gap)) * 2
    nGap = n / 2

    lenLeft = width - n * seatHeight - nGap * gap
    if (lenLeft > gap + seatHeight) {
      lenLeft -= seatHeight
      n++
      nGap++
    }

    lenLeft = width - n * seatHeight
    wGap = lenLeft / nGap

    wArr = new Array(n + nGap)
    for (let i = 1; i < n + nGap; i += 3) {
      wArr[i] = wGap
    }
  }

  let vw, vh, v
  if (rect.isWidthMajor) {
    ;[vw, vh, v] = vecStride(seatWidth, seatHeight, rotation)
  } else {
    ;[vw, vh, v] = vecStride(seatHeight, seatWidth, rotation)
  }

  let gw = [v[0] * wGap, -v[1] * wGap]
  let gh = [v[1] * hGap, v[0] * hGap]

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
