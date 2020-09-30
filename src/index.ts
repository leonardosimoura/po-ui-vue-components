import Vue from "vue";
import { PoButton, PoLoadingIcon } from "./components"

const components = {
    PoButton,
    PoLoadingIcon
}

export const poUIPlugin = {
    install: (vue: Vue.App, options: any) => {
        vue.component('PoButton', PoButton);
        vue.component('PoLoadingIcon', PoLoadingIcon);
    }
};

export default components;