<template>
  <div class="animate-fade-in max-w-4xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
          <IconSparkles class="w-5 h-5 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-surface-900 dark:text-white">Assistente IA</h1>
      </div>
      <p class="text-surface-500 dark:text-surface-400">
        Análises inteligentes e sugestões personalizadas para sua clínica
      </p>
    </div>

    <!-- Quick insights cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <button
        v-for="insight in quickInsights"
        :key="insight.label"
        class="card card-hover p-4 text-left"
        @click="sendMessage(insight.prompt)"
      >
        <div :class="['w-9 h-9 rounded-xl flex items-center justify-center mb-3', insight.bg]">
          <component :is="insight.icon" :class="['w-4.5 h-4.5', insight.color]" />
        </div>
        <p class="text-sm font-semibold text-surface-900 dark:text-white">{{ insight.label }}</p>
        <p class="text-xs text-surface-500 mt-0.5">{{ insight.description }}</p>
      </button>
    </div>

    <!-- Chat interface -->
    <div class="card overflow-hidden">
      <!-- Messages -->
      <div
        ref="messagesContainer"
        class="h-[420px] overflow-y-auto p-5 space-y-4"
      >
        <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center">
          <div class="w-16 h-16 rounded-3xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
            <IconSparkles class="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <p class="text-surface-700 dark:text-surface-300 font-medium">Como posso ajudar hoje?</p>
          <p class="text-sm text-surface-400 mt-1 max-w-sm">
            Pergunte sobre faturamento, clientes, agenda ou peça sugestões de marketing
          </p>
        </div>

        <div
          v-for="(msg, i) in messages"
          :key="i"
          :class="['flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start']"
        >
          <!-- AI avatar -->
          <div
            v-if="msg.role === 'assistant'"
            class="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0 mt-0.5"
          >
            <IconSparkles class="w-4 h-4 text-white" />
          </div>

          <div
            :class="[
              'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
              msg.role === 'user'
                ? 'bg-primary-600 text-white rounded-tr-none'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-800 dark:text-surface-200 rounded-tl-none',
            ]"
          >
            <p class="whitespace-pre-wrap">{{ msg.content }}</p>
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="isLoading" class="flex gap-3 justify-start">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
            <IconSparkles class="w-4 h-4 text-white" />
          </div>
          <div class="bg-surface-100 dark:bg-surface-800 rounded-2xl rounded-tl-none px-4 py-3">
            <div class="flex gap-1.5 items-center h-5">
              <div v-for="i in 3" :key="i" class="w-2 h-2 rounded-full bg-surface-400 animate-bounce" :style="`animation-delay: ${i * 0.15}s`" />
            </div>
          </div>
        </div>
      </div>

      <!-- Input area -->
      <div class="border-t border-surface-200 dark:border-surface-800 p-4">
        <div class="flex gap-3 items-end">
          <div class="flex-1">
            <textarea
              v-model="inputMessage"
              class="input resize-none min-h-[44px] max-h-[120px]"
              placeholder="Digite uma pergunta..."
              rows="1"
              @keydown.enter.exact.prevent="sendMessage()"
              @input="autoResize"
            />
          </div>
          <button
            class="btn btn-primary flex-shrink-0 h-11 w-11 p-0 !rounded-xl"
            :disabled="!inputMessage.trim() || isLoading"
            @click="sendMessage()"
          >
            <IconSend class="w-4 h-4" />
          </button>
        </div>
        <p class="text-xs text-surface-400 mt-2">
          Enter para enviar · Shift+Enter para nova linha
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sparkles, Send, TrendingUp, Users, Megaphone, Calendar } from 'lucide-vue-next';

definePageMeta({ layout: 'dashboard' });

const { post } = useApiRequest();

const IconSparkles = Sparkles;
const IconSend = Send;

const messages = ref<{ role: 'user' | 'assistant'; content: string }[]>([]);
const inputMessage = ref('');
const isLoading = ref(false);
const messagesContainer = ref<HTMLElement>();

const quickInsights = [
  {
    label: 'Análise de Faturamento',
    description: 'Insights sobre receita e tendências',
    prompt: 'Analise o faturamento da minha clínica e me dê insights sobre tendências e oportunidades',
    icon: TrendingUp,
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    color: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    label: 'Reativar Clientes',
    description: 'Clientes inativos e estratégias',
    prompt: 'Quais clientes estão inativos e o que posso fazer para reativá-los?',
    icon: Users,
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    label: 'Campanhas de Marketing',
    description: 'Sugestões personalizadas de campanhas',
    prompt: 'Sugira campanhas de marketing para aumentar o faturamento este mês',
    icon: Megaphone,
    bg: 'bg-primary-100 dark:bg-primary-900/30',
    color: 'text-primary-600 dark:text-primary-400',
  },
];

async function sendMessage(text?: string) {
  const content = text || inputMessage.value.trim();
  if (!content || isLoading.value) return;

  messages.value.push({ role: 'user', content });
  inputMessage.value = '';
  isLoading.value = true;

  await nextTick();
  scrollToBottom();

  try {
    const history = messages.value.slice(-10, -1).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await post<any>('/ai/chat', {
      message: content,
      history,
    });

    messages.value.push({ role: 'assistant', content: response.message });
  } catch (e) {
    messages.value.push({
      role: 'assistant',
      content: 'Desculpe, ocorreu um erro. Tente novamente em instantes.',
    });
  } finally {
    isLoading.value = false;
    await nextTick();
    scrollToBottom();
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

function autoResize(e: Event) {
  const el = e.target as HTMLTextAreaElement;
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}
</script>
