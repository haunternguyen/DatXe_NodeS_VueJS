<template>
  <div>
    <NavBar/>
    <div class="container-fluid mt-4">
      <router-view/>
    </div>
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue';
// import Categories from './components/Categories.vue';

export default {
  components: {
    NavBar,
    // Categories
  }
};
</script>

<style scoped>
</style>