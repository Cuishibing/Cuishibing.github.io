<template>
  <div>

    <MHeader />
    <div>
      <Category />
      <div style="margin-left: 10%; margin-right: 10%;">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import { mvueloader } from "/js/mvueloader.js";
export default {
  components: {
    MHeader: mvueloader("/components/header/header.vue"),
    Category: mvueloader("/components/category/category.vue")
  },
  data() {
    return {

    }
  }
}
</script>

<style></style>