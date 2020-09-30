import Vue from "vue";
import { PoButton, PoLoadingIcon } from "./src/components";

const components = {
    PoButton,
    PoLoadingIcon
}

export const poUIPlugin = {
    install: (vue: Vue.App, options: any) => {
        vue.component('PoButton', PoButton);// ver se realmente precisa disso
        vue.component('PoLoadingIcon', PoLoadingIcon);
    }
};

export default components;