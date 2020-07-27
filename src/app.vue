<template>
    <div class="app-container">{{this.msg}}</div>
</template>

<script lang="ts">
  import {Vue, Component} from "vue-property-decorator";

  @Component
  export default class App extends Vue {
    msg="hello world"
  }
</script>

<style scoped lang="scss">
.app-container{
    color: red;
}
</style>