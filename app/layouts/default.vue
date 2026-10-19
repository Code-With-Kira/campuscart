<template>
  <div class="flex min-h-screen flex-col bg-white">
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">
      Skip to main content
    </a>

    <LayoutAnnouncementBar />
    <LayoutSiteHeader />

    <main id="main-content" class="flex-1">
      <slot />
    </main>

    <LayoutSiteFooter />
  </div>
</template>
