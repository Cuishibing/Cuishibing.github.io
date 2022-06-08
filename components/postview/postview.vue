<template>
  <div>
    <h3>{{this.$route.query.i}}</h3>
    <div v-html="content"/>
    <Button @click="edit">编辑</Button>
  </div>
</template>


<script>
import { getFile } from '/js/filefactory.js'
export default {
  data() {
    return {
      content: ""
    }
  },
  methods: {
    edit() {
      this.$router.push({
        path:"/posteditor",
        query:{i:this.$route.query.i}
      });
    }
  },
  mounted() {
    let path = `/posts/${this.$route.query.i}/index`
    getFile(path).then(data => {
      this.content = data
    })
  }
}
</script>

<style>
</style>