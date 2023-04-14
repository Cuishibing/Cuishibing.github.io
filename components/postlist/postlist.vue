<template>
  <div>
    <ol>
      <li class="postitem" v-for="p in postList" :key="p.name"><a
          :href="'index.html#/posteditor?c=' + cname + '&p=' + p.name">{{ p.name }}</a></li>

      <div style="display:flex">
        <input v-model="newPostName" v-if="showPostInut" /> <button @click="addPost">{{ showPostInut ? '确认' : '+'
        }}</button>
      </div>
    </ol>
  </div>
</template>

<script>

import { categoryApi } from "/js/api.js"

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

      categoryApi.addPost(this.cname, this.newPostName).then(data => {
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

      categoryApi.getPostList(this.cname).then(data => {
        this.postList = data
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