<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/composables/useAuth'
import { buildNavigationProfileState } from '@/navigation/navigationProfile'
import HomeDashboardIcon from '@/components/home/HomeDashboardIcon.vue'
import HomeDashboardTile from '@/components/home/HomeDashboardTile.vue'

const auth = useAuth()
const { t } = useI18n()
const isAuthenticated = computed(() => auth.isAuthenticated.value)
const isAdmin = computed(() => isAuthenticated.value && auth.hasRole('ADMIN'))
const homeTitle = computed(() => (isAdmin.value ? t('home.adminTitle') : t('home.collaboratorTitle')))
const homeDescription = computed(() =>
  isAdmin.value ? t('home.adminDescription') : t('home.collaboratorDescription'),
)

const navProfile = computed(() =>
  buildNavigationProfileState(auth.isReady.value, auth.isAuthenticated.value, auth.hasRole),
)
const canShowLogin = computed(() => navProfile.value.canShowLogin)

const pageTitle = computed(() => {
  if (isAuthenticated.value) {
    return homeTitle.value
  }
  if (auth.isReady.value) {
    return t('home.publicSectionTitle')
  }
  return t('appShell.brand')
})

const pageDescription = computed(() => {
  if (isAuthenticated.value) {
    return homeDescription.value
  }
  if (auth.isReady.value) {
    return t('home.visitorHeroDescription')
  }
  return t('home.authInitializing')
})
</script>

<template>
  <div class="home-page">
    <header class="page-header">
      <h1 class="page-header__title">{{ pageTitle }}</h1>
      <p class="page-header__description">{{ pageDescription }}</p>
    </header>

    <nav v-if="isAuthenticated" class="home-dashboard__body" :aria-label="t('home.panelNavAria')">
      <template v-if="isAdmin">
        <section class="home-dashboard__section" :aria-labelledby="'home-collab-heading'">
          <h2 id="home-collab-heading" class="home-dashboard__section-title">
            {{ t('home.collaboratorSectionTitle') }}
          </h2>
          <div class="home-dashboard__grid">
            <HomeDashboardTile
              :to="{ name: 'ejemplares-new' }"
              variant="primary"
              :title="t('home.tiles.createTree.title')"
              :description="t('home.tiles.createTree.desc')"
            >
              <template #icon>
                <HomeDashboardIcon name="tree" />
              </template>
            </HomeDashboardTile>
            <HomeDashboardTile
              :to="{ name: 'mis-ejemplares' }"
              :title="t('home.tiles.myTrees.title')"
              :description="t('home.tiles.myTrees.desc')"
            >
              <template #icon>
                <HomeDashboardIcon name="list" />
              </template>
            </HomeDashboardTile>
          </div>
        </section>

        <section
          class="home-dashboard__section home-dashboard__section--follow"
          :aria-labelledby="'home-admin-heading'"
        >
          <h2 id="home-admin-heading" class="home-dashboard__section-title">
            {{ t('home.adminSectionTitle') }}
          </h2>
          <div class="home-dashboard__grid">
            <HomeDashboardTile
              :to="{ name: 'admin-masters' }"
              :title="t('home.tiles.masters.title')"
              :description="t('home.tiles.masters.desc')"
            >
              <template #icon>
                <HomeDashboardIcon name="table" />
              </template>
            </HomeDashboardTile>
            <HomeDashboardTile
              :to="{ name: 'admin-subscriptions' }"
              :title="t('home.tiles.subscriptions.title')"
              :description="t('home.tiles.subscriptions.desc')"
            >
              <template #icon>
                <HomeDashboardIcon name="mail" />
              </template>
            </HomeDashboardTile>
          </div>
        </section>
      </template>

      <template v-else>
        <section class="home-dashboard__section" :aria-labelledby="'home-collab-only-heading'">
          <h2 id="home-collab-only-heading" class="home-dashboard__section-title">
            {{ t('home.collaboratorSectionTitle') }}
          </h2>
          <div class="home-dashboard__grid">
            <HomeDashboardTile
              :to="{ name: 'ejemplares-new' }"
              variant="primary"
              :title="t('home.tiles.createTree.title')"
              :description="t('home.tiles.createTree.desc')"
            >
              <template #icon>
                <HomeDashboardIcon name="tree" />
              </template>
            </HomeDashboardTile>
            <HomeDashboardTile
              :to="{ name: 'mis-ejemplares' }"
              :title="t('home.tiles.myTrees.title')"
              :description="t('home.tiles.myTrees.desc')"
            >
              <template #icon>
                <HomeDashboardIcon name="list" />
              </template>
            </HomeDashboardTile>
          </div>
        </section>
      </template>
    </nav>

    <nav v-else-if="auth.isReady" class="home-dashboard__body" :aria-label="t('home.panelNavAria')">
      <section class="home-dashboard__section" aria-labelledby="home-visitor-actions-heading">
        <h2 id="home-visitor-actions-heading" class="home-dashboard__section-title">
          {{ t('home.publicSectionTitle') }}
        </h2>
        <div class="home-dashboard__grid home-dashboard__grid--public">
          <HomeDashboardTile
            :to="{ name: 'ejemplares-list' }"
            variant="primary"
            :title="t('home.publicTiles.trees.title')"
            :description="t('home.publicTiles.trees.desc')"
          >
            <template #icon>
              <HomeDashboardIcon name="compass" />
            </template>
          </HomeDashboardTile>
          <HomeDashboardTile
            :to="{ name: 'subscriptions-new' }"
            :title="t('home.publicTiles.subscribe.title')"
            :description="t('home.publicTiles.subscribe.desc')"
          >
            <template #icon>
              <HomeDashboardIcon name="mail" />
            </template>
          </HomeDashboardTile>
          <button
            v-if="canShowLogin"
            type="button"
            class="home-tile home-tile--default home-tile--native"
            @click="auth.login('/')"
          >
            <span class="home-tile__icon" aria-hidden="true">
              <HomeDashboardIcon name="key" />
            </span>
            <span class="home-tile__main">
              <span class="home-tile__title">{{ t('home.publicTiles.login.title') }}</span>
              <span class="home-tile__desc">{{ t('home.publicTiles.login.desc') }}</span>
            </span>
            <span class="home-tile__chevron" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
          </button>
        </div>
      </section>
    </nav>
  </div>
</template>
