<template>
  <el-upload
    class="upload"
    drag
    :on-remove="handleFileRemove"
    :file-list="imgList"
    :limit="5"
    action=""
    :http-request="handleFileRequest"
    accept=".png, .jpg, .jpeg"
  >
    <i class="el-icon-upload" style="margin-top: 16px"></i>
    <div class="el-upload__text">
      Перетащите файл сюда или <br /><em> нажмите, чтобы загрузить </em>
    </div>
    <template #tip>
      <div class="el-upload__tip">Файлы с раширениами .png, .jpg, .jpeg</div>
    </template>
  </el-upload>
</template>


<script>
export default {
  data() {
    return {
      nImg: 0,
      imgList: [],
    }
  },
  methods: {
    handleFileRemove(file, fileList) {
      this.imgList = this.imgList.filter(e => e.name != file.name)
      console.log(this.imgList)
    },
    handleFileRequest(request) {
      let fr = new FileReader()
      fr.name = request.file.name
      fr.onload = this.onFileLoad
      fr.readAsDataURL(request.file)
      // fr.readAsText(request.file)
    },
    onFileLoad(event) {
      const name = event.target.name
      const img = new Image()
      img.src = event.target.result
      img.onload = () => {

        const imgRecord = { name, img }

        const i = this.imgList.findIndex((e) => e.name == name)
        if (i == -1) this.imgList.push(imgRecord)
        else this.imgList[i] = imgRecord

        this.$emit('upload', this.imgList)
      }
    },
  }
}
</script>
