<template>
  <div>
    <h1 style="margin:0">不积跬步无以至千里</h1>
    <h5 style="display: inline-block;margin:0"><a href="https://cuishibing.github.io">cuishibing.github.io</a></h5>
    <a href="javascript:void(0)">+</a>
    <button style="float:right" @click="onSyncFiles">同步</button>
    <hr />
  </div>
</template>

<script>
import { syncFiles } from '/js/filefactory.js'
export default {
  methods: {
    onSyncFiles() {
      this.$load.show()
      syncFiles().then(data => {
        this.$load.hide()
      }).catch(err => {
        this.$load.hide()
      })
    }
  }
}
</script>

<style></style>