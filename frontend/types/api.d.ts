import type { AxiosInstance } from 'axios';

// Declara o $api injetado pelo plugin plugins/api.ts
declare module '#app' {
  interface NuxtApp {
    $api: AxiosInstance;
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $api: AxiosInstance;
  }
}

export {};
