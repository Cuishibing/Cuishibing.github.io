<template>
  <div>
    <ol>
      <li class="postitem" v-for="p in postList" :key="p.name"><a
          :href="'index.html#/posteditor?c=' + cname + '&i=' + p.name">{{ p.name }}</a></li>

      <div style="display:flex">
        <input v-model="newPostName" v-if="showPostInut" /> <button @click="addPost">{{ showPostInut ? '确认' : '+' }}</button>
      </div>
    </ol>
  </div>
</template>

<script>
import { getFile, saveFile } from "/js/filefactory.js"

const CATEGORY_FILE_KEY = "/meta/categoryInfo.json"
export default {
  data() {
    return {
      categories: [],
      postList: [],
      newPostName: "",
      showPostInut: false
    }
  },
  methods: {
    addPost() {
      this.showPostInut = !this.showPostInut
      if (this.newPostName == null || this.newPostName === undefined || this.newPostName === "") {
        return
      }
      let index = this.postList.findIndex(p => {
        return p.name == this.newPostName
      })
      if (index > -1) {
        return
      }

      this.postList.push({
        name: this.newPostName
      })
      this.newPostName = ""

      saveFile(CATEGORY_FILE_KEY, JSON.stringify(this.categories))
    }
    ,
    getPostList() {
      this.cname = this.$route.query.c
      if (this.cname === null || this.cname === undefined || this.cname === "") {
        return
      }

      getFile(CATEGORY_FILE_KEY).then(data => {
        this.categories = JSON.parse(data)
        for (const c of this.categories) {
          if (c.name == this.cname) {
            if (c.postList == null) {
              c.postList = []
            }
            this.postList = c.postList
            break
          }
        }
      })
    }
  },
  mounted() {
    this.$watch(() => this.$route.query, () => { this.getPostList() }, { immediate: true })
  },
}
</script>

<style scoped>
.postitem {
  margin: 5px;
}
</style>