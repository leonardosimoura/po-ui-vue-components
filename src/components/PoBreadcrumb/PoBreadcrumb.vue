<template>
  <div class="po-breadcrumb" ref="breadcrumb">
    <ul class="po-breadcrumb-items">
      <li
        ref="dropdownIcon"
        v-if="showDropdownToggle"
        class="po-breadcrumb-item po-clickable"
        @click="toggleDropdown()"
      >
        <span class="po-breadcrumb-icon-more po-icon po-icon-more"></span>
        <div class="po-breadcrumb-arrow"></div>
      </li>

      <div v-for="(item, itemIndex) in items" :key="item.label">
        <PoBreadcrumbItem
          v-bind:action="item.action"
          v-bind:label="item.label"
          v-bind:link="item.link"
          v-bind:item-active="itemIndex === items.length - 1"
        ></PoBreadcrumbItem>
      </div>
    </ul>

    <!-- <po-breadcrumb-favorite
      *ngIf="favoriteService"
      [p-favorite-service]="favoriteService"
      [p-item-active]="items[items.length - 1]"
      [p-params-service]="paramsService"
    ></po-breadcrumb-favorite>-->

    <!-- <po-breadcrumb-dropdown *ngIf="showDropdown" [p-items]="dropdownItems"></po-breadcrumb-dropdown> -->
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import PoLoadingIcon from "../PoLoadingIcon";
import { IPoBreadcrumbItem } from "./IPoBreadcrumbItem";
import PoBreadcrumbItem from "../PoBreadcrumbItem";

@Options({
  props: {
    items: Array
  },
  components: { PoBreadcrumbItem }
})
export default class PoBreadcrumb extends Vue {
  public favoriteService!: string;
  public paramsService!: any;

  showDropdown = false;
  showDropdownToggle = false;
  dropdownItems: Array<PoBreadcrumbItem> = [];

  public _items: Array<PoBreadcrumbItem> = [];

  set items(value: Array<PoBreadcrumbItem>) {
    this._items = value;
  }
  get items() {
    if (this.isBreadcrumbResponsive) {
      this._items.filter((v, i) => {
        return i < 2;
      }) || [];
    }

    return this._items;
  }

  private _breadcrumbItemsLenght = 0;
  private calculatedElement = false;

  private hiddenWithoutResize = false;
  private initialized = false;
  private timeoutResize = 0;
  private isBreadcrumbResponsive = false;

  //   @ViewChild("breadcrumb", { read: ElementRef, static: true })
  //   breadcrumbElement: ElementRef;
  //   @ViewChild("dropdownIcon", { read: ElementRef }) dropdownIcon: ElementRef;

  mounted() {
    this.initialized = true;
    this.initializeResizeListener();
  }

  updated() {
    const breadcrumbWidth = (this.$refs.breadcrumb as any).offsetWidth;

    // Permite que os disclaimers sejam calculados na primeira vez que o componente torna-se visível,
    // evitando com isso, problemas com Tabs ou Divs que iniciem escondidas.
    if (breadcrumbWidth && !this.calculatedElement && this.initialized) {
      this.initBreadcrumbSize();
    }

    if (this.hiddenWithoutResize) {
      this.debounceResize();
      this.hiddenWithoutResize = false;
    }

    this.checkChangeOnItems();
  }

  beforeUnmount() {
    this.removeClickoutListener();
    this.removeResizeListener();
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    this.initializeClickoutListener();
  }

  private wasClickedonDropdown = (event: MouseEvent) => {
    const clickedOutIconDropdown = this.checkClickOutElement(
      event,
      this.$refs.dropdownIcon as any
    );

    if (clickedOutIconDropdown) {
      this.showDropdown = false;
      this.removeClickoutListener();
    }
  };

  private checkClickOutElement(event: Event, element: any) {
    return element && !element.nativeElement.contains(event.target);
  }

  private checkChangeOnItems() {
    // if (this.differ) {
    //   const changes = this.differ.diff(this.items);
    //   if (changes) {
    //     this.calcBreadcrumbItemsWidth();
    //     this.calculatedElement = false;
    //   }
    // }
    this.calcBreadcrumbItemsWidth();
    this.calculatedElement = false;
  }

  private calcBreadcrumb() {
    const breadcrumbFavorite = this.getBreadcrumbFavoriteWidth();
    const breadcrumb = this.getBreadcrumbWidth(breadcrumbFavorite);
    this.calcBreadcrumbItemsWidth();
    if (breadcrumb <= this._breadcrumbItemsLenght) {
      this.enableBreadcrumbResponsive();
    } else {
      this.disableBreadcrumbResponsive();
    }
  }

  private getBreadcrumbFavoriteWidth() {
    return this.favoriteService
      ? this.$el.querySelector(".po-breadcrumb-favorite").offsetWidth + 20
      : 0;
  }

  private getBreadcrumbWidth(breadcrumbFavorite: number) {
    return this.$el.offsetWidth - breadcrumbFavorite;
  }

  private calcBreadcrumbItemsWidth() {
    const breadcrumbItem = this.$el.querySelectorAll(
      ".po-breadcrumb-item, .po-breadcrumb-item-unclickable"
    );

    this._breadcrumbItemsLenght = Array.from(breadcrumbItem)
      .map(breadcrumb => (breadcrumb as any)["offsetWidth"])
      .reduce((a, b) => a + b, 16);
  }

  private enableBreadcrumbResponsive() {
    this.showDropdownToggle = true;
    //this.itemsView = this.items.slice(-2);
    this.dropdownItems = this.items.slice(0, -2).reverse();
    this.isBreadcrumbResponsive = true;
  }

  private disableBreadcrumbResponsive() {
    this.showDropdownToggle = false;
    //this.itemsView = [...this.items];
    this.showDropdown = false;
    this.isBreadcrumbResponsive = false;
  }

  private debounceResize() {
    clearTimeout(this.timeoutResize);
    this.timeoutResize = setTimeout(() => {
      if (
        this.calculatedElement &&
        !this.hiddenWithoutResize &&
        (this.$refs.breadcrumb as any).offsetWidth === 0
      ) {
        this.hiddenWithoutResize = true;
      } else {
        this.calcBreadcrumb();
      }
    }, 50);
  }

  private initBreadcrumbSize() {
    this.calcBreadcrumbItemsWidth();
    this.calcBreadcrumb();
    this.calculatedElement = true;
  }

  clickoutListener: any;

  resizeListener: any;

  private initializeClickoutListener() {
    document.addEventListener("click", this.wasClickedonDropdown);
  }

  private initializeResizeListener() {
    window.addEventListener("resize", () => {
      this.debounceResize();
    });
  }

  private removeClickoutListener() {
    if (this.clickoutListener) {
      this.clickoutListener();
    }
  }

  private removeResizeListener() {
    if (this.resizeListener) this.resizeListener();
  }
}
</script>

<style scoped></style>
