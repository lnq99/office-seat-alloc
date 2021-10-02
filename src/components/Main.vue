<template>
  <el-container>
    <el-aside class="board">
      <el-card class="aside card">
        <el-form label-position="top">
          <el-form-item label="Floor plan">
            <input
              type="file"
              id="imageLoader"
              accept=".png, .jpg, .jpeg"
              :disabled="isFileLoaded"
            />
          </el-form-item>
          <div v-if="isFileLoaded">
            <el-form-item label="Metric of plan (m)">
              <el-row>
                <el-col :span="18">
                  <el-input-number
                    v-model="sizeOnPlan"
                    :min="0"
                    :precision="2"
                    :step="0.1"
                  ></el-input-number>
                </el-col>
                <el-col :span="4" :offset="2">
                  <el-button
                    type="info"
                    icon="el-icon-edit"
                    circle
                    style="width: 100%"
                    :plain="!isEditAspectRatio"
                    @click="editAspectRatio"
                  ></el-button>
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item label="Min gap size">
              <el-row>
                <el-col :span="18">
                  <el-input-number
                    v-model="gap"
                    :min="0"
                    :precision="2"
                    :step="0.1"
                  ></el-input-number>
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item label="Seat's size (width x height)">
              <el-row>
                <el-col :span="10">
                  <el-input-number
                    v-model="seatWidth"
                    :precision="2"
                    :step="0.1"
                    :min="0"
                    :max="10"
                    :controls="false"
                    style="width: 100%"
                  />
                </el-col>
                <el-col :span="4" style="width: 100%; text-align: center"
                  >x</el-col
                >
                <el-col :span="10">
                  <el-input-number
                    v-model="seatHeight"
                    :precision="2"
                    :step="0.1"
                    :min="0"
                    :max="10"
                    :controls="false"
                    style="width: 100%"
                  />
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item label="Workspace">
              <el-button
                type="info"
                icon="el-icon-plus"
                round
                style="margin-left: 0 !important"
                :plain="!control.isCreatingZone"
                @click="control.isCreatingZone = !control.isCreatingZone"
                >zone
              </el-button>
              <el-button
                type="info"
                icon="el-icon-plus"
                round
                plain
                class="narrow"
                @click="addSeat"
                >seat
              </el-button>
              <el-button
                type="primary"
                icon="el-icon-refresh-right"
                style="width: 40px"
                circle
                plain
                class="narrow"
                @click="changeMainDirection()"
              ></el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                style="width: 40px"
                circle
                plain
                class="narrow"
                @click="deleteCurrentZone"
              ></el-button>
              <el-table
                ref="zonesTable"
                :data="zones"
                height="240"
                style="width: 100%"
                highlight-current-row
                @current-change="handleCurrentChange"
              >
                <el-table-column
                  align="center"
                  type="index"
                  label="ID"
                  width="34"
                />
                <el-table-column
                  align="center"
                  prop="width"
                  label="Width"
                  width="60"
                  :formatter="sizeFormatter"
                />
                <el-table-column
                  align="center"
                  prop="height"
                  label="Height"
                  width="64"
                  :formatter="sizeFormatter"
                />
                <el-table-column
                  align="center"
                  prop="rotation"
                  label="Rotation"
                  width="76"
                  :formatter="sizeFormatter"
                />
              </el-table>
            </el-form-item>
            <br />
            <el-form-item>
              <el-button type="primary" class="cmd" plain round @click="run"
                >Run</el-button
              >
            </el-form-item>
            <el-form-item>
              <el-button
                type="success"
                class="cmd"
                plain
                round
                @click="download"
                >Export</el-button
              >
            </el-form-item>
          </div>
        </el-form>
      </el-card>
    </el-aside>
    <el-main class="board">
      <el-card class="card" style="overflow: auto">
        <div id="main">
          <div id="konva"></div>
        </div>
      </el-card>
    </el-main>
  </el-container>
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
  data() {
    return {
      isFileLoaded: false,
      seatWidth: 2,
      seatHeight: 1.5,
      sizeOnPlan: 8,
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
      gap: 0.8,
    }
  },
  watch: {
    'control.isCreatingZone'() {
      this.fetchZones()
    },
    'control.isSelectedZoneChanged'() {
      const id = this.konva.getSelectedZone()
      const z = this.zones.filter(e => e.id == id)[0]
      this.setCurrent(z)
    }
  },
  mounted() {
    this.imageLoader = document.getElementById('imageLoader')
    this.imageLoader.addEventListener('change', this.handleImage, false)
    this.svg = document.getElementById('konva')

    window.addEventListener('keydown', (e) => {
      if (e.code == 'Delete')
        this.deleteCurrentZone()
    })
  },
  methods: {
    run() {
      let seats = seatAlloc(this.konva.getZones(), ...this.sizeSeatPixel(), this.gap * this.ratio)

      this.konva.addSeats(seats)
    },
    addSeat() {
      this.konva.addSeats([[0, 0, ...this.sizeSeatPixel(), 0]])
    },
    sizeSeatPixel() {
      return [this.seatWidth * this.ratio, this.seatHeight * this.ratio]
    },
    handleImage(e) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          this.svg.setAttribute('width', img.width)
          this.svg.setAttribute('height', img.height)

          const main = document.getElementById('main')
          main.setAttribute('style', `width: ${img.width + 4}px; height: ${img.height + 4}px`)
          this.konva = new KonvaCanvas('konva', img.width, img.height, this.control, img)
          this.isFileLoaded = true
          this.calcRatio()
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(e.target.files[0])
    },
    editAspectRatio() {
      this.isEditAspectRatio = !this.isEditAspectRatio
      this.konva.toggleMetricLine()
      this.calcRatio()
    },
    setCurrent(row) {
      this.$refs.zonesTable.setCurrentRow(row)
    },
    handleCurrentChange(val) {
      this.currentRow = val
      this.konva.selectZone(val.id)
    },
    deleteCurrentZone() {
      this.konva.removeSelected()
      this.fetchZones()
    },
    fetchZones() {
      this.zones = this.konva.getZones()
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
  overflow-y: auto;
}

#main {
  overflow: auto;
  position: relative;
  padding: 2px;
  margin-left: auto;
  margin-right: auto;
}

#konva {
  outline: #666 2px solid;
  /* position: absolute; */
  margin-left: auto;
  margin-right: auto;
  /* left: 0;
  right: 0; */
  margin-left: 4px;
}
</style>

<style>
label {
  padding: 0 !important;
}

.el-button {
  padding: 0 !important;
  width: 68px;
}
.el-button.narrow {
  margin-left: 8px !important;
}
.el-button > span {
  margin-left: 2px !important;
}
.el-button.cmd {
  width: 100px;
  margin: 0 !important;
}

.el-main.board {
  padding-left: 0;
}

.cell {
  padding-left: 8px !important;
  padding-right: 8px !important;
}
</style>
