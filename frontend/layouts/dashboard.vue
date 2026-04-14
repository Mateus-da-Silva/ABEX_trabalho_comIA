<template>
  <div class="min-h-screen flex bg-surface-50 dark:bg-surface-950">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 flex flex-col w-[260px] transition-transform duration-300',
        'bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 px-5 py-5 border-b border-surface-200 dark:border-surface-800">
        <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
          <span class="text-white font-bold text-sm">C</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-surface-900 dark:text-white text-sm truncate">
            {{ authStore.clinicName }}
          </p>
          <p class="text-xs text-surface-500 dark:text-surface-500 capitalize">
            {{ authStore.clinic?.plan }} plan
          </p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-4 px-3">
        <div class="space-y-0.5">
          <NavItem v-for="item in navigation" :key="item.label" v-bind="item" />
        </div>

        <div class="mt-6 pt-4 border-t border-surface-200 dark:border-surface-800">
          <p class="px-3 mb-2 text-xs font-semibold text-surface-400 dark:text-surface-600 uppercase tracking-wider">
            Inteligência
          </p>
          <NavItem v-for="item in aiNavigation" :key="item.label" v-bind="item" />
        </div>

        <div class="mt-6 pt-4 border-t border-surface-200 dark:border-surface-800">
          <p class="px-3 mb-2 text-xs font-semibold text-surface-400 dark:text-surface-600 uppercase tracking-wider">
            Gestão
          </p>
          <NavItem v-for="item in settingsNavigation" :key="item.label" v-bind="item" />
        </div>
      </nav>

      <!-- User section -->
      <div class="px-3 py-4 border-t border-surface-200 dark:border-surface-800">
        <div class="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
            <span class="text-white text-xs font-semibold">
              {{ authStore.user?.name?.charAt(0)?.toUpperCase() }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-surface-900 dark:text-white truncate">
              {{ authStore.user?.name }}
            </p>
            <p class="text-xs text-surface-500 truncate">{{ authStore.user?.email }}</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Overlay mobile -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-black/50 lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- Main content -->
    <div class="flex-1 lg:ml-[260px] flex flex-col min-h-screen">
      <!-- Header -->
      <header class="sticky top-0 z-30 flex items-center gap-4 px-6 h-16 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800">
        <button class="lg:hidden btn-ghost p-2 -ml-2" @click="sidebarOpen = !sidebarOpen">
          <IconMenu class="w-5 h-5" />
        </button>

        <div class="flex-1" />

        <!-- Quick actions -->
        <button class="btn btn-primary btn-sm" @click="$emit('new-appointment')">
          <IconPlus class="w-4 h-4" />
          <span class="hidden sm:inline">Novo Agendamento</span>
        </button>

        <!-- Notifications -->
        <button class="relative btn-ghost p-2">
          <IconBell class="w-5 h-5" />
          <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
        </button>

        <!-- Theme toggle -->
        <button class="btn-ghost p-2" @click="toggleColorMode">
          <IconSun v-if="colorMode.value === 'dark'" class="w-5 h-5" />
          <IconMoon v-else class="w-5 h-5" />
        </button>
      </header>

      <!-- Page content -->
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  LayoutDashboard, Users, Calendar, Package,
  DollarSign, UserCheck, Boxes, Megaphone,
  Sparkles, Settings, BarChart3, Menu,
  Plus, Bell, Sun, Moon,
} from 'lucide-vue-next';

const authStore = useAuthStore();
const colorMode = useColorMode();
const sidebarOpen = ref(false);

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
};

// Aliases de ícones
const IconMenu = Menu;
const IconPlus = Plus;
const IconBell = Bell;
const IconSun = Sun;
const IconMoon = Moon;

const navigation = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard', exact: true },
  { label: 'Clientes', icon: Users, to: '/dashboard/clients' },
  { label: 'Agenda', icon: Calendar, to: '/dashboard/appointments' },
  { label: 'Serviços', icon: Package, to: '/dashboard/services' },
  { label: 'Pacotes', icon: Package, to: '/dashboard/packages' },
  { label: 'Financeiro', icon: DollarSign, to: '/dashboard/financial' },
  { label: 'Profissionais', icon: UserCheck, to: '/dashboard/professionals' },
  { label: 'Estoque', icon: Boxes, to: '/dashboard/stock' },
  { label: 'Marketing', icon: Megaphone, to: '/dashboard/marketing' },
];

const aiNavigation = [
  { label: 'Assistente IA', icon: Sparkles, to: '/dashboard/ai' },
  { label: 'Relatórios', icon: BarChart3, to: '/dashboard/reports' },
];

const settingsNavigation = [
  { label: 'Configurações', icon: Settings, to: '/dashboard/settings' },
];
</script>
