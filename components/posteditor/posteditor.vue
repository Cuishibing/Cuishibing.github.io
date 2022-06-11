<template>
  <div>
    <h2 style="text-align:center">{{this.$route.query.i}}</h2>
    <div id="editor"></div>
    <button @click="save">保存</button>
    <button @click="deleteFile">删除</button>
  </div>
</template>


<script>
import { getFile, saveFile, deleteFile } from '/js/filefactory.js'
import CategoryService from '/js/categoryapi.js'
export default {
  data() {
    return {
    }
  },
  methods: {
    save() {
      saveFile(this.path, this.editor.getData())
    },
    deleteFile() {
      deleteFile(this.path)
      CategoryService.init().then(cs=>{
        cs.deletePost(this.cname, this.pname)
        this.$router.back()
      })
    }
  },
  mounted() {
    let path = `/posts/${this.$route.query.i}/index`
    this.cname = this.$route.query.c
    this.pname = this.$route.query.i
    this.path = path
    let that = this

    ClassicEditor
      .create(document.querySelector('#editor'), {

      }).then(editor => {
        that.editor = editor
        getFile(path).then(data => {
          editor.setData(data)
        })
      })
      .catch(error => {
        console.log(error);
      });

  }
}
</script>

<style>
.ck-content {
  min-height: 500px;
  padding: 10px;
}
.ck-editor__main li {
  padding: 0px 0px 0px 0px !important;
  margin: 10px 0px 10px 15px !important;
}
.ck-editor__main ol {
  padding: 0px 0px 0px 0px !important;
  margin: 10px 0px 10px 15px !important;
}
.ck-editor__main ul {
  padding: 0px 0px 0px 0px !important;
  margin: 10px 0px 10px 15px !important;
}
</style>