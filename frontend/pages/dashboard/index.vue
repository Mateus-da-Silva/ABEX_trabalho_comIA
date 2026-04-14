<template>
  <div class="animate-fade-in">
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-surface-900 dark:text-white">
        Bom dia, {{ firstName }} 👋
      </h1>
      <p class="mt-1 text-surface-500 dark:text-surface-400">
        {{ formattedDate }} · Aqui está o resumo da sua clínica hoje
      </p>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <KpiCard
        label="Faturamento do Mês"
        :value="formatCurrency(stats.monthRevenue)"
        :trend="stats.revenueGrowth"
        trend-label="vs. mês anterior"
        color="purple"
        icon="DollarSign"
      />
      <KpiCard
        label="Atendimentos Hoje"
        :value="String(stats.today)"
        color="blue"
        icon="Calendar"
      />
      <KpiCard
        label="Novos Clientes"
        :value="String(clientStats.newThisMonth)"
        trend="+12%"
        trend-label="este mês"
        color="green"
        icon="UserPlus"
      />
      <KpiCard
        label="Taxa de Faltas"
        :value="stats.absenceRate"
        color="amber"
        icon="UserX"
        :invert-trend="true"
      />
    </div>

    <!-- Charts row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- Revenue chart (2/3) -->
      <div class="lg:col-span-2 card p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="font-semibold text-surface-900 dark:text-white">Faturamento</h2>
            <p class="text-xs text-surface-500 mt-0.5">Últimos 6 meses</p>
          </div>
          <div class="flex gap-2">
            <button
              v-for="period in ['6M', '3M', '1M']"
              :key="period"
              :class="[
                'btn btn-sm text-xs',
                activePeriod === period ? 'btn-primary' : 'btn-secondary',
              ]"
              @click="activePeriod = period"
            >
              {{ period }}
            </button>
          </div>
        </div>
        <RevenueChart :data="revenueChartData" />
      </div>

      <!-- Top services (1/3) -->
      <div class="card p-6">
        <h2 class="font-semibold text-surface-900 dark:text-white mb-1">Top Serviços</h2>
        <p class="text-xs text-surface-500 mb-5">Este mês</p>

        <div class="space-y-3">
          <div
            v-for="(service, i) in topServices"
            :key="service.name"
            class="flex items-center gap-3"
          >
            <span class="w-5 text-xs font-bold text-surface-400">{{ i + 1 }}</span>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-baseline mb-1">
                <span class="text-sm font-medium text-surface-800 dark:text-surface-200 truncate">
                  {{ service.name }}
                </span>
                <span class="text-xs text-surface-500 ml-2 flex-shrink-0">{{ service.count }}x</span>
              </div>
              <div class="h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                <div
                  class="h-full bg-primary-500 rounded-full transition-all duration-700"
                  :style="{ width: `${(service.count / topServices[0].count) * 100}%` }"
                />
              </div>
            </div>
            <span class="text-xs font-semibold text-surface-700 dark:text-surface-300 w-16 text-right">
              {{ formatCurrency(service.revenue) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Today's appointments + Quick actions -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Today appointments -->
      <div class="lg:col-span-2 card">
        <div class="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-800">
          <h2 class="font-semibold text-surface-900 dark:text-white">Agenda de Hoje</h2>
          <NuxtLink to="/dashboard/appointments" class="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline">
            Ver tudo →
          </NuxtLink>
        </div>

        <div v-if="todayAppointments.length === 0" class="px-6 py-12 text-center">
          <div class="w-12 h-12 mx-auto mb-3 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
            <IconCalendar class="w-6 h-6 text-surface-400" />
          </div>
          <p class="text-surface-500 dark:text-surface-400 text-sm">Nenhum agendamento hoje</p>
        </div>

        <div v-else class="divide-y divide-surface-100 dark:divide-surface-800">
          <AppointmentRow
            v-for="apt in todayAppointments"
            :key="apt.id"
            :appointment="apt"
            @status-change="handleStatusChange"
          />
        </div>
      </div>

      <!-- Quick actions + AI suggestion -->
      <div class="space-y-4">
        <!-- Quick actions -->
        <div class="card p-5">
          <h2 class="font-semibold text-surface-900 dark:text-white mb-4">Ações Rápidas</h2>
          <div class="grid grid-cols-2 gap-2.5">
            <QuickAction
              v-for="action in quickActions"
              :key="action.label"
              v-bind="action"
            />
          </div>
        </div>

        <!-- AI insight card -->
        <div class="card p-5 border-primary-200 dark:border-primary-900 bg-gradient-to-br from-primary-50 to-white dark:from-primary-950/30 dark:to-surface-900">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-6 h-6 rounded-lg bg-primary-600 flex items-center justify-center">
              <IconSparkles class="w-3.5 h-3.5 text-white" />
            </div>
            <span class="text-sm font-semibold text-primary-700 dark:text-primary-400">Insight da IA</span>
          </div>
          <p class="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
            {{ aiInsight }}
          </p>
          <NuxtLink
            to="/dashboard/ai"
            class="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
          >
            Ver análise completa →
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Calendar, Sparkles } from 'lucide-vue-next';
import * as dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');
definePageMeta({ layout: 'dashboard' });

const authStore = useAuthStore();
const { get } = useApiRequest();

const IconCalendar = Calendar;
const IconSparkles = Sparkles;

const activePeriod = ref('6M');

const firstName = computed(() => authStore.user?.name?.split(' ')[0] || 'Usuário');
const formattedDate = computed(() =>
  dayjs().format('dddd, D [de] MMMM [de] YYYY'),
);

// Data fetching
const stats = ref({
  today: 0, month: 0, monthRevenue: 0,
  absenceRate: '0%', revenueGrowth: '+0%',
});
const clientStats = ref({ newThisMonth: 0 });
const todayAppointments = ref([]);
const topServices = ref([
  { name: 'Limpeza de Pele', count: 32, revenue: 3200 },
  { name: 'Depilação Laser', count: 28, revenue: 5600 },
  { name: 'Drenagem Linfática', count: 20, revenue: 2200 },
  { name: 'Microagulhamento', count: 15, revenue: 4500 },
  { name: 'Bronzeamento', count: 12, revenue: 840 },
]);

const aiInsight = ref('Você tem 8 clientes que não retornam há mais de 60 dias. Uma campanha de reativação pode gerar R$ 2.400 em receita este mês.');

const revenueChartData = ref({
  labels: ['Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr'],
  datasets: [{
    label: 'Faturamento',
    data: [8200, 12400, 9800, 11200, 14300, 15800],
    borderColor: '#9333ea',
    backgroundColor: 'rgba(147, 51, 234, 0.08)',
    fill: true,
    tension: 0.4,
    pointRadius: 3,
    pointHoverRadius: 6,
  }],
});

const quickActions = [
  { label: 'Novo Cliente', icon: 'UserPlus', to: '/dashboard/clients/new', color: 'purple' },
  { label: 'Agendar', icon: 'CalendarPlus', to: '/dashboard/appointments/new', color: 'blue' },
  { label: 'Pagamento', icon: 'CreditCard', to: '/dashboard/financial/new', color: 'green' },
  { label: 'Campanha', icon: 'Megaphone', to: '/dashboard/marketing', color: 'amber' },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

async function handleStatusChange(id: string, status: string) {
  await patch(`/appointments/${id}/status`, { status });
  // refresh
}

const { patch } = useApiRequest();

onMounted(async () => {
  try {
    const [apptStats, cStats] = await Promise.all([
      get<any>('/appointments/stats'),
      get<any>('/clients/stats'),
    ]);
    stats.value = apptStats;
    clientStats.value = cStats;
  } catch (e) {
    console.error(e);
  }
});
</script>
