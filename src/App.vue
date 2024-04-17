<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { onMounted } from 'vue';
import { gsap } from 'gsap'

onMounted(() => {
  gsap.from('.btn', { duration: 1, x: 0, opacity: 0, scale: 1, ease: 'back' });
  gsap.from('#ascii-container', { duration: 6, x: 0, opacity: 0, scale: 1, ease: 'back' });
  gsap.from('#boot-btn', {delay: 2, duration: 5, x: -50, opacity: 0, scale: 1, ease: 'power1'});
});

</script>

<template>
  <div>
    <header id="header" class="hidden">
      <div id="navigation" class="container">
      </div>
      <div class="container">
        <div class="w-[800px] max-w-2xl font-mono flex">
          <p id="text" class="text-left leading-6 inline-block">This is the text area.</p>
        </div>
        <div id="option-buttons" class="btn-grid">
          <button class="btn">Option 1</button>
          <button class="btn">Option 2</button>
          <button class="btn">Option 3</button>
          <button class="btn">Option 4</button>
        </div>
      </div>
    </header>
</div>

<div class="self-center">
  <div id="boot-container" class="flex flex-col items-center">
      <div id="ascii-container" class="shown"></div>
      <button id="boot-btn" class="text-sm w-80 mt-10 hover:underline">Initiate boot up sequence</button>
  </div>
</div>

</template>

<style>
header {
  font-size: 15px;
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
