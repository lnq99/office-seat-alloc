<template>
  <div class="konva" :id="name"></div>
</template>

<script>
import seatAlloc from './algo'
import KonvaCanvas from './konva'

function downloadURI(uri, name) {
  let link = document.createElement('a')
  link.download = name
  link.href = uri
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export default {
  props: ['img', 'name'],
  data() {
    return {
      width: 0,
      height: 0,
      scale: 1,
      seatWidth: 1.8,
      seatHeight: 1.5,
      sizeOnPlan: 5,
      isEditAspectRatio: false,
      control: {
        isCreatingZone: false,
        showMetric: false,
        isSelectedZoneChanged: false,
      },
      currentRow: -1,
      konva: null,
      zones: [],
      ratio: 20,
      gap: 0.6,
    }
  },
  watch: {
    'control.isCreatingZone'() {
      if (!this.control.isCreatingZone)
        this.fetchZones()
    },
    'control.isSelectedZoneChanged'() {
      const id = this.konva.getSelectedZone()
      const z = this.zones.filter(e => e.id == id)[0]
      this.currentRow = z
      this.$emit('setCurrentRow', z)
    }
  },
  mounted() {

    this.loadImage(this.img)
  },
  methods: {
    run() {
      let seats = seatAlloc(this.konva.getZones(), ...this.sizeSeatPixel(), this.gap * this.ratio)
      for (let z of this.zones) {
        this.konva.removeSeatsOfZone(z.id)
      }
      this.konva.addSeats(seats)
    },
    addSeat() {
      this.konva.addSeats([[0, 0, ...this.sizeSeatPixel(), 0, 0, true]])
    },
    creatingZone() {
      console.log(this.name)
      this.control.isCreatingZone = !this.control.isCreatingZone
    },
    sizeSeatPixel() {
      return [this.seatWidth * this.ratio, this.seatHeight * this.ratio]
    },
    loadImage(img) {
      const svg = document.getElementById(this.name)
      svg.setAttribute('width', img.width)
      svg.setAttribute('height', img.height)

      this.width = img.width
      this.height = img.height

      this.konva = new KonvaCanvas(this.name, img.width, img.height, this.control, img)
      this.setCanvasSize()
      this.calcRatio()
    },
    setCanvasSize() {
      const main = document.getElementById('main')
      main.setAttribute('style', `width: ${this.scale * this.width + 4}px; height: ${this.scale * this.height + 4}px`)
    },
    editAspectRatio() {
      this.isEditAspectRatio = !this.isEditAspectRatio
      this.konva.toggleMetricLine()
      this.calcRatio()
    },
    handleCurrentChange(val) {
      if (!val) return
      this.currentRow = val
      this.konva.selectZone(val.id)
    },
    deleteCurrentZone() {
      this.konva.removeSelected()
      this.fetchZones()
    },
    fetchZones() {
      this.zones = this.konva.getZones()
      this.$emit('zonesUpdate', this.zones)
    },
    sizeFormatter(row, column, cellValue, index) {
      return cellValue.toFixed(2)
    },
    calcRatio() {
      this.ratio = this.konva.getMetricPixel() / this.sizeOnPlan
    },
    download() {
      if (this.isEditAspectRatio)
        this.editAspectRatio()

      this.konva.toggleZones()
      let dataURL = this.konva.stage.toDataURL({ pixelRatio: 1 })
      downloadURI(dataURL, 'stage.png')
      this.konva.toggleZones()
    },
    changeMainDirection() {
      this.konva.changeMainDirection(this.currentRow.id, ...this.sizeSeatPixel(), this.gap * this.ratio)
    },
    zoom(zoomIn) {
      if (this.scale > 0.2 && this.scale < 4)
        this.scale += zoomIn ? 0.1 : -0.1
      this.setCanvasSize()
      this.konva.setScale(this.scale)
    },
    resetZoom() {
      this.konva.resetZoom()
      this.scale = 1
      this.setCanvasSize()
    },
  }
}
</script>

<style scoped>
#main {
  overflow: auto;
  padding: 2px;
  margin-left: auto;
  margin-right: auto;
  width: 0;
}

.konva {
  outline: #666 2px solid;
  margin-left: 4px;
}
</style>
