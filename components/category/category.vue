<template>
  <div style="display:flex">
    <button v-for="c in categories" class="category" :key="c.name" :name="c.name" @click="onCategoryClick(c.name)" @contextmenu.prevent.stop="deleteCategory(c.name)">
      {{ c.name }}
    </button>
    <input v-if="showAddInput" v-model="newCategoryName" /> <button class="category" @click="addCategory">{{ showAddInput
      ?
      '确认' : '+' }}</button>
  </div>
</template>

<script>
import { categoryApi } from "/js/api.js"

export default {
  data() {
    return {
      categories: [],
      showAddInput: false,
      newCategoryName: ""
    }
  },
  methods: {
    onCategoryClick(cname) {
      this.$router.replace({
        path: "/postlist",
        query: { c: cname }
      });
    },

    addCategory() {
      this.showAddInput = !this.showAddInput
      if (this.newCategoryName == null || this.newCategoryName === undefined || this.newCategoryName === "") {
        return
      }

      categoryApi.addCategory(this.newCategoryName).then(data => {
        this.newCategoryName = ""
        this.loadAllCategory()
      })
    },

    deleteCategory(cname) {
      categoryApi.deleteCategory(cname).then(data=>{
        this.loadAllCategory()
      })
    },

    loadAllCategory() {
      categoryApi.getAllCategory().then(data => {
        this.categories = data
      })
    }
  },
  mounted() {
    this.loadAllCategory()
  }
}
</script>

<style scoped>
.category {
  margin-left: 5px;
  margin-right: 5px;
}
</style>