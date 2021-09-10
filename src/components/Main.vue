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
export default {
  mounted() {
    this.imageLoader = document.getElementById('imageLoader')
    this.imageLoader.addEventListener('change', this.handleImage, false)
    this.canvas = document.getElementById('cv')
    this.ctx = this.canvas.getContext('2d')
    this.svg = document.getElementById('svg')
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
          this.svg.setAttribute("width", `${img.width}px`)
          this.svg.setAttribute("height", `${img.height}px`)
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(e.target.files[0])
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
  outline: #444 3px solid;
}

#svg {
  outline: red 1px solid;
  position: absolute;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  margin-bottom: 20px;
}
</style>

// https://gist.github.com/RiseupDev/b07f7ccc1c499efc24e9
