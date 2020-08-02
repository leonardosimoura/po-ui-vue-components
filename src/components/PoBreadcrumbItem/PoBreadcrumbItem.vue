<template>
  <li
    :class="{
      'po-breadcrumb-item': !itemActive && (link || action),
      'po-breadcrumb-item-unclickable': !itemActive && !link && !action,
      'po-breadcrumb-item-unclickable': itemActive
    }"
  >
    <label v-if="itemActive" class="po-breadcrumb-label">{{ label }}</label>

    <!-- <a v-if="!itemActive &&  link" [routerLink]="link"> -->
    <a v-if="!itemActive && link" v-bind:href="link">
      <label class="po-breadcrumb-label">{{ label }}</label>
      <div class="po-breadcrumb-arrow"></div>
    </a>

    <a v-if="!itemActive && !link && action" @click="action(label)">
      <label class="po-breadcrumb-label">{{ label }}</label>
      <div class="po-breadcrumb-arrow"></div>
    </a>

    <a v-if="!itemActive && !link && !action">
      <label class="po-breadcrumb-label">{{ label }}</label>
      <div class="po-breadcrumb-arrow"></div>
    </a>
  </li>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  props: {
    action: Function,
    label: String,
    link: String,
    itemActive: Boolean
  }
})
export default class PoBreadcrumbItem extends Vue {
  action!: Function;
  label!: string;
  link!: string;
  itemActive!: boolean;
}
</script>

<style scoped></style>
