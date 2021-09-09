<template>
  <el-container>
    <el-aside class="aside board">
      <el-card class="card"
        >aside

        <input
          type="file"
          id="imageLoader"
          name="imageLoader"
          accept=".png, .jpg, .jpeg"
        />
      </el-card>
    </el-aside>
    <el-main class="main board">
      <el-card class="card">
        <canvas id="cv"></canvas>
      </el-card>
    </el-main>
  </el-container>
</template>

<script>
export default {
  mounted() {
    this.imageLoader = document.getElementById('imageLoader')
    console.log(this.imageLoader)
    this.imageLoader.addEventListener('change', this.handleImage, false)
    this.canvas = document.getElementById('cv')
    this.ctx = this.canvas.getContext('2d')
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
</style>
