import { VNode } from "vue";
import { Vue, Component } from "vue-property-decorator";

@Component
export default class AppTsx extends Vue {
  msg = "hello tsx";

  render(): VNode {
    return <div>{this.msg}</div>;
  }
}
