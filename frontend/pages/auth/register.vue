<template>
  <div class="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-4">
    <div class="w-full max-w-lg">

      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 mb-4">
          <span class="text-white font-bold text-xl">C</span>
        </div>
        <h1 class="text-2xl font-bold text-surface-900 dark:text-white">Criar sua clínica</h1>
        <p class="text-surface-500 dark:text-surface-400 mt-1 text-sm">
          14 dias grátis · Sem cartão de crédito
        </p>
      </div>

      <!-- Steps indicator -->
      <div class="flex items-center gap-2 mb-8">
        <div
          v-for="(step, i) in steps"
          :key="i"
          class="flex items-center gap-2 flex-1"
        >
          <div
            :class="[
              'flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors flex-shrink-0',
              currentStep > i
                ? 'bg-primary-600 text-white'
                : currentStep === i
                  ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400 ring-2 ring-primary-500'
                  : 'bg-surface-200 dark:bg-surface-800 text-surface-400',
            ]"
          >
            <Check v-if="currentStep > i" class="w-3.5 h-3.5" />
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span
            :class="[
              'text-xs font-medium hidden sm:block',
              currentStep === i ? 'text-surface-800 dark:text-white' : 'text-surface-400',
            ]"
          >{{ step }}</span>
          <div v-if="i < steps.length - 1" class="flex-1 h-px bg-surface-200 dark:bg-surface-700 mx-1" />
        </div>
      </div>

      <!-- Card -->
      <div class="card p-8">

        <!-- STEP 0: Dados da clínica -->
        <div v-if="currentStep === 0">
          <h2 class="text-base font-semibold text-surface-900 dark:text-white mb-5">
            Dados da clínica
          </h2>
          <div class="space-y-4">
            <div>
              <label class="label">Nome da clínica *</label>
              <input
                v-model="form.clinicName"
                class="input"
                :class="{ 'input-error': errors.clinicName }"
                placeholder="Ex: Studio Bella Vita"
                @input="generateSlug"
              />
              <p v-if="errors.clinicName" class="mt-1 text-xs text-red-500">{{ errors.clinicName }}</p>
            </div>

            <div>
              <label class="label">
                Identificador único
                <span class="text-xs font-normal text-surface-400 ml-1">(usado na URL)</span>
              </label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-surface-400 select-none">
                  clinica.app/
                </span>
                <input
                  v-model="form.slug"
                  class="input pl-[88px]"
                  :class="{ 'input-error': errors.slug }"
                  placeholder="bella-vita"
                />
              </div>
              <p v-if="errors.slug" class="mt-1 text-xs text-red-500">{{ errors.slug }}</p>
              <p v-else class="mt-1 text-xs text-surface-400">Apenas letras minúsculas, números e hífens</p>
            </div>
          </div>
        </div>

        <!-- STEP 1: Dados pessoais -->
        <div v-if="currentStep === 1">
          <h2 class="text-base font-semibold text-surface-900 dark:text-white mb-5">
            Seus dados de acesso
          </h2>
          <div class="space-y-4">
            <div>
              <label class="label">Seu nome completo *</label>
              <input
                v-model="form.name"
                class="input"
                :class="{ 'input-error': errors.name }"
                placeholder="Maria Silva"
              />
              <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
            </div>

            <div>
              <label class="label">E-mail *</label>
              <input
                v-model="form.email"
                type="email"
                class="input"
                :class="{ 'input-error': errors.email }"
                placeholder="maria@bellavita.com"
              />
              <p v-if="errors.email" class="mt-1 text-xs text-red-500">{{ errors.email }}</p>
            </div>

            <div>
              <label class="label">WhatsApp / Telefone *</label>
              <input
                v-model="form.phone"
                class="input"
                :class="{ 'input-error': errors.phone }"
                placeholder="(11) 99999-9999"
              />
              <p v-if="errors.phone" class="mt-1 text-xs text-red-500">{{ errors.phone }}</p>
            </div>
          </div>
        </div>

        <!-- STEP 2: Senha -->
        <div v-if="currentStep === 2">
          <h2 class="text-base font-semibold text-surface-900 dark:text-white mb-5">
            Crie sua senha
          </h2>
          <div class="space-y-4">
            <div>
              <label class="label">Senha *</label>
              <div class="relative">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="input pr-10"
                  :class="{ 'input-error': errors.password }"
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400"
                  @click="showPassword = !showPassword"
                >
                  <EyeOff v-if="showPassword" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
              <!-- Força da senha -->
              <div class="mt-2 flex gap-1">
                <div
                  v-for="i in 4"
                  :key="i"
                  :class="[
                    'h-1 flex-1 rounded-full transition-colors',
                    passwordStrength >= i ? strengthColor : 'bg-surface-200 dark:bg-surface-700',
                  ]"
                />
              </div>
              <p v-if="errors.password" class="mt-1 text-xs text-red-500">{{ errors.password }}</p>
            </div>

            <div>
              <label class="label">Confirmar senha *</label>
              <input
                v-model="form.confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                class="input"
                :class="{ 'input-error': errors.confirmPassword }"
                placeholder="Repita a senha"
              />
              <p v-if="errors.confirmPassword" class="mt-1 text-xs text-red-500">{{ errors.confirmPassword }}</p>
            </div>

            <!-- Plano -->
            <div class="pt-2">
              <label class="label">Plano inicial</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="plan in plans"
                  :key="plan.value"
                  type="button"
                  :class="[
                    'flex flex-col items-center p-3 rounded-xl border-2 transition-all text-center',
                    form.plan === plan.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-surface-200 dark:border-surface-700 hover:border-surface-300',
                  ]"
                  @click="form.plan = plan.value"
                >
                  <span class="text-xs font-semibold text-surface-800 dark:text-white">{{ plan.label }}</span>
                  <span class="text-xs text-primary-600 dark:text-primary-400 font-bold mt-0.5">{{ plan.price }}</span>
                  <span class="text-[10px] text-surface-400 mt-0.5">{{ plan.desc }}</span>
                </button>
              </div>
              <p class="text-xs text-surface-400 mt-2 text-center">
                14 dias grátis em qualquer plano · Cancele quando quiser
              </p>
            </div>
          </div>
        </div>

        <!-- Erro geral -->
        <div
          v-if="errorMessage"
          class="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mt-4"
        >
          <AlertCircle class="w-4 h-4 text-red-500 flex-shrink-0" />
          <p class="text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
        </div>

        <!-- Botões de navegação -->
        <div class="flex gap-3 mt-6">
          <button
            v-if="currentStep > 0"
            type="button"
            class="btn btn-secondary flex-1"
            @click="currentStep--"
          >
            ← Voltar
          </button>

          <button
            v-if="currentStep < steps.length - 1"
            type="button"
            class="btn btn-primary flex-1"
            @click="nextStep"
          >
            Continuar →
          </button>

          <button
            v-else
            type="button"
            class="btn btn-primary flex-1"
            :disabled="loading"
            @click="handleRegister"
          >
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <span>{{ loading ? 'Criando clínica...' : 'Criar minha clínica' }}</span>
          </button>
        </div>
      </div>

      <p class="text-center text-sm text-surface-500 dark:text-surface-400 mt-6">
        Já tem conta?
        <NuxtLink to="/auth/login" class="text-primary-600 dark:text-primary-400 font-medium hover:underline">
          Fazer login
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Eye, EyeOff, Check, AlertCircle, Loader2 } from 'lucide-vue-next';

definePageMeta({ layout: false });

const authStore = useAuthStore();
const router = useRouter();
const { post } = useApiRequest();

const steps = ['Clínica', 'Seus dados', 'Senha'];
const currentStep = ref(0);
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref('');

const form = reactive({
  clinicName: '',
  slug: '',
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  plan: 'starter',
});

const errors = reactive({
  clinicName: '', slug: '', name: '',
  email: '', phone: '', password: '', confirmPassword: '',
});

const plans = [
  { value: 'starter',      label: 'Starter',      price: 'R$ 97/mês',  desc: '1 profissional' },
  { value: 'professional', label: 'Professional',  price: 'R$ 197/mês', desc: '5 profissionais' },
  { value: 'business',     label: 'Business',      price: 'R$ 397/mês', desc: '15 profissionais' },
];

// Gera o slug automaticamente a partir do nome da clínica
function generateSlug() {
  form.slug = form.clinicName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// Força da senha (1-4)
const passwordStrength = computed(() => {
  const p = form.password;
  if (!p) return 0;
  let score = 0;
  if (p.length >= 8)           score++;
  if (/[A-Z]/.test(p))         score++;
  if (/[0-9]/.test(p))         score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  return score;
});

const strengthColor = computed(() => {
  if (passwordStrength.value <= 1) return 'bg-red-400';
  if (passwordStrength.value === 2) return 'bg-amber-400';
  if (passwordStrength.value === 3) return 'bg-yellow-400';
  return 'bg-emerald-500';
});

function clearErrors() {
  Object.keys(errors).forEach((k) => ((errors as any)[k] = ''));
  errorMessage.value = '';
}

function nextStep() {
  clearErrors();

  if (currentStep.value === 0) {
    if (!form.clinicName.trim()) { errors.clinicName = 'Informe o nome da clínica'; return; }
    if (!form.slug.trim())       { errors.slug = 'Informe o identificador'; return; }
    if (!/^[a-z0-9-]+$/.test(form.slug)) {
      errors.slug = 'Use apenas letras minúsculas, números e hífens'; return;
    }
  }

  if (currentStep.value === 1) {
    if (!form.name.trim())  { errors.name = 'Informe seu nome'; return; }
    if (!form.email.trim()) { errors.email = 'Informe o e-mail'; return; }
    if (!form.phone.trim()) { errors.phone = 'Informe o telefone'; return; }
  }

  currentStep.value++;
}

async function handleRegister() {
  clearErrors();

  if (!form.password || form.password.length < 8) {
    errors.password = 'A senha deve ter no mínimo 8 caracteres'; return;
  }
  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'As senhas não coincidem'; return;
  }

  loading.value = true;
  try {
    const data = await post<any>('/auth/register', {
      clinicName: form.clinicName,
      slug: form.slug,
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
      plan: form.plan,
    });

    // Salvar token e redirecionar
    authStore.token = data.access_token;
    authStore.refreshToken = data.refresh_token;
    authStore.user = data.user;
    authStore.clinic = data.clinic;

    if (import.meta.client) {
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('auth_refresh', data.refresh_token);
    }

    await router.push('/dashboard');
  } catch (err: any) {
    const msg = err?.response?.data?.error?.message
      || err?.response?.data?.message
      || 'Erro ao criar a clínica. Tente novamente.';
    errorMessage.value = msg;
    currentStep.value = 0;
  } finally {
    loading.value = false;
  }
}
</script>
