import { mvueloader } from "/js/mvueloader.js";

const routes = [
  {
    path: "/",
    component: () => mvueloader("/pages/main/main.vue"),
    // children: [
    //   {
    //     path: "/login",
    //     component: () => mvueloader("/components/login/login.vue"),
    //   },
    // ],
  },
];

export { routes };
