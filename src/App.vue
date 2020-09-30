<template>
  <PoButton :label="'teste'" :onClick="poButtonClick"> </PoButton>
  <PoButton :label="'teste'" :loading="'true'" :onClick="poButtonClick">
  </PoButton>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { PoButton } from "./components";
export default defineComponent({
  name: "App",
  components: {
    PoButton
  },
  setup: () => {
    const poButtonClick = () => {
      alert("poButtonClick");
    };
    return { poButtonClick };
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
