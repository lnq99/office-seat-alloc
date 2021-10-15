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
            <el-pagination
              background
              layout="prev, pager, next"
              :page-size="1"
              :total="3"
              v-model:currentPage="currentPlan"
            >
            </el-pagination>
            <el-form-item label="Metric of plan (m)">
              <el-row>
                <el-col :span="18">
                  <el-input-number
                    v-model="plan.sizeOnPlan"
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
                    :plain="!plan.isEditAspectRatio"
                    @click="plan.editAspectRatio"
                  ></el-button>
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item label="Min gap size">
              <el-row>
                <el-col :span="18">
                  <el-input-number
                    v-model="plan.gap"
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
                    v-model="plan.seatWidth"
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
                    v-model="plan.seatHeight"
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
                :plain="!plan.control.isCreatingZone"
                @click="plan.creatingZone"
                >zone
              </el-button>
              <el-button
                type="info"
                icon="el-icon-plus"
                round
                plain
                class="narrow"
                @click="plan.addSeat"
                >seat
              </el-button>
              <el-button
                type="primary"
                icon="el-icon-refresh-right"
                style="width: 40px"
                circle
                plain
                class="narrow"
                @click="plan.changeMainDirection"
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
                :data="plan.zones"
                height="240"
                style="width: 100%"
                highlight-current-row
                @current-change="plan.handleCurrentChange"
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
                @click="plan.download"
                >Export</el-button
              >
            </el-form-item>
          </div>
        </el-form>
      </el-card>
    </el-aside>
    <el-main class="board">
      <el-card class="card" style="overflow: auto; position: relative">
        <div v-if="isFileLoaded">
          <el-button
            type="primary"
            icon="el-icon-refresh"
            class="btn-float"
            style="top: 0"
            circle
            plain
            @click="plan.resetZoom"
          >
          </el-button>
          <el-button
            type="info"
            icon="el-icon-zoom-in"
            class="btn-float"
            style="top: 48px"
            circle
            plain
            @click="plan.zoom(true)"
          >
          </el-button>
          <el-button
            type="info"
            icon="el-icon-zoom-out"
            class="btn-float"
            style="top: 96px"
            circle
            plain
            @click="plan.zoom(false)"
          >
          </el-button>
        </div>
        <Plan
          ref="plan"
          @zonesUpdate="fetchZones"
          @setCurrentRow="setCurrentRow"
        ></Plan>
      </el-card>
    </el-main>
  </el-container>
</template>

<script>
import Plan from './Plan.vue'

export default {
  components: { Plan },
  data() {
    return {
      isFileLoaded: false,
      zones: [],
      plan: null,
      currentPlan: 1,
    }
  },
  mounted() {
    this.imageLoader = document.getElementById('imageLoader')
    this.imageLoader.addEventListener('change', this.handleImage, false)

    window.addEventListener('keydown', (e) => {
      if (e.code == 'Delete')
        this.deleteCurrentZone()
    })

    this.plan = this.$refs.plan
  },
  methods: {
    run() {
      this.plan.run()
      console.log(this.currentPlan)
    },
    handleImage(e) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          this.$refs.plan.loadImage(img)
          this.isFileLoaded = true
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(e.target.files[0])
    },
    setCurrentRow(row) {
      this.$refs.zonesTable.setCurrentRow(row)
    },
    deleteCurrentZone() {
      this.plan.konva.removeSelected()
      this.fetchZones()
    },
    fetchZones(zones) {
      this.zones = zones
    },
    sizeFormatter(row, column, cellValue, index) {
      return cellValue.toFixed(2)
    },
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

.btn-float {
  width: 40px;
  position: absolute;
  left: 0;
  margin: 8px !important;
  z-index: 1000;
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
  margin-left: 6px !important;
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
