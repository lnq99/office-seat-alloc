<template>
  <el-container>
    <el-aside class="board">
      <el-card class="aside card">
        <el-form label-position="top">
          <el-form-item label="Floor plan">
            <input type="file" id="imageLoader" accept=".png, .jpg, .jpeg" />
          </el-form-item>
          <el-form-item label="Number of seats">
            <el-input-number v-model="numSeat"></el-input-number>
          </el-form-item>
          <el-form-item label="Seat's size">
            <svg id="svg-seat" width="100%"></svg>
          </el-form-item>
          <el-button type="primary" plain round @click="run">Run</el-button>
        </el-form>
      </el-card>
    </el-aside>
    <el-main class="board">
      <el-card class="card" style="overflow: auto">
        <div id="main">
          <canvas id="cv"></canvas>
          <svg id="svg"></svg>
        </div>
        <br />
      </el-card>
    </el-main>
  </el-container>
</template>

<script>
import * as d3 from 'd3'

export default {
  data() {
    return {
      numSeat: 10
    }
  },
  mounted() {
    this.imageLoader = document.getElementById('imageLoader')
    this.imageLoader.addEventListener('change', this.handleImage, false)
    this.canvas = document.getElementById('cv')
    this.ctx = this.canvas.getContext('2d')
    this.svg = document.getElementById('svg')

    this.init()
    this.initSvgSeat()
  },
  methods: {
    run() {
      console.log(document.querySelectorAll('polygon'))
      console.log(document.querySelectorAll('.seat-size-input'))
    },
    handleImage(e) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          this.canvas.width = img.width
          this.canvas.height = img.height
          this.ctx.drawImage(img, 0, 0)
          this.svg.setAttribute('width', img.width)
          this.svg.setAttribute('height', img.height)

          const main = document.getElementById('main')
          main.setAttribute('style', `width: ${img.width}px; height: ${img.height}px`)
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(e.target.files[0])
    },
    init() {
      const svg = d3.select('#svg')

      let dragging = false
      let drawing = false
      let startPoint
      const points = []
      let g
      const dragger = d3
        .drag()
        .on('drag', handleDrag)
        .on('end', function (d) {
          dragging = false
        })

      svg.on('mouseup', function (event, d) {
        if (dragging) return
        drawing = true
        startPoint = d3.pointer(event)
        if (svg.select('g.drawPoly').empty())
          g = svg.append('g').attr('class', 'drawPoly')
        if (event.target.hasAttribute('is-handle')) {
          closePolygon()
          return
        }

        points.push(d3.pointer(event))
        g.select('polyline').remove()
        let polyline = g
          .append('polyline')
          .attr('points', points)
          .style('fill', 'none')
          .attr('stroke', '#000')
        for (let i = 0; i < points.length; i++) {
          g.append('circle')
            .attr('cx', points[i][0])
            .attr('cy', points[i][1])
            .attr('r', 4)
            .attr('fill', 'yellow')
            .attr('stroke', '#000')
            .attr('is-handle', 'true')
            .style({ cursor: 'pointer' })
        }
      })

      svg.on('mousemove', function (event) {
        if (!drawing) return
        const g = d3.select('g.drawPoly')
        g.select('line').remove()
        let line = g
          .append('line')
          .attr('x1', startPoint[0])
          .attr('y1', startPoint[1])
          .attr('x2', d3.pointer(event)[0] + 2)
          .attr('y2', d3.pointer(event)[1])
          .attr('stroke', '#53dbf3')
          .attr('stroke-width', 1)
      })

      function closePolygon() {
        svg.select('g.drawPoly').remove()
        const g = svg.append('g')
        g.append('polygon').attr('points', points).style('fill', '#87ceeb60')

        for (let i = 0; i < points.length; i++) {
          let circle = g
            .selectAll('circles')
            .data([points[i]])
            .enter()
            .append('circle')
            .attr('cx', points[i][0])
            .attr('cy', points[i][1])
            .attr('r', 4)
            .attr('fill', '#f6f900')
            .attr('stroke', '#000')
            .attr('is-handle', 'true')
            .style('cursor', 'move')
            .call(dragger)
        }
        points.splice(0)
        drawing = false
      }

      function handleDrag(event) {
        if (drawing) return
        dragging = true

        const dragCircle = d3.select(this)
        dragCircle.attr('cx', event.x).attr('cy', event.y)

        const newPoints = []
        const poly = d3.select(this.parentNode).select('polygon')
        const circles = d3.select(this.parentNode).selectAll('circle')

        circles.each(function (d, i) {
          let circle = d3.select(this)
          newPoints.push([circle.attr('cx'), circle.attr('cy')])
        })

        poly.attr('points', newPoints)
      }
    },
    initSvgSeat() {
      const svg = d3.select('#svg-seat')
      new Rectangle()

      function Rectangle() {
        const self = this
        const rectData = [{ x: 80, y: 50 }, { x: 100, y: 70 }]
        let rect, isDown = false, isDrag = false

        function updateRect() {
          rect = self.rectangleElement
          rect.attr('x', rectData[1].x - rectData[0].x > 0 ? rectData[0].x : rectData[1].x)
          rect.attr('y', rectData[1].y - rectData[0].y > 0 ? rectData[0].y : rectData[1].y)
          rect.attr('width', Math.abs(rectData[1].x - rectData[0].x))
          rect.attr('height', Math.abs(rectData[1].y - rectData[0].y))

          const point1 = self.point1.data(rectData)
          point1.attr('r', 4)
            .attr('cx', rectData[0].x)
            .attr('cy', rectData[0].y)
          const point2 = self.point2.data(rectData)
          point2.attr('r', 4)
            .attr('cx', rectData[1].x)
            .attr('cy', rectData[1].y)
        }

        function dragRect(e) {
          for (let i = 0; i < rectData.length; i++) {
            self.rectangleElement
              .attr('x', rectData[i].x += e.dx)
              .attr('y', rectData[i].y += e.dy)
          }
          rect.style('cursor', 'move')
          updateRect()
        }

        function dragPoint1(e) {
          self.point1.attr('cx', rectData[0].x += e.dx).attr('cy', rectData[0].y += e.dy)
          updateRect()
        }

        function dragPoint2(e) {
          self.point2.attr('cx', rectData[1].x += e.dx).attr('cy', rectData[1].y += e.dy)
          updateRect()
        }

        const dragR = d3.drag().on('drag', dragRect)
        const dragC1 = d3.drag().on('drag', dragPoint1)
        const dragC2 = d3.drag().on('drag', dragPoint2)

        self.rectangleElement = svg.append('rect').attr('class', 'seat-size-input').call(dragR)
        self.point1 = svg.append('circle').attr('class', 'pointC').call(dragC1)
        self.point2 = svg.append('circle').attr('class', 'pointC').call(dragC2)

        updateRect()

        svg.on('mousedown', function (event) {
          if (!isDown && !isDrag) {
            isDrag = false
          } else {
            isDrag = true
          }
          isDown = !isDown
        })
      }
    }
  }
}
</script>

<style scoped>
.board {
  padding: 8px;
  height: 100vh;
}

.card {
  height: calc(100% - 2px);
}

#main {
  overflow: auto;
  position: relative;
  padding: 2px;
  height: 50vh;
  margin-left: auto;
  margin-right: auto;
}

#cv {
  outline: #666 2px solid;
  position: absolute;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
}

#svg {
  outline: red 1px solid;
  position: absolute;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
}

#svg-seat {
  outline: #666 2px solid;
}
</style>

<style>
.seat-size-input {
  fill: lightblue !important;
  stroke: blue;
  stroke-width: 1px;
}
label {
  padding: 0 !important;
}
</style>

https://gist.github.com/RiseupDev/b07f7ccc1c499efc24e9
http://jsfiddle.net/SunboX/vj4jtdg8/