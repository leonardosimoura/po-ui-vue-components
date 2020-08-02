<template>
  <button
    class="po-button po-text-ellipsis"
    type="button"
    :class="{'po-button-danger': type === 'danger' ,
    'po-button-link': type === 'link',
    'po-button-primary': type === 'primary',
    'po-button-sm': small,
    'po-clickable': type === 'link'
    }"
    @click="onClick()"
  >
    <div v-if="loading" class="po-button-loading-icon">
      <po-loading-icon p-neutral-color></po-loading-icon>
    </div>
    <span v-if="icon" :class="['po-icon' ,  icon ]" aria-hidden="true"></span>
    <span v-if="label" class="po-button-label">{{ label }}</span>
  </button>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import PoLoadingIcon from "../PoLoadingIcon";

@Options({
  props: {
    label: String,
    icon: String,
    loading: Boolean,
    small: Boolean,
    type: String
  },
  emits: ["click"],
  components: { PoLoadingIcon }
})
export default class PoButton extends Vue {
  label!: string;
  icon!: string;
  loading!: boolean;
  small!: boolean;
  type!: string;

  onClick() {
    this.$emit("click");
  }
}
</script>

<style scoped>
</style>
