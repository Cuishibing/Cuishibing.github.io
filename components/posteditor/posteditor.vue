<template>
  <div>
    <div style="display: flex; justify-content: center;align-items: center;">
      <h2 style="text-align:right;width: 50%;">{{this.$route.query.p}}</h2>

      <span style="width:50%; display: flex; justify-content: right;">
        <button style="margin-left: 5px;margin-right: 5px;"
          @click="edit">编辑</button>
        <button style="margin-left: 5px;margin-right: 5px;"
          @click="save">保存</button>
        <button style="margin-left: 5px;margin-right: 5px;"
          @click="deleteFile">删除</button>
      </span>
    </div>

    <div class="maineditor"
      style="margin-left: 15%; margin-right: 15%;"
      v-html="content" />

  </div>
</template>


<script>
import { getFile, saveFile, deleteFile } from '/js/filefactory.js'

import { categoryApi } from "/js/api.js"
export default {
  data() {
    return {
      content: ''
    }
  },
  methods: {
    save() {
      saveFile(this.path, tinymce.activeEditor.getContent())
    },
    edit() {
      this.initEditor()
    },
    async deleteFile() {
      await deleteFile(this.path)
      await categoryApi.deletePost(this.cname, this.pname)
      this.$router.back()
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
        autosave_ask_before_unload: true,
        autosave_interval: '30s',
        autosave_prefix: '{path}{query}-{id}-',
        autosave_restore_when_empty: false,
        autosave_retention: '2m',
        save_onsavecallback: () => {
          that.save()
        },
        image_advtab: true,
        link_list: [
          { title: 'My page 1', value: 'https://www.tiny.cloud' },
          { title: 'My page 2', value: 'http://www.moxiecode.com' }
        ],
        image_list: [
          { title: 'My page 1', value: 'https://www.tiny.cloud' },
          { title: 'My page 2', value: 'http://www.moxiecode.com' }
        ],
        image_class_list: [
          { title: 'None', value: '' },
          { title: 'Some class', value: 'class-name' }
        ],
        importcss_append: true,
        file_picker_callback: (callback, value, meta) => {
          /* Provide file and text for the link dialog */
          if (meta.filetype === 'file') {
            callback('https://www.google.com/logos/google.jpg', { text: 'My text' });
          }

          /* Provide image and alt text for the image dialog */
          if (meta.filetype === 'image') {
            callback('https://www.google.com/logos/google.jpg', { alt: 'My alt text' });
          }

          /* Provide alternative source and posted for the media dialog */
          if (meta.filetype === 'media') {
            callback('movie.mp4', { source2: 'alt.ogg', poster: 'https://www.google.com/logos/google.jpg' });
          }
        },
        templates: [
          { title: 'New Table', description: 'creates a new table', content: '<div class="mceTmpl"><table width="98%%"  border="0" cellspacing="0" cellpadding="0"><tr><th scope="col"> </th><th scope="col"> </th></tr><tr><td> </td><td> </td></tr></table></div>' },
          { title: 'Starting my story', description: 'A cure for writers block', content: 'Once upon a time...' },
          { title: 'New list with dates', description: 'New List with dates', content: '<div class="mceTmpl"><span class="cdate">cdate</span><br><span class="mdate">mdate</span><h2>My List</h2><ul><li></li><li></li></ul></div>' }
        ],
        template_cdate_format: '[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]',
        template_mdate_format: '[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]',
        height: 1024,
        image_caption: true,
        quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
        noneditable_class: 'mceNonEditable',
        toolbar_mode: 'sliding',
        contextmenu: 'link image table',
        skin: useDarkMode ? 'oxide-dark' : 'oxide',
        content_css: useDarkMode ? 'dark' : 'default',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px; margin-left: 15%; margin-right: 15%;}'
      });
    }
  },
  mounted() {
    
    this.cname = this.$route.query.c
    this.pname = this.$route.query.p
    let path = `/posts/${this.cname}/${this.pname}/index`
    this.path = path

    getFile(path).then(data => {
      this.content = data
    })
  }
}
</script>
