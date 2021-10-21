export default function seatAlloc(zones, seatWidth, seatHeight, gap) {
  let res = []
  for (let z of zones) {
    let [w, h] =
      z.dir % 2 == 0 ? [seatWidth, seatHeight] : [seatHeight, seatWidth]

    seatAllocOneRect(z, seatWidth, seatHeight, gap).forEach((point) => {
      res.push([
        z.x + point[0],
        z.y + point[1],
        w,
        h,
        z.rotation,
        z.id,
        z.dir,
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

  if (rect.dir % 2 == 0) {
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

  let isFlip = false

  if (rect.dir == 1) {
    wArr = wArr.reverse()
    isFlip = !!wArr[0]
  } else if (rect.dir == 2) {
    hArr = hArr.reverse()
    isFlip = !!hArr[0]
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

    if (rect.dir % 2) isFlip = !!wArr[0]
    for (let j = 0; j < wArr.length; j++) {
      if (wArr[j]) {
        xi += gw[0]
        yi += gw[1]
      } else {
        res.push([xi, yi, isFlip])
        xi += vw[0]
        yi += vw[1]
        if (rect.dir % 2) isFlip = !isFlip
      }
    }
    x += vh[0]
    y += vh[1]
    if (rect.dir % 2 == 0) isFlip = !isFlip
  }

  let dw, dh
  if (rect.dir % 2 == 0) {
    ;[dw, dh] = [seatWidth, seatHeight]
  } else {
    ;[dw, dh] = [seatHeight, seatWidth]
  }
  let [vwidth, vheight, _] = vecStride(width - dw, height - dh, rotation)

  if (rect.dir == 0) {
    if (wGap > seatWidth) {
      allocFirstLast(res, [0, 0], wArr, hArr, vw, gw, vheight)
    }
  } else if (rect.dir == 1) {
    if (hGap > seatWidth) {
      allocFirstLast(res, vwidth, hArr, wArr, vh, gh, neg(vwidth), true)
    }
  } else if (rect.dir == 2) {
    if (wGap > seatWidth) {
      allocFirstLast(res, vheight, wArr, hArr, vw, gw, neg(vheight), true)
    }
  } else if (rect.dir == 3) {
    if (hGap > seatWidth) {
      allocFirstLast(res, [0, 0], hArr, wArr, vh, gh, vwidth)
    }
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

  // decrease number of gap: n-1 -> n//2
  nGap = Math.min(Math.floor(lenLeft / gap), Math.max(Math.floor(n / 2), 1))
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

function allocFirstLast(
  res,
  start,
  wArr,
  hArr,
  vw,
  gw,
  vCross,
  firstFlip = false
) {
  let i = wArr.findIndex((e) => e > 0)
  let x0 = start[0] + vw[0] * i + (gw[0] - vw[0]) / 2
  let y0 = start[1] + vw[1] * i + (gw[1] - vw[1]) / 2
  res.push([x0, y0, firstFlip])

  let l = hArr.length
  if (l % 3 == 0) {
    res.push([vCross[0] + x0, vCross[1] + y0, !firstFlip])
  }
}

function neg(v) {
  return [-v[0], -v[1]]
}
