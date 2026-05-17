<template>
  <el-main class="app-main">
    <router-view v-slot="{ Component, route }">
      <transition name="fade-slide" mode="out-in">
        <keep-alive>
          <component :is="Component" :key="route.fullPath" />
        </keep-alive>
      </transition>
    </router-view>
  </el-main>
</template>

<style scoped>
.app-main {
  padding: 0;
  background:
    linear-gradient(180deg, rgba(232, 240, 255, 0.72) 0%, rgba(245, 247, 251, 0) 250px),
    #f5f7fb;
  height: calc(100vh - 56px - 38px);
  overflow: auto;
}
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
