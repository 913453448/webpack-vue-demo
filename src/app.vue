<template>
  <div class="app-container">{{ msg }}</div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class App extends Vue {
  msg = "hello world";
  user = {
    name: "yasin"
  };
  created(): void {
    // const name = this.user?.name;
    // console.log("name");
  }
}
</script>

<style scoped lang="scss">
.app-container {
  color: red;
  width: 187.5fpx;
  background: green;
}
</style>
<style lang="scss">
html,
body {
  margin: 0;
  padding: 0;
}
</style>
