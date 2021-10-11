export default function seatAlloc(zones, seatWidth, seatHeight, gap) {
  let res = []
  for (let z of zones) {
    let [w, h] = z.isWidthMajor
      ? [seatWidth, seatHeight]
      : [seatHeight, seatWidth]

    // let [w, h] = [seatWidth, seatHeight]
    // let rot = z.rotation + (z.isWidthMajor ? 0 : 90)
    seatAllocOneRect(z, seatWidth, seatHeight, gap).forEach((point) => {
      res.push([
        z.x + point[0],
        z.y + point[1],
        w,
        h,
        z.rotation,
        z.id,
        z.isWidthMajor,
        point[2] // isFlip
      ])
    })
  }
  return res
}

function seatAllocOneRect(rect, seatWidth, seatHeight, gap) {
  let { width, height, rotation } = rect

  let wArr = []
  let hArr = []
  let wGap, hGap
  let vw, vh, v

  if (rect.isWidthMajor) {
    ;[wArr, hArr, wGap, hGap] = allocGrid(
      width,
      height,
      seatWidth,
      seatHeight,
      gap
    )
    ;[vw, vh, v] = vecStride(seatWidth, seatHeight, rotation)
  } else {
    ;[hArr, wArr, hGap, wGap] = allocGrid(
      height,
      width,
      seatWidth,
      seatHeight,
      gap
    )
    ;[vw, vh, v] = vecStride(seatHeight, seatWidth, rotation)
  }

  let gw = [v[0] * wGap, -v[1] * wGap]
  let gh = [v[1] * hGap, v[0] * hGap]

  let res = []

  let x = 0,
    y = 0

  let isFlip = false

  for (let i = 0; i < hArr.length; i++) {
    if (hArr[i]) {
      x += gh[0]
      y += gh[1]
      continue
    }
    let xi = x,
      yi = y

    if (!rect.isWidthMajor) isFlip = false
    for (let j = 0; j < wArr.length; j++) {
      if (wArr[j]) {
        xi += gw[0]
        yi += gw[1]
      } else {
        res.push([xi, yi, isFlip])
        xi += vw[0]
        yi += vw[1]
        if (!rect.isWidthMajor) isFlip = !isFlip
      }
    }
    x += vh[0]
    y += vh[1]
    if (rect.isWidthMajor) isFlip = !isFlip
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

function allocGrid(mainSize, crossSize, seatWidth, seatHeight, gap) {
  let mainArr, crossArr
  let mainGap, crossGap
  let n, m, nGap

  let lenLeft = mainSize - gap
  n = Math.floor(lenLeft / seatWidth)
  lenLeft = mainSize - n * seatWidth
  nGap = Math.min(Math.floor(lenLeft / gap), n - 1)
  mainGap = lenLeft / nGap

  let seatWidthIfGapEqualy = (n * seatWidth) / (nGap + 1)
  mainArr = new Array(n + nGap)

  for (let i = 1; i <= nGap; i++) {
    mainArr[Math.round((i * seatWidthIfGapEqualy) / seatWidth) + i - 1] =
      mainGap
  }

  m = Math.floor(crossSize / (2 * seatHeight + gap)) * 2
  nGap = m / 2

  lenLeft = crossSize - m * seatHeight - nGap * gap
  if (lenLeft > gap + seatHeight) {
    lenLeft -= seatHeight
    m++
    nGap++
  }

  lenLeft = crossSize - m * seatHeight
  crossGap = lenLeft / nGap

  crossArr = new Array(m + nGap)
  for (let i = 1; i < m + nGap; i += 3) {
    crossArr[i] = crossGap
  }

  return [mainArr, crossArr, mainGap, crossGap]
}
