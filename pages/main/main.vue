<template>
  <div>

    <div class="layout">
      <Layout>
        <MHeader />
        <Layout>
          <Sider ref="side1"
            hide-trigger
            collapsible
            :collapsed-width="78">
            <Category />
          </Sider>
        </Layout>
      </Layout>
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

<style>
</style>