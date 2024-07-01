import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },

  {
    path: '/offers',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/OffersPage.vue') }],
  },

  {
    path: '/requests',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/RequestsPage.vue') }],
  },

  {
    path: '/explore',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/ExplorePage.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },
];

export default routes;
