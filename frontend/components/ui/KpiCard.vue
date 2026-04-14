<template>
  <div class="stat-card card-hover">
    <div class="flex items-center justify-between">
      <span class="text-sm text-surface-500 dark:text-surface-400 font-medium">{{ label }}</span>
      <div
        :class="[
          'w-9 h-9 rounded-xl flex items-center justify-center',
          colorClasses[color]?.bg,
        ]"
      >
        <component :is="iconComponent" :class="['w-4.5 h-4.5', colorClasses[color]?.icon]" />
      </div>
    </div>

    <div>
      <p class="text-2xl font-bold text-surface-900 dark:text-white tracking-tight">{{ value }}</p>
      <div v-if="trend" class="flex items-center gap-1 mt-1">
        <span
          :class="[
            'text-xs font-semibold flex items-center gap-0.5',
            isTrendPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400',
          ]"
        >
          <IconTrendingUp v-if="isTrendPositive" class="w-3 h-3" />
          <IconTrendingDown v-else class="w-3 h-3" />
          {{ trend }}
        </span>
        <span v-if="trendLabel" class="text-xs text-surface-400">{{ trendLabel }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  DollarSign, Calendar, UserPlus, UserX,
  TrendingUp, TrendingDown, Package, Users,
} from 'lucide-vue-next';

const props = defineProps<{
  label: string;
  value: string;
  trend?: string;
  trendLabel?: string;
  color: 'purple' | 'blue' | 'green' | 'amber' | 'red';
  icon: string;
  invertTrend?: boolean;
}>();

const IconTrendingUp = TrendingUp;
const IconTrendingDown = TrendingDown;

const iconMap: Record<string, any> = {
  DollarSign, Calendar, UserPlus, UserX, Package, Users,
};

const iconComponent = computed(() => iconMap[props.icon] || DollarSign);

const colorClasses = {
  purple: { bg: 'bg-primary-100 dark:bg-primary-900/30', icon: 'text-primary-600 dark:text-primary-400' },
  blue:   { bg: 'bg-blue-100 dark:bg-blue-900/30',       icon: 'text-blue-600 dark:text-blue-400' },
  green:  { bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: 'text-emerald-600 dark:text-emerald-400' },
  amber:  { bg: 'bg-amber-100 dark:bg-amber-900/30',     icon: 'text-amber-600 dark:text-amber-400' },
  red:    { bg: 'bg-red-100 dark:bg-red-900/30',         icon: 'text-red-600 dark:text-red-400' },
};

const isTrendPositive = computed(() => {
  if (!props.trend) return false;
  const isPositive = props.trend.startsWith('+');
  return props.invertTrend ? !isPositive : isPositive;
});
</script>
