<template>

  <div style="display:flex">
    <button v-for="c in categories"
      class="category"
      :key="c.name"
      :name="c.name"
      @click="onCategoryClick(c.name)">
      {{c.name}}
    </button>
    <input v-if="showAddInput"
      v-model="newCategoryName" /> <button class="category"
      @click="addCategory">{{ showAddInput? '确认' : '+' }}</button>
  </div>

</template>

<script>
import CategoryService from '/js/categoryapi.js'
export default {
  data() {
    return {
      categories: [],
      showAddInput: false,
      newCategoryName: ""
    }
  },
  methods: {
    loadAllCategory() {
      CategoryService.init().then(cs => {
        this.categories = cs.getAll()
      })

    },

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
      CategoryService.init().then(cs => {
        cs.create(this.newCategoryName)
        this.newCategoryName = ""
        this.loadAllCategory()
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