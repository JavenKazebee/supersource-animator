import { createApp } from "vue";
import router from "./router/index.ts";
import PrimeVue from "primevue/config";
import Material from "@primevue/themes/material";

import Card from "primevue/card";
import Button from "primevue/button";
import Popover from "primevue/popover";
import RadioButton from "primevue/radiobutton";
import InputText from "primevue/inputtext";
import FloatLabel from "primevue/floatlabel";

import "./style.css";
import App from "./App.vue";

createApp(App)
  .use(router)
  .use(PrimeVue, {
    theme: {
      preset: Material,
    },
  })
  .component("Card", Card)
  .component("Button", Button)
  .component("Popover", Popover)
  .component("RadioButton", RadioButton)
  .component("InputText", InputText)
  .component("FloatLabel", FloatLabel)
  .mount("#app");
