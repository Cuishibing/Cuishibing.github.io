<template>
  
    <Menu active-name="1-2"
            theme="dark"
            width="auto">
            <MenuItem  v-for="c in categories"
      :key="c.name" :name="c.name">

            <span>{{c.name}}</span>
            </MenuItem>
          </Menu>
  
</template>

<script>
import { req } from '/js/req.js'
export default {
  data() {
    return {
      categories: []
    }
  },
  mounted() {
    req("/meta/meta.json", "GET").then(data => {
      this.categories = data.categories
    })
  }
}
</script>

<style scoped>
.category {
  margin-left: 5px;
  margin-right: 5px;
}
</style>