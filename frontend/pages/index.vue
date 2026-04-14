<script setup lang="ts">
// Redireciona automaticamente para o dashboard ou login
const authStore = useAuthStore();

if (authStore.isAuthenticated) {
  await navigateTo('/dashboard');
} else {
  await navigateTo('/auth/login');
}
</script>
