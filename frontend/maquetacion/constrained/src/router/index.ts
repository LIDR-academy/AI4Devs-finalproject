import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const HomeView = () => import('@/views/HomeView.vue')
const PlaceholderView = () => import('@/views/PlaceholderView.vue')

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView, meta: { title: 'Home' } },
  { path: '/shop', name: 'shop', component: PlaceholderView, meta: { title: 'Shop' } },
  { path: '/subscribe', name: 'subscribe', component: PlaceholderView, meta: { title: 'Subscribe' } },
  { path: '/about', name: 'about', component: PlaceholderView, meta: { title: 'About' } },
  { path: '/help', name: 'help', component: PlaceholderView, meta: { title: 'Help' } },
  { path: '/privacy', name: 'privacy', component: PlaceholderView, meta: { title: 'Privacy' } },
  { path: '/sitemap', name: 'sitemap', component: PlaceholderView, meta: { title: 'Sitemap' } },
  { path: '/subscriptions', name: 'subscriptions', component: PlaceholderView, meta: { title: 'Subscriptions' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
