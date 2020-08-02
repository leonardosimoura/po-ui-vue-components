<template>
  <PoBreadcrumb
    v-bind:items="[
    { label: 'Po Portal', link: 'portal' },
    { label: 'Po Breadcrumb', link: 'breadcrumb' }
  ]"
  ></PoBreadcrumb>
</template>

<script>
import { PoButton, PoBreadcrumb } from "./components/index";

export default {
  name: "App",
  components: {
    PoBreadcrumb
  },
  methods: {
    clickBotao() {
      console.log("clickBotao");
    }
  }
};
</script>
