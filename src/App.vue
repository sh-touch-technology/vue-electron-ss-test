<template>
  <div class="conatiner">
    <div class="toolbar">
      <toolbar />
    </div>
    <div class="main"><router-view></router-view>
      <div v-if="$route.matched.length === 0">
        <h1>404 - 页面未找到</h1>
      </div>
    </div>
  </div>
</template>

<script setup>
import toolbar from './components/toolbar.vue';
import { ref } from 'vue'
</script>

<style scoped>
.conatiner {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.toolbar {}

.main {
  flex: 1;
  overflow: auto;
}
</style>