<template>
  <div style="display:flex">
    <button v-for="c in categories" class="category" :key="c.name" :name="c.name" @click="onCategoryClick(c.name)">
      {{ c.name }}
    </button>
    <input v-if="showAddInput" v-model="newCategoryName" /> <button class="category" @click="addCategory">{{ showAddInput
      ?
      '确认' : '+' }}</button>
  </div>
</template>

<script>
import { getFile, saveFile } from "/js/filefactory.js"

const CATEGORY_FILE_KEY = "/meta/categoryInfo.json"

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

      let index = this.categories.findIndex(v => {
        return v.name == this.newCategoryName
      })

      if (index > -1) {
        return
      }

      this.categories.push({
        name: this.newCategoryName
      })

      this.newCategoryName = ""

      saveFile(CATEGORY_FILE_KEY, JSON.stringify(this.categories))
    }
  },
  mounted() {
    getFile(CATEGORY_FILE_KEY).then(data => {
      this.categories = JSON.parse(data)
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