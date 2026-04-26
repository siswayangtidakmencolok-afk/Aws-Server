<template>
  <div id="app-root">
    <!-- Login page (no sidebar/navbar) -->
    <template v-if="route.meta.layout === 'blank'">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </template>

    <!-- Main app layout with sidebar + navbar -->
    <template v-else>
      <div class="app-layout">
        <Sidebar />
        <div class="app-main">
          <Navbar />
          <main class="app-content">
            <router-view v-slot="{ Component }">
              <transition name="page" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </main>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'

const route = useRoute()
</script>

<style scoped>
#app-root {
  min-height: 100vh;
}
</style>
