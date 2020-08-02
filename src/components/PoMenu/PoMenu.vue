<template>
  <div>
    <div v-if="mobileOpened" class="po-menu-overlay" @click="toggleMenuMobile()"></div>
    <div class="po-menu-mobile po-clickable" @click="toggleMenuMobile()">
      <span class="po-icon po-icon-menu"></span>
    </div>

    <div class="po-menu" :class="{ 'po-menu-animation': mobileOpened }">
      <div class="po-menu-header">
        <div v-if="logo || (shortLogo && enableCollapse)" class="po-menu-header-container-logo">
          <a href="./">
            <img
              :class="enableCollapse ? 'po-menu-short-logo' : 'po-menu-logo'"
              :src="enableCollapse ? shortLogo || logo : logo"
            />
          </a>
        </div>

        <!-- <div v-if="!enableCollapse && menuHeaderTemplate" class="po-menu-header-template">
          <ng-container *ngTemplateOutlet="menuHeaderTemplate.templateRef"></ng-container> 
        </div>-->

        <!-- <po-menu-filter
          v-if="filter && !enableCollapse"
          :loading="filterLoading"
          @filter="debounceFilter($event)"
        ></po-menu-filter>-->
      </div>

      <nav class="po-menu-body">
        <!-- Inner e outer para esconder scroll -->
        <div class="po-menu-outer">
          <div class="po-menu-inner">
            <div v-if="noData" class="po-menu-item-wrapper">
              <div class="po-menu-item-first">
                <div class="po-menu-icon-container po-menu-item-no-data">
                  <span class="po-icon po-icon-info po-menu-icon-item po-lg-2"></span>
                  <div class="po-lg-10 po-menu-icon-label">{{ literals.itemNotFound }}</div>
                </div>
              </div>
            </div>

            <div v-for="menu in filteredItems" :key="menu" class="po-menu-item-wrapper">
              <h1>{{menu.label}}</h1>
              <!-- <po-menu-item
                :class="{"po-menu-item-first" : menuIndex == 0}"
                [p-action]="menu.action"
                [p-badge-alert]="menu.badgeAlert"
                [p-badge-color]="menu.badge ? menu.badge.color : undefined"
                [p-badge-value]="menu.badge ? menu.badge.value : undefined"
                [p-collapsed-menu]="enableCollapse"
                [p-icon]="allowIcons ? menu.icon : null"
                [p-id]="menu.id"
                [p-label]="menu.label"
                [p-level]="menu.level"
                [p-link]="menu.link"
                [p-short-label]="menu.shortLabel"
                [p-sub-items]="menu.subItems"
                [p-type]="menu.type"
              ></po-menu-item>-->
            </div>
          </div>
        </div>
      </nav>

      <div v-if="hasFooter" class="po-menu-footer">
        <a class="po-menu-collapse-button-icon po-clickable" @click="toggle()">
          <span
            class="po-icon"
            [class.po-icon-menu-close]="enableCollapseButton"
            [class.po-icon-menu-open]="enableCollapse"
          ></span>
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { PoMenuItem } from "./po-menu-item.interface";
import { Subscription, of } from "rxjs";
import { map } from "rxjs/operators";
import { PoMenuService } from "./services/po-menu.service";
import { PoMenuItemsService } from "./services/po-menu-items.service";
import {
  isExternalLink,
  uuid,
  validValue,
  convertToBoolean,
  isTypeof,
  openExternalLink,
  isMobile,
  getFormattedLink
} from "../../utils";
import { PoMenuFilter } from "./po-menu-filter.interface";
import { PoMenuItemFiltered } from "./po-menu-item-filtered.interface";
@Options({
  props: {
    menus: Array,
    logo: String,
    shortLogo: String
  },
  emits: [],
  components: {}
})
export default class PoMenu extends Vue {
  updateMenus($event: any) {
    this.filteredItems = $event.target.value;
  }

  private poMenuDebounceTime = 400;
  private poMenuMinLength = 3;
  private poMenuRootLevel = 1;

  //   @ContentChild(PoMenuHeaderTemplateDirective, { static: true })
  //   menuHeaderTemplate: PoMenuHeaderTemplateDirective;

  menuHeaderTemplate = null;

  activeMenuItem!: PoMenuItem;
  collapsedMobile = false;
  filterLoading = false;
  groupedMenuItem?: PoMenuItem;
  linkActive!: string;
  mobileOpened = false;
  noData = false;
  timeoutFilter: any;

  private filteringItems = false;
  private menuInitialized = false;
  private menuPrevious!: string;
  private resizeListener() {
    //rever isso
  }

  private itemSubscription!: Subscription;
  private routeSubscription!: Subscription;

  //   constructor(
  //     //public changeDetector: ChangeDetectorRef,
  //     //viewRef: ViewContainerRef,
  //     //private element: ElementRef,
  //     //private renderer: Renderer2,
  //     //private router: Router,
  //     //private menuItemsService: PoMenuItemsService,
  //     //menuService: PoMenuService
  //     //languageService: PoLanguageService
  //   ) {

  //   }

  private menuItemsService: PoMenuItemsService = new PoMenuItemsService();
  private menuService: PoMenuService = new PoMenuService();

  private get isActiveItemMenuSubMenu() {
    return (
      (this.activeMenuItem as any)["level"] >
      (this.groupedMenuItem as any)["level"]
    );
  }

  get enableCollapse() {
    return this.isCollapsed && !this.collapsedMobile;
  }

  get enableCollapseButton() {
    return this.allowCollapseMenu && !this.collapsed && !this.mobileOpened;
  }

  get hasFooter() {
    return (
      (this.allowCollapseMenu &&
        !this.mobileOpened &&
        this.enableCollapseButton) ||
      (this.collapsed && !this.collapsedMobile)
    );
  }

  get isCollapsed() {
    return this.allowCollapseMenu && this.collapsed;
  }

  updated() {
    if (this.filteringItems && this.filter) {
      return;
    }

    const menuCurrent = JSON.stringify(this.menus);

    if (this.menuPrevious !== menuCurrent || !this.menuInitialized) {
      this.updateMenu();
      this.validateCollapseClass();
    }
  }

  deactivated() {
    this.itemSubscription.unsubscribe();
    this.routeSubscription.unsubscribe();

    if (this.resizeListener) {
      this.resizeListener();
    }
  }

  created() {
    this.subscribeToMenuItem();
    this.subscribeToRoute();
    this.setMenuExtraProperties();

    setTimeout(() => {
      // const urlRouter = this.checkingRouterChildrenFragments();
      // this.checkActiveMenuByUrl(urlRouter);
      this.filteredItems = [...this.menus];
      console.log(this.filteredItems, "created");
    });
  }

  activateMenuByUrl(urlPath: string, menus: Array<PoMenuItem>): any {
    if (menus) {
      return menus.some(menu => {
        const formattedLink = getFormattedLink(menu.link as string);
        if (formattedLink === urlPath) {
          this.linkActive = formattedLink;
          this.activateMenuItem(menu);
          return true;
        } else {
          return this.activateMenuByUrl(urlPath, menu.subItems);
        }
      });
    }
  }

  checkActiveMenuByUrl(urlPath: string): void {
    if (!this.linkActive || this.linkActive !== urlPath) {
      this.activateMenuByUrl(urlPath, this.menus);
    }
  }

  /**
   * <a id="colapseMethod"></a>
   *
   * *Método para colapsar (retrair) o menu.
   */
  collapse() {
    this.validateToggleMenu(true);
  }

  debounceFilter(filter: string) {
    clearTimeout(this.timeoutFilter);

    this.timeoutFilter = setTimeout(() => {
      this.filterProcess(filter);
    }, this.poMenuDebounceTime);
  }

  /**
   * <a id="expandMethod"></a>
   *
   * *Método para expandir (aumentar) o menu.
   */
  expand() {
    this.validateToggleMenu(false);
  }

  subscribeToMenuItem() {
    this.itemSubscription = this.menuItemsService
      .receiveFromChildMenuClicked()
      .subscribe((menu: PoMenuItem) => {
        this.clickMenuItem(menu);
      });
  }

  subscribeToRoute() {
    // this.routeSubscription = this.router.events.subscribe(val => {
    //   if (val instanceof NavigationEnd || val instanceof NavigationCancel) {
    //     const urlRouter = this.checkingRouterChildrenFragments();
    //     this.checkActiveMenuByUrl(urlRouter);
    //   }
    // });
  }

  /**
   * <a id="toggleMethod"></a>
   * *Método que colapsa e expande o menu alternadamente.
   *
   * > *Os métodos apenas vão colapsar/expandir o menu se:
   *  - Todos os itens de menu tiverem valor nas propriedades `icon` e `shortLabel`.
   */
  toggle() {
    this.validateToggleMenu(!this.collapsed);
  }

  toggleMenuMobile(): void {
    this.mobileOpened = !this.mobileOpened;
    this.collapsedMobile = this.collapsed && this.mobileOpened;

    this.validateCollapseClass(this.collapsedMobile);

    if (isMobile()) {
      return;
    }

    if (this.mobileOpened) {
      this.createResizeListener();
    }
  }

  private activateCollapseSubMenuItem() {
    this.clearGroupMenuIfFirstLevel(this.activeMenuItem);

    if (
      !this.collapsed &&
      (this.activeMenuItem as any)["level"] > this.poMenuRootLevel &&
      this.isActiveItemMenuSubMenu
    ) {
      this.openParentMenu(this.activeMenuItem);
    }
  }

  private activateMenuItem(menu: PoMenuItem): void {
    this.activeMenuItem = menu;
    this.linkActive = menu.link as string;
    if ((this.activeMenuItem as any)["level"] > this.poMenuRootLevel) {
      this.openParentMenu(this.activeMenuItem);
    } else {
      this.groupedMenuItem = undefined;
    }
    this.menuItemsService.sendToChildMenuClicked({
      active: this.activeMenuItem,
      grouped: this.groupedMenuItem,
      activatedByRoute: true
    });
  }

  private areSubMenus(menus: Array<PoMenuItem>) {
    return menus.every(menu => (menu as any)["level"] > this.poMenuRootLevel);
  }

  private checkingRouterChildrenFragments() {
    // const childrenPrimary = this.router.parseUrl(this.router.url).root.children[
    //   "primary"
    // ];
    // return childrenPrimary
    //   ? `/${childrenPrimary.segments.map(it => it.path).join("/")}`
    //   : "";
  }

  private clearGroupMenuIfFirstLevel(activeMenuItem: PoMenuItem) {
    if ((activeMenuItem as any)["level"] === this.poMenuRootLevel) {
      this.groupedMenuItem = undefined;
    }
  }

  private clickMenuItem(menu: PoMenuItem) {
    if (menu.action) {
      this.executeMenuAction(menu);
    }

    if ((menu as any)["type"] === "externalLink") {
      openExternalLink(menu.link as string);
    } else if ((menu as any)["type"] === "internalLink") {
      this.activateMenuItem(menu);
    } else if ((menu as any)["type"] === "subItems") {
      if (this.filteringItems) {
        this.filteringItems = false;
      }

      this.groupMenuItem(menu);
    }

    if ((menu as any)["type"] !== "subItems") {
      this.mobileOpened = false;
    }
  }

  private convertToMenuItemFiltered(
    menuItem: any = { label: "", link: "" }
  ): PoMenuItemFiltered {
    const { label, link } = menuItem;

    const menuItemFiltered: PoMenuItemFiltered = { label, link };

    this.setMenuItemProperties(menuItemFiltered as PoMenuItem);

    return menuItemFiltered;
  }

  private createResizeListener() {
    // this.resizeListener = this.renderer.listen("window", "resize", () => {

    // });
    window.addEventListener("resize", () => {
      this.toggleResize();
      this.resizeListener();
    });
  }

  private executeMenuAction(menu: PoMenuItem): void {
    if (menu.action) menu.action(menu);
  }

  private async filterItems(filter: string) {
    const trimFilter = filter && filter.trim();

    if (trimFilter) {
      this.filteredItems = [];
      this.filteredItems = this.filterService
        ? ((await this.filterOnService(trimFilter)) as PoMenuItem[])
        : this.filterLocalItems(trimFilter);
      this.filteringItems = true;
    } else {
      this.filteredItems = [...this.menus];
      this.filteringItems = false;
    }
  }

  private filterLocalItems(filter: string): PoMenuItem[] {
    const filteredItems: any[] = [];

    this.findItems(this.menus, filter.toLowerCase(), filteredItems);

    return filteredItems;
  }

  private filterProcess(filter: string) {
    this.filterLoading = true;

    this.filterItems(filter)
      .then(() => {
        this.filterLoading = false;

        this.showNoData();
        //this.changeDetector.detectChanges();
        this.menuItemsService.sendToChildMenuClicked({
          active: this.activeMenuItem,
          grouped: this.groupedMenuItem
        });
      })
      .catch(error => {
        this.filterLoading = false;
        Promise.reject(error);
      });
  }

  private async filterOnService(search = "") {
    if (search.length >= this.poMenuMinLength) {
      if (this.filterService)
        return await this.filterService
          .getFilteredData(search, this.params)
          .pipe(
            map(menuItemsFiltered =>
              menuItemsFiltered.map(menuItem =>
                this.convertToMenuItemFiltered(menuItem)
              )
            )
          )
          .toPromise();
    }

    return of(this.filteredItems).toPromise();
  }

  private findItems(
    menus: Array<PoMenuItem>,
    filter: string,
    filteredItems: Array<any>
  ) {
    // menus.forEach(menu => {
    //   if (
    //     (menu.label.toLowerCase().includes(filter) && !menu.subItems) ||
    //     (menu.subItems && this.findItems(menu.subItems, filter, filteredItems))
    //   ) {
    //     filteredItems.push(menu);
    //   }
    // });

    for (let i = 0; i < menus.length; i++) {
      const menu = menus[i];
      if (menu.label.toLowerCase().includes(filter) && !menu.subItems) {
        filteredItems.push(menu);
      }
      if (menu.subItems) {
        this.findItems(menu.subItems, filter, filteredItems);
      }
    }
  }

  private findParent(
    menus: Array<PoMenuItem>,
    menuItem: PoMenuItem
  ): PoMenuItem {
    const getParent = function(menuItems: Array<PoMenuItem>, id: string) {
      if (menuItems) {
        for (let index = 0; index < menuItems.length; index++) {
          const menu = menuItems[index];
          if (
            menu.subItems &&
            menu.subItems.find(subItem => (subItem as any)["id"] === id)
          ) {
            return menu;
          }
          const found: any = getParent(menu.subItems, id);
          if (found) {
            return found;
          }
        }
      }
    };
    return getParent(menus, (menuItem as any)["id"]);
  }

  private findRootParent(
    menus: Array<PoMenuItem>,
    menu: PoMenuItem
  ): PoMenuItem {
    const findParent = this.findParent;
    const menuRootLevel = this.poMenuRootLevel;

    const getRootParent = function(
      menuItems: Array<PoMenuItem>,
      menuItem: PoMenuItem
    ): PoMenuItem {
      let parent = findParent(menuItems, menuItem);

      if ((parent as any)["level"] !== menuRootLevel) {
        parent = getRootParent(menuItems, parent);
      }
      return parent;
    };
    return getRootParent(menus, menu);
  }

  private getActiveMenuParent(
    menus: Array<PoMenuItem>,
    activeMenuItem: PoMenuItem,
    groupedMenuItem: PoMenuItem
  ) {
    if (this.areSubMenus([groupedMenuItem, activeMenuItem])) {
      return this.findRootParent(menus, activeMenuItem);
    }
  }

  private groupMenuItem(menu: PoMenuItem): void {
    if (this.collapsed) {
      this.toggleMenuCollapse();
    }

    (menu as any)["isOpened"] = !(menu as any)["isOpened"];
    this.groupedMenuItem = menu;

    if (
      this.activeMenuItem &&
      (menu as any)["isOpened"] &&
      this.isActiveItemMenuSubMenu &&
      this.isRootMenuEqualGroupedMenu(this.menus, this.activeMenuItem, menu)
    ) {
      this.activateMenuItem(this.activeMenuItem);
    }

    this.menuItemsService.sendToChildMenuClicked({
      active: this.activeMenuItem,
      grouped: this.groupedMenuItem
    });
  }

  private isRootMenuEqualGroupedMenu(
    menus: Array<PoMenuItem>,
    activeMenuItem: PoMenuItem,
    groupedMenuItem: PoMenuItem
  ) {
    const activeMenuRootParent = this.findRootParent(menus, activeMenuItem);
    return (
      (activeMenuRootParent as any)["id"] ===
      (activeMenuRootParent as any)["id"]
    );
  }

  private openParentMenu(childMenu: PoMenuItem): void {
    const parent = this.findParent(this.menus, childMenu);
    (parent as any)["isOpened"] = true;
    this.groupedMenuItem = parent;
  }

  private showNoData() {
    this.noData = this.filteredItems.length === 0;
  }

  private toggleGroupedMenuItem() {
    (this.groupedMenuItem as any)["isOpened"] =
      !this.collapsed && this.allowCollapseMenu;
  }

  private toggleMenuCollapse(collapsed = false) {
    this.collapsed = collapsed;

    if (this.groupedMenuItem && this.activeMenuItem) {
      this.groupedMenuItem =
        this.getActiveMenuParent(
          this.menus,
          this.activeMenuItem,
          this.groupedMenuItem
        ) || this.groupedMenuItem;
      this.toggleGroupedMenuItem();
    }

    if (this.activeMenuItem) {
      this.activateCollapseSubMenuItem();
      this.menuItemsService.sendToChildMenuClicked({
        active: this.activeMenuItem,
        grouped: this.groupedMenuItem,
        activatedByRoute: true
      });
    }

    this.updateMenu();
  }

  private toggleResize() {
    if (this.mobileOpened) {
      this.mobileOpened = false;
      this.collapsedMobile = false;
      this.validateCollapseClass(this.collapsedMobile);
    }
  }

  private validateToggleMenu(collapsed: boolean) {
    if (!this.allowCollapseMenu) {
      return;
    }

    this.toggleMenuCollapse(collapsed);
  }

  private updateMenu() {
    this.menuInitialized = true;
    this.setMenuExtraProperties();
    this.filteredItems = [...this.menus];
    console.log(this.filteredItems, "updateMenu");
    this.menuPrevious = JSON.stringify(this.menus);
    this.validateMenus(this.menus);
  }

  protected validateCollapseClass(collapsedMobile = false) {
    const wrapper = this.$el.parentNode;
    // this.renderer[
    //   this.isCollapsed && !collapsedMobile ? "addClass" : "removeClass"
    // ](wrapper, "po-collapsed-menu");
  }

  // Base Component

  private _collapsed = false;
  private _filter = false;
  private _level = 0;
  public logo = "";
  private _maxLevel = 4;
  private _menus: PoMenuItem[] = [];
  private _params: any;
  private _service!: string | PoMenuFilter;
  public shortLogo = "";

  allowIcons!: boolean;
  allowCollapseMenu!: boolean;

  private filteredItems: PoMenuItem[] = [];
  private filterService?: PoMenuFilter;

  //   readonly literals = {
  //     ...poMenuLiteralsDefault[this.languageService.getLanguageDefault()],
  //     ...poMenuLiteralsDefault[this.languageService.getShortLanguage()]
  //   };

  /**
   * @optional
   *
   * @description
   *
   * Colapsa (retrai) o menu e caso receba o valor `false` expande o menu.
   *
   * > Utilize esta propriedade para iniciar o menu colapsado.
   *
   * > Ao utilizar os métodos [`colapse`](documentation/po-menu#colapseMethod), [`expand`](documentation/po-menu#expandMethod) e
   * [`toggle`](documentation/po-menu#toggleMethod) o valor desta propriedade não é alterado.
   *
   * **Importante:**
   *
   * > O menu será colapsado/expandido apenas se todos os itens de menu tiverem valor nas propriedades `icon` e `shortLabel`.
   *
   * @default `false`
   */
  set collapsed(collapsed: boolean) {
    this._collapsed = convertToBoolean(collapsed);

    this.validateCollapseClass();
  }

  get collapsed() {
    return this._collapsed;
  }

  public menus: PoMenuItem[] = [];

  get maxLevel() {
    return this._maxLevel;
  }

  /**
   * @optional
   *
   * @description
   *
   * Habilita um campo para pesquisa no menu.
   * A pesquisa é realizada em todos os níveis do menu e busca apenas pelos itens que contém uma ação e/ou link definidos,
   * ou também, pode ser realizada através de um serviço definido na propriedade `p-service`.
   *
   * > O campo de pesquisa é desabilitado se o menu estiver colapsado.
   *
   * @default `false`
   */
  set filter(filter: boolean) {
    this._filter = (filter as any) === "" ? true : convertToBoolean(filter);
    console.log(this.filteredItems, "filter");
    this.filteredItems = [...this._menus];
  }

  get filter() {
    return this._filter;
  }

  /**
   * @optional
   *
   * @description
   *
   * Nesta propriedade deve ser informada a URL do serviço em que será utilizado para realizar o filtro de itens do
   * menu quando realizar uma busca. Caso haja a necessidade de customização, pode ser informado um
   * serviço implementando a interface `PoMenuFilter`.
   *
   * Caso utilizada uma URL, o serviço deve retornar os dados conforme o
   * [Guia de implementação de APIs](https://po-ui.io/guides/api) do PO UI.
   *
   * Quando utilizada uma URL de serviço, será realizado um *GET* na URL informada, passando o valor digitado
   * no parâmetro `search`, veja exemplo:
   *
   * > O filtro no serviço será realizado caso contenha no mínimo três caracteres no campo de busca, por exemplo `tot`.
   *
   * ```
   * <po-menu p-service="/api/v1/fnd/menu">
   * </po-menu>
   *
   * Requisição: GET /api/v1/fnd/menu?search=contas
   * ```
   *
   * > É necessário que propriedade `p-filter` esteja habilitada.
   */
  set service(value: string | PoMenuFilter) {
    this._service = value || "";

    this.configService(this.service);
  }

  get service() {
    return this._service;
  }

  /**
   * @optional
   *
   * @description
   *
   * Deve ser informado um objeto que deseja-se utilizar na requisição de filtro dos itens de menu.
   *
   * Caso utilizado um serviço customizado, implementando a interface `PoMenuFilter`, o valor desta propriedade
   * será passado como parâmetro, na função `getFilteredData`.
   *
   * Quando utilizada uma URL de serviço, será realizado um *GET* na URL informada, passando os valores informados
   * nesta propriedade em conjunto com o parâmetro `search`, veja exemplo:
   *
   * ```
   * <po-menu p-service="/api/v1/fnd/menu" [p-params]="{ company: 1, user: 297767512 }">
   * </po-menu>
   *
   * Requisição: GET /api/v1/fnd/menu?search=contas&company=1&user=297767512
   * ```
   */
  set params(value: any) {
    this._params = value && isTypeof(value, "object") ? value : undefined;
  }

  get params() {
    return this._params;
  }

  private configService(service: string | PoMenuFilter) {
    if (typeof service === "string" && service.trim()) {
      // service url
      this.menuService.configProperties(service);
      this.filterService = this.menuService;
    } else if (typeof service === "object" && service.getFilteredData) {
      // custom service
      this.filterService = service;
    } else {
      this.filterService = undefined;
    }
  }

  protected setMenuExtraProperties() {
    this.allowIcons = !!this.menus.length;
    this.allowCollapseMenu = !!this.menus.length;

    this.menus.forEach(menuItem => {
      this._level = 1;
      this.allowIcons = this.allowIcons ? validValue(menuItem.icon) : false;
      this.allowCollapseMenu =
        this.allowCollapseMenu && this.allowIcons
          ? validValue(menuItem.shortLabel)
          : false;
      this.removeBadgeAlert(menuItem);
      this.setMenuItemProperties(menuItem);

      if (menuItem.subItems) {
        this._level++;
        this.processSubItems(menuItem);
      }
    });
  }

  protected setMenuItemProperties(menuItem: PoMenuItem): void {
    (menuItem as any)["id"] = (menuItem as any)["id"] || uuid();
    (menuItem as any)["level"] = this._level;
    (menuItem as any)["type"] = this.setMenuType(menuItem);
  }

  protected validateMenus(menus: PoMenuItem[]): void {
    menus.forEach(menu => this.validateMenu(menu));
  }

  private processSubItems(menu: PoMenuItem) {
    menu.subItems.forEach((menuItem, index, menuItems) => {
      const previousItem = menuItems[index - 1];
      if (previousItem && previousItem.subItems) {
        this._level = (previousItem as any)["level"];
      }

      if (this._level <= this.maxLevel) {
        this.setMenuItemProperties(menuItem);

        if (menuItem.subItems) {
          this._level++;
          this.processSubItems(menuItem);
        }
      }

      if (!(menu as any)["badgeAlert"]) {
        menu = this.setMenuBadgeAlert(menu, menuItem);
      }
    });

    menu.subItems = Object.assign([], menu.subItems);
  }

  private removeBadgeAlert(menuItem: PoMenuItem): void {
    if ((menuItem as any)["badgeAlert"]) {
      delete (menuItem as any)["badgeAlert"];
    }

    if (menuItem.subItems) {
      menuItem.subItems.forEach(subItem => this.removeBadgeAlert(subItem));
    }
  }

  private setMenuBadgeAlert(parent: PoMenuItem, child: PoMenuItem): PoMenuItem {
    const childHasSubItems = child.subItems && child.subItems.length;
    const childHasBadgeAlert = (child as any)["badgeAlert"];
    const childHasBadge = child.badge && child.badge.value >= 0;

    (parent as any)["badgeAlert"] =
      childHasBadgeAlert || (childHasBadge && !childHasSubItems);

    return parent;
  }

  private setMenuType(menuItem: PoMenuItem): string {
    if (
      menuItem.subItems &&
      menuItem.subItems.length > 0 &&
      this._level < this.maxLevel
    ) {
      return "subItems";
    }
    if (!menuItem.link) {
      return "noLink";
    }
    if (isExternalLink(menuItem.link)) {
      return "externalLink";
    }
    return "internalLink";
  }

  private validateMenu(menuItem: PoMenuItem): void {
    if (!menuItem.label || menuItem.label.trim() === "") {
      //throw new Error(this.literals.emptyLabelError);
      throw new Error("this.literals.emptyLabelError");
    } else if (menuItem.subItems) {
      menuItem.subItems.forEach(subItem => {
        this.validateMenu(subItem);
      });
    }
  }
}
</script>

<style scoped></style>
