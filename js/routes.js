import { mvueloader } from "/js/mvueloader.js";

const routes = [
  {
    path: "/",
    component: () => mvueloader("/pages/main/main.vue"),
    children: [
      {
        path: "/postlist",
        component: () => mvueloader("/components/postlist/postlist.vue"),
      },
      {
        path: "/postview",
        component: () => mvueloader("/components/postview/postview.vue"),
      },
      {
        path: "/posteditor",
        component: () => mvueloader("/components/posteditor/posteditor.vue"),
      }
    ],
  },
];

export { routes };
