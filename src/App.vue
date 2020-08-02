<template>
  <div class="po-wrapper">
    <PoMenu
      :menus="[{ label: 'PO UI - Angular Framework', link: '/' },{ label: 'PO UI - Angular Framework', link: '/' },{ label: 'PO UI - Angular Framework', link: '/' }]"
      :logo="'https://po-ui.io//assets/graphics/po.png'"
      :shortLogo="'https://po-ui.io//assets/graphics/po.png'"
    ></PoMenu>
    <!-- <po-toolbar
      [p-actions]="actions"
      p-actions-icon="po-icon po-icon-grid"
      [p-profile]="profile"
      [p-profile-actions]="profileActions"
      [p-notification-actions]="notificationActions"
      [p-notification-number]="notificationNumber"
      [p-show-notification]="showNotification"
      [p-title]="title"
    ></po-toolbar>-->
  </div>
</template>

<script>
import { PoButton, PoBreadcrumb, PoMenu } from "./components/index";

export default {
  name: "App",
  components: {
    PoMenu
  },
  methods: {
    clickBotao() {
      console.log("clickBotao");
    }
  }
};
</script>
