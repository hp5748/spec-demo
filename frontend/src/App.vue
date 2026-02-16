<template>
  <a-config-provider :theme="{ token: { colorPrimary: '#1890ff' } }">
    <router-view />
  </a-config-provider>
</template>

<script setup lang="ts">
import 'ant-design-vue/dist/reset.css'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
