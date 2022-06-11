<template>
  <div>
    <ol>
      <li class="postitem"
        v-for="p in postList"
        :key="p.name"><a :href="'index.html#/posteditor?i=' + p.name">{{p.name}}</a></li>

      <div style="display:flex">
        <input v-model="newPostName"
          v-if="showPostInut" /> <button @click="addPost">{{showPostInut ? '确认': '+'}}</button>
      </div>
    </ol>
  </div>
</template>

<script>
import CategoryService from '/js/categoryapi.js'
export default {
  data() {
    return {
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
      CategoryService.init().then(cs => {
        cs.createPost(this.cname, this.newPostName)
        this.newPostName = ""
        this.getPostList()
      })
    }
    ,
    getPostList() {
      this.cname = this.$route.query.c
      if (this.cname === null || this.cname === undefined || this.cname === "") {
        return
      }

      CategoryService.init().then(cs => [
        this.postList = cs.getPosts(this.cname)
      ])
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