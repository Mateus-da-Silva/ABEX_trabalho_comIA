<template>
  <div class="animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 dark:text-white">Clientes</h1>
        <p class="text-surface-500 dark:text-surface-400 mt-1">
          {{ pagination.total }} clientes cadastrados
        </p>
      </div>
      <NuxtLink to="/dashboard/clients/new" class="btn btn-primary">
        <IconPlus class="w-4 h-4" />
        Novo Cliente
      </NuxtLink>
    </div>

    <!-- Filters bar -->
    <div class="card p-4 mb-6">
      <div class="flex flex-wrap gap-3">
        <div class="relative flex-1 min-w-[220px]">
          <IconSearch class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            v-model="filters.search"
            class="input pl-9"
            placeholder="Buscar por nome, CPF, email..."
            @input="debouncedSearch"
          />
        </div>

        <select v-model="filters.status" class="input w-auto min-w-[140px]" @change="fetchClients">
          <option value="">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>

        <select v-model="filters.sort" class="input w-auto min-w-[160px]" @change="fetchClients">
          <option value="name">Nome A-Z</option>
          <option value="-createdAt">Mais recentes</option>
          <option value="-totalSpent">Maior gasto</option>
          <option value="-lastVisitAt">Última visita</option>
        </select>

        <div class="flex gap-1 border border-surface-200 dark:border-surface-700 rounded-xl p-1">
          <button
            :class="['btn btn-sm', viewMode === 'table' ? 'btn-primary' : 'btn-ghost']"
            @click="viewMode = 'table'"
          >
            <IconList class="w-4 h-4" />
          </button>
          <button
            :class="['btn btn-sm', viewMode === 'grid' ? 'btn-primary' : 'btn-ghost']"
            @click="viewMode = 'grid'"
          >
            <IconGrid class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="grid grid-cols-1 gap-3">
      <div v-for="i in 5" :key="i" class="skeleton h-16 rounded-2xl" />
    </div>

    <!-- Table view -->
    <div v-else-if="viewMode === 'table'" class="card overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-surface-200 dark:border-surface-800">
            <th class="px-5 py-3.5 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Cliente</th>
            <th class="px-5 py-3.5 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider hidden md:table-cell">Contato</th>
            <th class="px-5 py-3.5 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider hidden lg:table-cell">Última Visita</th>
            <th class="px-5 py-3.5 text-right text-xs font-semibold text-surface-500 uppercase tracking-wider hidden lg:table-cell">Total Gasto</th>
            <th class="px-5 py-3.5 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
            <th class="px-4 py-3.5 w-10" />
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-100 dark:divide-surface-800">
          <tr
            v-for="client in clients"
            :key="client.id"
            class="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors cursor-pointer"
            @click="$router.push(`/dashboard/clients/${client.id}`)"
          >
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
                  <span class="text-white text-xs font-semibold">{{ client.name.charAt(0) }}</span>
                </div>
                <div>
                  <p class="font-medium text-surface-900 dark:text-white text-sm">{{ client.name }}</p>
                  <p v-if="client.cpf" class="text-xs text-surface-400">{{ client.cpf }}</p>
                </div>
              </div>
            </td>
            <td class="px-5 py-3.5 hidden md:table-cell">
              <p class="text-sm text-surface-700 dark:text-surface-300">{{ client.phone }}</p>
              <p v-if="client.email" class="text-xs text-surface-400 mt-0.5">{{ client.email }}</p>
            </td>
            <td class="px-5 py-3.5 hidden lg:table-cell">
              <p class="text-sm text-surface-600 dark:text-surface-400">
                {{ client.lastVisitAt ? formatDate(client.lastVisitAt) : '—' }}
              </p>
              <p class="text-xs text-surface-400">{{ client.totalVisits }} visitas</p>
            </td>
            <td class="px-5 py-3.5 text-right hidden lg:table-cell">
              <p class="text-sm font-semibold text-surface-900 dark:text-white">
                {{ formatCurrency(client.totalSpent) }}
              </p>
            </td>
            <td class="px-5 py-3.5">
              <span :class="statusBadge(client.status)">{{ statusLabel(client.status) }}</span>
            </td>
            <td class="px-4 py-3.5">
              <button class="btn-ghost p-1.5 rounded-lg opacity-0 group-hover:opacity-100" @click.stop="openMenu(client)">
                <IconDots class="w-4 h-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="flex items-center justify-between px-5 py-4 border-t border-surface-200 dark:border-surface-800">
        <p class="text-sm text-surface-500">
          Mostrando {{ (pagination.page - 1) * pagination.limit + 1 }}–{{ Math.min(pagination.page * pagination.limit, pagination.total) }}
          de {{ pagination.total }}
        </p>
        <div class="flex gap-2">
          <button
            class="btn btn-secondary btn-sm"
            :disabled="pagination.page <= 1"
            @click="changePage(pagination.page - 1)"
          >
            ← Anterior
          </button>
          <button
            class="btn btn-secondary btn-sm"
            :disabled="pagination.page >= pagination.totalPages"
            @click="changePage(pagination.page + 1)"
          >
            Próximo →
          </button>
        </div>
      </div>
    </div>

    <!-- Grid view -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <NuxtLink
        v-for="client in clients"
        :key="client.id"
        :to="`/dashboard/clients/${client.id}`"
        class="card card-hover p-5 flex flex-col gap-3"
      >
        <div class="flex items-start justify-between">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <span class="text-white font-bold">{{ client.name.charAt(0) }}</span>
          </div>
          <span :class="statusBadge(client.status)">{{ statusLabel(client.status) }}</span>
        </div>
        <div>
          <p class="font-semibold text-surface-900 dark:text-white">{{ client.name }}</p>
          <p class="text-xs text-surface-500 mt-0.5">{{ client.phone }}</p>
        </div>
        <div class="flex justify-between pt-2 border-t border-surface-100 dark:border-surface-800">
          <div>
            <p class="text-xs text-surface-400">Gasto total</p>
            <p class="text-sm font-semibold text-surface-900 dark:text-white">{{ formatCurrency(client.totalSpent) }}</p>
          </div>
          <div class="text-right">
            <p class="text-xs text-surface-400">Visitas</p>
            <p class="text-sm font-semibold text-surface-900 dark:text-white">{{ client.totalVisits }}</p>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, Search, List, LayoutGrid, MoreHorizontal } from 'lucide-vue-next';
import * as dayjs from 'dayjs';

definePageMeta({ layout: 'dashboard' });

const IconPlus = Plus;
const IconSearch = Search;
const IconList = List;
const IconGrid = LayoutGrid;
const IconDots = MoreHorizontal;

const { get } = useApiRequest();
const router = useRouter();
const viewMode = ref<'table' | 'grid'>('table');
const loading = ref(true);
const clients = ref<any[]>([]);
const pagination = ref({ page: 1, limit: 20, total: 0, totalPages: 1 });

const filters = ref({
  search: '',
  status: '',
  sort: 'name',
});

let searchTimeout: ReturnType<typeof setTimeout>;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(fetchClients, 350);
};

async function fetchClients() {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      page: String(pagination.value.page),
      limit: String(pagination.value.limit),
      ...(filters.value.search && { search: filters.value.search }),
      ...(filters.value.status && { status: filters.value.status }),
    });

    const response = await get<any>(`/clients?${params}`);
    clients.value = response.data;
    pagination.value = { ...pagination.value, ...response.meta };
  } finally {
    loading.value = false;
  }
}

function changePage(page: number) {
  pagination.value.page = page;
  fetchClients();
}

const statusBadge = (status: string) => ({
  active: 'badge badge-success',
  inactive: 'badge badge-gray',
  blocked: 'badge badge-danger',
}[status] || 'badge badge-gray');

const statusLabel = (status: string) => ({
  active: 'Ativo',
  inactive: 'Inativo',
  blocked: 'Bloqueado',
}[status] || status);

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

const formatDate = (d: string) => dayjs(d).format('DD/MM/YYYY');

function openMenu(client: any) {
  // Abrir dropdown de ações
}

onMounted(fetchClients);
</script>
