<template>
  <div>
    <ol>
      <li class="postitem"
        v-for="p in postList"
        :key="p.name"><a :href="'index.html#/posteditor?i=' + p.name">{{p.name}}</a></li>

      <div style="display:flex">
        <button @click="addPost">{{showPostInut ? '确定': '增加'}}</button><input v-model="newPostName"
          v-if="showPostInut" />
      </div>
    </ol>
  </div>
</template>

<script>
import { getFile, saveFile } from '/js/filefactory.js'
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
      if (this.postList == null) {
        this.postList = []
      }

      if (this.showPostInut) {
        for (let index = 0; index < this.postList.length; index++) {
          const element = this.postList[index];
          if (element.name == this.newPostName) {
            alert("重复的文章")
            return
          }
        }
        this.postList.push({
          name: this.newPostName
        })

        let category = this.$route.query.c
        if (category == null) {
          return
        }

        getFile("/meta/meta.json").then(data => {
          data = JSON.parse(data)
          for (const key in data.categories) {
            if (Object.hasOwnProperty.call(data.categories, key)) {
              const element = data.categories[key];
              if (element.name === category) {
                data.categories[key]['post_list'] = this.postList
                break
              }
            }
          }

          saveFile("/meta/meta.json", JSON.stringify(data))
        })
      }
      this.showPostInut = !this.showPostInut
    }
    ,
    getPostList() {
      let category = this.$route.query.c
      if (category == null) {
        return
      }
      getFile("/meta/meta.json").then(data => {
        data = JSON.parse(data)
        for (const key in data.categories) {
          if (Object.hasOwnProperty.call(data.categories, key)) {
            const element = data.categories[key];
            if (element.name === category) {
              this.postList = element['post_list']
              break
            }
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