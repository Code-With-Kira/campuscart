<template>
  <div class="flex min-h-screen flex-col bg-campus-sage">
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">
      Skip to main content
    </a>

    <header class="cc-container py-6">
      <NuxtLink to="/" class="text-2xl font-extrabold tracking-tight text-campus-emerald">
        <CommonStoreBrand />
      </NuxtLink>
    </header>

    <main id="main-content" class="cc-container flex flex-1 items-center justify-center py-10">
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <slot />
      </div>
    </main>

    <footer class="px-4 py-6 text-center text-sm text-gray-600">
      <NuxtLink to="/" class="hover:text-campus-green">← Back to CampusCart</NuxtLink>
    </footer>
  </div>
</template>
