<template>
  <button
    class="po-button po-text-ellipsis"
    type="button"
    :class="{
      'po-button-danger': state.type === 'danger',
      'po-button-link': state.type === 'link',
      'po-button-primary': state.type === 'primary',
      'po-button-sm': state.small,
      'po-clickable': state.type === 'link'
    }"
    @click="onButtonClick"
  >
    <div v-if="state.loading" class="po-button-loading-icon">
      <PoLoadingIcon neutralColor></PoLoadingIcon>
    </div>
    <span
      v-if="icon"
      :class="['po-icon', state.icon]"
      aria-hidden="true"
    ></span>
    <span v-if="state.label" class="po-button-label">{{ state.label }}</span>
  </button>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { PoLoadingIcon } from "../po-loading/po-loading-icon/";
export default defineComponent({
  name: "PoButton",
  components: { PoLoadingIcon },
  setup: (props, { emit }) => {
    const state = reactive({ ...props });
    const onButtonClick = (event: MouseEvent) => {
      if (state.onClick) state.onClick(event);
    };
    return { state, onButtonClick };
  },
  props: {
    label: String,
    icon: String,
    loading: Boolean,
    small: Boolean,
    type: String,
    onClick: Function
  }
});
</script>

<style>
</style>