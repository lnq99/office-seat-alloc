const cv = require('cv')

// https://gist.github.com/pirosuke/1c31c2e6370c53a15e8774bb90b2d6cf
// https://stackoverflow.com/questions/64285186/cant-figure-out-why-opencv-js-cv-fitellipse-triggers-uncaught-exception-with
// https://github.com/opencv/opencv/blob/master/doc/js_tutorials/js_assets/js_imgproc_camera.html

function detect(thresh) {
  const kernel1 = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(7, 7))
  const kernel2 = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3))

  const marker = new cv.Mat()
  cv.dilate(thresh, marker, kernel1, new cv.Point(-1, -1), 1)

  let flag = true
  let tmp = new cv.Mat()

  while (flag) {
    tmp = marker.clone()
    cv.erode(marker, marker, kernel2)
    cv.max(thresh, marker, marker)

    let diff = new cv.Mat()
    cv.subtract(tmp, marker, diff)
    if (cv.countNonZero(diff) == 0) flag = false
  }

  const se = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(4, 4))
  let walls = new cv.Mat()
  cv.morphologyEx(marker, walls, cv.MORPH_CLOSE, se)
  cv.erode(walls, walls, kernel2, new cv.Point(-1, -1), 2)

  let other = new cv.Mat()
  cv.compare(marker, walls, other, cv.CMP_GE)

  cv.bitwise_not(other, other)

  return other
}

function getObjBoxes(id) {
  let src = cv.imread(`c${id}`)
  let dst = new cv.Mat()

  let label = new cv.Mat() // Label image (CV_32SC1 or CV_16UC1)
  let stats = new cv.Mat() // value and area value forming the bounding box
  let centroids = new cv.Mat() // centroid (x, y) (CV_64FC1)

  // Grayscale conversion
  cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0)

  //Binarization
  cv.threshold(dst, dst, 220, 255, cv.THRESH_BINARY)

  dst = detect(dst)

  // Labeling process
  let nLabel = cv.connectedComponentsWithStats(
    dst,
    label,
    stats,
    centroids,
    4,
    cv.CV_32S
  )

  const res = []

  for (let row = 1; row < nLabel; row += 1) {
    // stats.row(row)

    const [x1, y1, w, h] = [
      stats.intAt(row, cv.CC_STAT_LEFT),
      stats.intAt(row, cv.CC_STAT_TOP),
      stats.intAt(row, cv.CC_STAT_WIDTH),
      stats.intAt(row, cv.CC_STAT_HEIGHT)
    ]
    const size = stats.intAt(row, cv.CC_STAT_AREA)
    if (w < 6 || h < 6 || size < 40) continue
    res.push({
      x: x1,
      y: y1,
      width: w,
      height: h
    })

    // const [x2, y2] = [x1 + w, y1 + h]
    // const color = new cv.Scalar(0, 0, 0)
    // cv.rectangle(
    //   dst,
    //   new cv.Point(x1, y1),
    //   new cv.Point(x2, y2),
    //   color,
    //   1,
    //   cv.LINE_AA,
    //   0
    // )
  }
  // cv.imshow('out', dst)
  src.delete()
  dst.delete()

  return res
}

export default getObjBoxes
