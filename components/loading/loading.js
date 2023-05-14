import { mvueloader } from "/js/mvueloader.js";


let myLoad = mvueloader("/components/loading/loading.vue")


let msg = Vue.reactive({
  show: true,
  title: '处理中...'
})

let $loading = Vue.createApp(myLoad, {msg}).mount(document.createElement("div"))


let load = {
  show(title = msg.title) {
    msg.show = true,
    msg.title = title
    document.body.appendChild($loading.$el)
  },

  hide() {
    msg.show = false
  }
}

export {load}