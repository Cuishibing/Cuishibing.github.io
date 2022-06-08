<template>

  <div style="display:flex">
    <button v-for="c in categories" class="category"
      :key="c.name"
      :name="c.name"
      @click="onCategoryClick(c.name)">
      {{c.name}}
    </button>
  </div>

</template>

<script>
import { getFile } from '/js/filefactory.js'
export default {
  data() {
    return {
      categories: []
    }
  },
  methods: {
    onCategoryClick(cname) {
      this.$router.push({
        path: "/postlist",
        query: { c: cname }
      });
    }
  },
  mounted() {
    getFile('/meta/meta.json').then(data => {
      this.categories = JSON.parse(data).categories
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