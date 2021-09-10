<template>
  <el-container>
    <el-aside class="board">
      <el-card class="aside card">
        <input
          type="file"
          id="imageLoader"
          name="imageLoader"
          accept=".png, .jpg, .jpeg"
        />
      </el-card>
    </el-aside>
    <el-main class="board">
      <el-card class="main card">
        <canvas id="cv"></canvas>
        <svg id="svg"></svg>
        <br />
      </el-card>
    </el-main>
  </el-container>
</template>

<script>
import * as d3 from 'd3'

export default {
  mounted() {
    this.imageLoader = document.getElementById('imageLoader')
    this.imageLoader.addEventListener('change', this.handleImage, false)
    this.canvas = document.getElementById('cv')
    this.ctx = this.canvas.getContext('2d')
    this.svg = document.getElementById('svg')

    this.init()
  },
  methods: {
    handleImage(e) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          this.canvas.width = img.width
          this.canvas.height = img.height
          this.ctx.drawImage(img, 0, 0)
          this.svg.setAttribute('width', `${img.width}px`)
          this.svg.setAttribute('height', `${img.height}px`)
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(e.target.files[0])
    },
    init() {
      const svg = d3.select('svg')

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

.main {
  overflow: auto;
  position: relative;
}

#cv {
  outline: #444 2px solid;
}

#svg {
  outline: red 2px solid;
  position: absolute;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  margin-bottom: 20px;
}
</style>
https://gist.github.com/RiseupDev/b07f7ccc1c499efc24e9
https://stackoverflow.com/questions/8945134/resizing-and-dragging-svg-polygons-dynamically
