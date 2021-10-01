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
          <!-- <el-form-item label="Number of seats">
            <el-input-number v-model="numSeat" :min="1"></el-input-number>
          </el-form-item> -->
          <el-form-item label="Metric of plan (aspect ratio)">
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
          <el-form-item label="Seat's size (width x height)">
            <!-- <svg id="svg-seat" width="100%"></svg> -->
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
              icon="el-icon-location"
              round
              :plain="!control.isCreatingZone"
              @click="control.isCreatingZone = !control.isCreatingZone"
              >Create
            </el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              style="width: 40px"
              circle
              plain
              @click="deleteCurrentZone"
            ></el-button>
            <el-table
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
            <el-button type="primary" plain round @click="run">Run</el-button>
          </el-form-item>
          <!-- <el-form-item>
            <el-button type="danger" plain round>Clear</el-button>
          </el-form-item> -->
          <el-form-item>
            <el-button type="success" plain round>Export</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-aside>
    <el-main class="board">
      <el-card class="card" style="overflow: auto">
        <div id="main">
          <canvas id="cv"></canvas>
          <!-- <svg id="svg"></svg>
          <div id="result"></div> -->
          <div id="konva"></div>
        </div>
        <!-- <br /> -->
      </el-card>
    </el-main>
  </el-container>
</template>

<script>
import seatAlloc from './algo'
import KonvaCanvas from './konva'

export default {
  data() {
    return {
      isFileLoaded: false,
      numSeat: 10,
      seatWidth: 2,
      seatHeight: 1.5,
      sizeOnPlan: 8,
      isEditAspectRatio: false,
      control: {
        isCreatingZone: false,
        showMetric: false,
      },
      currentRow: -1,
      konva: null,
      zones: [],
      ratio: 20,
    }
  },
  watch: {
    'control.isCreatingZone'() {
      this.fetchZones()
    }
  },
  mounted() {
    this.imageLoader = document.getElementById('imageLoader')
    this.imageLoader.addEventListener('change', this.handleImage, false)
    this.canvas = document.getElementById('cv')
    this.ctx = this.canvas.getContext('2d')
    this.svg = document.getElementById('konva')

    // this.konva = new KonvaCanvas('konva', this.canvas.width, this.canvas.height, this.control)
    // this.konva.addSeats()

    window.addEventListener('keydown', (e) => {
      if (e.code == 'Delete')
        this.deleteCurrentZone()
    })
  },
  methods: {
    run() {
      let seats = seatAlloc(this.konva.getZones(), this.seatWidth * this.ratio, this.seatHeight * this.ratio)

      this.konva.addSeats(seats)
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
          main.setAttribute('style', `width: ${img.width + 4}px; height: ${img.height + 4}px`)
          this.konva = new KonvaCanvas('konva', img.width, img.height, this.control)
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
    handleCurrentChange(val) {
      this.currentRow = val
    },
    deleteCurrentZone() {
      console.log('del', this.currentRow)
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
  /* outline: red 1px solid; */
  position: absolute;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
}

#konva {
  /* outline: red 1px solid; */
  position: absolute;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  margin-left: 4px;
}

#svg-seat {
  outline: #666 2px solid;
}

#draw {
  /* outline: #666 2px solid; */
  position: absolute;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
}
</style>

<style>
.seat-size-input {
  fill: skyblue !important;
  stroke: blue;
  stroke-width: 1px;
}
label {
  padding: 0 !important;
}

.el-button {
  width: 100px;
  padding: 0 !important;
}

.el-main.board {
  padding-left: 0;
}

.cell {
  padding-left: 8px !important;
  padding-right: 8px !important;
}
</style>

https://gist.github.com/RiseupDev/b07f7ccc1c499efc24e9
http://jsfiddle.net/SunboX/vj4jtdg8/