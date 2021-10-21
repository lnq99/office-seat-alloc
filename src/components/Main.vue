<template>
  <el-container>
    <el-aside class="board">
      <el-card class="aside card">
        <el-form label-position="top">
          <el-form-item label="Floor plan">
            <el-row>
              <el-col :span="18">
                <el-pagination
                  v-show="imgList.length"
                  background
                  layout="pager"
                  :page-size="1"
                  :total="imgList.length"
                  v-model:currentPage="currentPlan"
                >
                </el-pagination>
              </el-col>
              <el-col :span="4" :offset="2">
                <el-button
                  type="info"
                  icon="el-icon-plus"
                  circle
                  style="width: 100%"
                  plain
                  @click="isOpenUpload = true"
                ></el-button>
              </el-col>
            </el-row>
          </el-form-item>
          <div v-if="isFileLoaded">
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
        <!-- <keep-alive>
          <div id="main">
            <div v-for="i in imgList.length" :key="imgList[i - 1].name">
              <Plan
                v-if="i == currentPlan"
                :name="imgList[i - 1].name"
                :img="imgList[i - 1].img"
                ref="plan"
                :class="{ 'disable-event': i != currentPlan }"
                @zonesUpdate="fetchZones"
                @setCurrentRow="setCurrentRow"
              ></Plan>
            </div>
          </div>
        </keep-alive> -->

        <div id="main">
          <Plan
            v-for="i in imgList.length"
            :key="imgList[i - 1].name"
            v-show="i == currentPlan"
            :name="imgList[i - 1].name"
            :img="imgList[i - 1].img"
            :ref="setItemRef"
            :class="{ 'disable-event': i != currentPlan }"
            @zonesUpdate="fetchZones"
            @setCurrentRow="setCurrentRow"
          ></Plan>
        </div>
      </el-card>
    </el-main>
  </el-container>
  <el-dialog
    title="Upload floor plan"
    v-model="isOpenUpload"
    width="min(60%, 500px)"
    center
  >
    <upload @upload="onUpload"></upload>
  </el-dialog>
</template>

<script>
import Plan from './Plan.vue'
import Upload from './Upload.vue'

export default {
  components: { Plan, Upload },
  data() {
    return {
      zones: [],
      plan: null,
      currentPlan: -1,
      isOpenUpload: true,
      imgList: [],
      itemRefs: []
    }
  },
  mounted() {
    window.addEventListener('keydown', (e) => {
      if (e.code == 'Delete')
        this.deleteCurrentZone()
    })

    this.plan = this.$refs.plan
  },
  computed: {
    isFileLoaded() {
      return this.imgList.length > 0 && !this.isOpenUpload
    }
  },
  watch: {
    currentPlan(newPlan) {
      // console.log(newPlan, this.imgList)
      // const img = this.imgList[newPlan - 1]
      // this.$refs.plan.loadImage(img.img)
      console.log(this.itemRefs)
      this.plan = this.itemRefs[this.currentPlan - 1]
      this.plan.setCanvasSize()
      this.itemRefs = []
    },
    isOpenUpload(old) {
      console.log(old)
      // this.plan = this.$refs.plan
    },
    isFileLoaded(loaded) {
      if (loaded) {
        // console.log(this.itemRefs)
        // this.plan = this.itemRefs[this.currentPlan - 1]
        // [this.currentPlan - 1]
        this.currentPlan = 1
      }
    }
  },
  methods: {
    run() {
      this.plan.run()
      console.log(this.currentPlan)
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
    onUpload(imgList) {
      this.imgList = imgList
      console.log(this.imgList)
    },
    setItemRef(el) {
      if (el) {
        this.itemRefs.push(el)
      }
    },
  },
  // beforeUpdate() {
  //   this.itemRefs = []
  //   console.log('before')
  // },
  // updated() {
  //   console.log(this.itemRefs)
  // }
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

#main {
  overflow: auto;
  padding: 2px;
  margin-left: auto;
  margin-right: auto;
  width: 0;
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

.disable-event {
  pointer-events: none;
}

.el-pager > number {
  margin: 0;
}
</style>
