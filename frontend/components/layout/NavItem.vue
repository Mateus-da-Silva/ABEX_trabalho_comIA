<template>
  <NuxtLink
    :to="to"
    :exact="exact"
    class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"
    :class="[
      isActive
        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
        : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-white',
    ]"
  >
    <component
      :is="icon"
      :class="[
        'w-4.5 h-4.5 flex-shrink-0 transition-colors',
        isActive ? 'text-primary-600 dark:text-primary-400' : 'text-surface-500 group-hover:text-surface-700 dark:group-hover:text-surface-200',
      ]"
    />
    <span class="flex-1 truncate">{{ label }}</span>
    <span
      v-if="badge"
      class="badge badge-purple text-[10px] px-1.5 py-0.5"
    >{{ badge }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string;
  to: string;
  icon: any;
  exact?: boolean;
  badge?: string | number;
}>();

const route = useRoute();
const isActive = computed(() =>
  props.exact
    ? route.path === props.to
    : route.path.startsWith(props.to),
);
</script>
