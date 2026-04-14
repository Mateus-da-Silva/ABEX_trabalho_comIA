<template>
  <div class="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-4">
    <div class="w-full max-w-md">

      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 mb-4">
          <span class="text-white font-bold text-xl">C</span>
        </div>
        <h1 class="text-2xl font-bold text-surface-900 dark:text-white">ClinicaSaaS</h1>
        <p class="text-surface-500 dark:text-surface-400 mt-1 text-sm">
          Gestão inteligente para clínicas de estética
        </p>
      </div>

      <!-- Card de login -->
      <div class="card p-8">
        <h2 class="text-lg font-semibold text-surface-900 dark:text-white mb-6">
          Entrar na sua conta
        </h2>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Email -->
          <div>
            <label class="label">E-mail</label>
            <input
              v-model="form.email"
              type="email"
              class="input"
              :class="{ 'input-error': errors.email }"
              placeholder="seu@email.com"
              autocomplete="email"
              required
            />
            <p v-if="errors.email" class="mt-1 text-xs text-red-500">{{ errors.email }}</p>
          </div>

          <!-- Senha -->
          <div>
            <div class="flex justify-between items-baseline mb-1.5">
              <label class="label !mb-0">Senha</label>
              <a href="#" class="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                Esqueceu a senha?
              </a>
            </div>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="input pr-10"
                :class="{ 'input-error': errors.password }"
                placeholder="••••••••"
                autocomplete="current-password"
                required
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-xs text-red-500">{{ errors.password }}</p>
          </div>

          <!-- Erro geral -->
          <div
            v-if="errorMessage"
            class="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          >
            <AlertCircle class="w-4 h-4 text-red-500 flex-shrink-0" />
            <p class="text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
          </div>

          <!-- Botão -->
          <button
            type="submit"
            class="btn btn-primary w-full btn-lg mt-2"
            :disabled="loading"
          >
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <span>{{ loading ? 'Entrando...' : 'Entrar' }}</span>
          </button>
        </form>

        <div class="divider my-6" />

        <p class="text-center text-sm text-surface-500 dark:text-surface-400">
          Não tem conta?
          <NuxtLink to="/auth/register" class="text-primary-600 dark:text-primary-400 font-medium hover:underline">
            Criar clínica grátis
          </NuxtLink>
        </p>
      </div>

      <!-- Rodapé -->
      <p class="text-center text-xs text-surface-400 mt-6">
        © 2026 ClinicaSaaS · Todos os direitos reservados
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-vue-next';

definePageMeta({ layout: false });

const authStore = useAuthStore();
const router = useRouter();

const form = reactive({ email: '', password: '' });
const errors = reactive({ email: '', password: '' });
const errorMessage = ref('');
const loading = ref(false);
const showPassword = ref(false);

// Redirecionar se já logado
if (authStore.isAuthenticated) {
  await navigateTo('/dashboard');
}

async function handleLogin() {
  errors.email = '';
  errors.password = '';
  errorMessage.value = '';

  if (!form.email) { errors.email = 'Informe o e-mail'; return; }
  if (!form.password) { errors.password = 'Informe a senha'; return; }

  loading.value = true;
  try {
    await authStore.login(form.email, form.password);
    await router.push('/dashboard');
  } catch (err: any) {
    const msg = err?.response?.data?.error?.message || err?.message || 'Erro ao fazer login';
    errorMessage.value = msg;
  } finally {
    loading.value = false;
  }
}
</script>
