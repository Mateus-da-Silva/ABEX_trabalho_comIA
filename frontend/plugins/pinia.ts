// O @pinia/nuxt já registra o Pinia automaticamente.
// Este plugin carrega o token salvo no localStorage ao iniciar a aplicação.
export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();
  if (import.meta.client) {
    await authStore.loadFromStorage();
  }
});
