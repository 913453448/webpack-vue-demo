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
  width: 200fpx;
}
</style>
<style lang="scss">
html,
body {
  margin: 0;
  padding: 0;
}
</style>
