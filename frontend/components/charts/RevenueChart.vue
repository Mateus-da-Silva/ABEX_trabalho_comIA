<template>
  <div class="relative h-56">
    <Line :data="data" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

const props = defineProps<{
  data: {
    labels: string[];
    datasets: any[];
  };
}>();

const colorMode = useColorMode();

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: colorMode.value === 'dark' ? '#1e293b' : '#fff',
      borderColor: colorMode.value === 'dark' ? '#334155' : '#e2e8f0',
      borderWidth: 1,
      titleColor: colorMode.value === 'dark' ? '#f1f5f9' : '#0f172a',
      bodyColor: colorMode.value === 'dark' ? '#94a3b8' : '#475569',
      padding: 12,
      callbacks: {
        label: (ctx: any) =>
          ` R$ ${Number(ctx.parsed.y).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: {
        color: colorMode.value === 'dark' ? '#64748b' : '#94a3b8',
        font: { size: 12 },
      },
    },
    y: {
      grid: {
        color: colorMode.value === 'dark' ? 'rgba(51,65,85,0.5)' : 'rgba(226,232,240,0.8)',
      },
      border: { display: false, dash: [4, 4] },
      ticks: {
        color: colorMode.value === 'dark' ? '#64748b' : '#94a3b8',
        font: { size: 11 },
        callback: (value: number) =>
          `R$ ${(value / 1000).toFixed(0)}k`,
      },
    },
  },
  interaction: { intersect: false, mode: 'index' as const },
  elements: {
    line: { borderWidth: 2 },
  },
}));
</script>
