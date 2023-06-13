<template>
  <div>
    <div style="display: flex; justify-content: center;align-items: center;">
      <h2 style="text-align:right;width: 50%;">{{ this.$route.query.p }}</h2>

      <span style="width:50%; display: flex; justify-content: right;">
        <button style="margin-left: 5px;margin-right: 5px;" @click="edit">编辑</button>
        <button style="margin-left: 5px;margin-right: 5px;" @click="save">保存</button>
        <button style="margin-left: 5px;margin-right: 5px;" @click="deleteFile">删除</button>
        <button v-if="showEncrypt" style="margin-left: 5px;margin-right: 5px;" @click="encryptFile">加密</button>
        <button v-if="showDecrypt" style="margin-left: 5px;margin-right: 5px;" @click="decryptFile">解密</button>

      </span>
    </div>

    <div class="maineditor" v-html="content" />

  </div>
</template>


<script>
import { getFile, saveFile, deleteFile } from '/js/filefactory.js'
import { encrypt, decrypt } from "/js/security.js"
import { categoryApi } from "/js/api.js"

const FILE_STORATE = 'https://13t21401h9.yicp.fun'
// const FILE_STORATE = 'http://192.168.18.152:9527'

export default {
  data() {
    return {
      content: '',
      showDecrypt: true,
      showEncrypt: true
    }
  },
  methods: {
    save() {
      saveFile(this.path, tinymce.activeEditor.getContent())
    },
    edit() {
      this.showDecrypt = false
      this.showEncrypt = false
      this.initEditor()
    },
    async deleteFile() {
      await deleteFile(this.path)
      await categoryApi.deletePost(this.cname, this.pname)
      this.$router.back()
    },

    async encryptFile() {
      let key = prompt('请输入密钥：');
      encrypt(this.content, key).then(cipher => {
        this.content = cipher
        // tinymce.activeEditor.setContent(this.content)
        saveFile(this.path, this.content)
      }).catch(err => {
        console.error(err)
        alert("加密失败")
      })
    },

    async decryptFile() {
      let key = prompt('请输入密钥：');
      this.content = this.content.replace("<p>", "")
      this.content = this.content.replace("</p>", "")
      decrypt(this.content, key).then(text => {
        this.content = text
        //tinymce.activeEditor.setContent(this.content)
        // saveFile(this.path, this.content)
      }).catch(err => {
        console.error(err)
        alert("解密失败")
      })
    },


    initEditor() {
      const useDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isSmallScreen = window.matchMedia('(max-width: 1023.5px)').matches;

      let that = this
      tinymce.init({
        selector: '.maineditor',
        plugins: 'autoresize preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons',
        editimage_cors_hosts: ['picsum.photos'],
        menubar: 'file edit view insert format tools table help',
        toolbar: 'undo redo | bold italic underline strikethrough | fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor codesample | ltr rtl',
        toolbar_sticky: true,
        toolbar_sticky_offset: isSmallScreen ? 102 : 108,
        // autosave_ask_before_unload: true,
        // autosave_interval: '30s',
        // autosave_prefix: '{path}{query}-{id}-',
        // autosave_restore_when_empty: false,
        // autosave_retention: '2m',
        // save_onsavecallback: () => {
        //   that.save()
        // },
        image_advtab: true,

        automatic_uploads: true,
        images_upload_url: FILE_STORATE + '/upload?d=' + that.cname + '/' + that.pname,
        images_upload_base_path: FILE_STORATE + '/download?f=',
        images_reuse_filename: true,

        file_picker_callback: function (callback, value, meta) {
          //文件分类
          var filetype = '.pdf, .txt, .zip, .rar, .7z, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .mp3, .mp4';
          //后端接收上传文件的地址
          var upurl = FILE_STORATE + '/upload?d=' + that.cname + '/' + that.pname;
          //为不同插件指定文件类型及后端地址
          switch (meta.filetype) {
            case 'image':
              filetype = '.jpg, .jpeg, .png, .gif';

              break;
            case 'media':
              filetype = '.mp3, .mp4';
              break;
            case 'file':
            default:
          }
          //模拟出一个input用于添加本地文件
          var input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', filetype);
          input.click();
          input.onchange = function () {
            var file = this.files[0];

            var xhr, formData;
            console.log(file.name);
            xhr = new XMLHttpRequest();
            xhr.withCredentials = false;
            xhr.open('POST', upurl);
            
            xhr.onload = function () {
              var json;
              if (xhr.status != 200) {
                failure('HTTP Error: ' + xhr.status);
                return;
              }
              json = JSON.parse(xhr.responseText);
              if (!json || typeof json.location != 'string') {
                failure('Invalid JSON: ' + xhr.responseText);
                return;
              }
              callback(json.location);
            };
            formData = new FormData();
            formData.append('file', file, file.name);
            xhr.send(formData);

          };
        },

        // link_list: [
        //   { title: 'My page 1', value: 'https://www.tiny.cloud' },
        //   { title: 'My page 2', value: 'http://www.moxiecode.com' }
        // ],
        // image_list: [
        //   { title: 'My page 1', value: 'https://www.tiny.cloud' },
        //   { title: 'My page 2', value: 'http://www.moxiecode.com' }
        // ],
        // image_class_list: [
        //   { title: 'None', value: '' },
        //   { title: 'Some class', value: 'class-name' }
        // ],
        importcss_append: true,
        height: 1024,
        image_caption: true,
        quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
        noneditable_class: 'mceNonEditable',
        toolbar_mode: 'sliding',
        contextmenu: 'link image table',
        skin: useDarkMode ? 'oxide-dark' : 'oxide',
        content_css: useDarkMode ? 'dark' : 'default',
        content_style: 'body { font-family:"andale mono", monospace,Helvetica,Arial,sans-serif; font-size:14px; line-height:2}'
      });
    }
  },
  mounted() {

    this.cname = this.$route.query.c
    this.pname = this.$route.query.p
    let path = `/posts/${this.cname}/${this.pname}/index`
    this.path = path

    this.$load.show()
    getFile(path).then(data => {
      this.content = data
      this.$load.hide()
    }).catch(err => {
      this.$load.hide()
    })
  }
}
</script>
