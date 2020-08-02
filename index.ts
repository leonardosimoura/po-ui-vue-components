import Vue from "vue";
import { PoButton, PoLoadingIcon, PoBreadcrumb } from "./src/components";

const components = {
    PoButton,
    PoLoadingIcon
}

export const poUIPlugin = {
    install: (vue: Vue.App, options: any) => {
        vue.component('PoButton', PoButton);// ver se realmente precisa disso
        vue.component('PoLoadingIcon', PoLoadingIcon);// ver se realmente precisa disso
    }
};

export default components;