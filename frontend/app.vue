<!-- app.vue -->
<template>
  <div class="min-h-screen bg-surface font-body text-ink">
    <AppNav />
    <main>
      <NuxtPage />
    </main>
  </div>
</template>

<style>
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html {
  scroll-behavior: smooth;
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #f5f4f0;
}
::-webkit-scrollbar-thumb {
  background: #fdba74;
  border-radius: 3px;
}
</style>
