<template>
  <div class="animate-fade-in h-full">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 dark:text-white">Agenda</h1>
        <p class="text-surface-500 dark:text-surface-400 mt-1">
          {{ stats.today }} atendimentos hoje
        </p>
      </div>

      <div class="flex items-center gap-3">
        <!-- Professional filter -->
        <select
          v-model="selectedProfessional"
          class="input w-auto min-w-[180px]"
          @change="refreshCalendar"
        >
          <option value="">Todos os profissionais</option>
          <option v-for="p in professionals" :key="p.id" :value="p.id">
            {{ p.name }}
          </option>
        </select>

        <!-- View toggle -->
        <div class="flex gap-1 border border-surface-200 dark:border-surface-700 rounded-xl p-1">
          <button
            v-for="view in calendarViews"
            :key="view.value"
            :class="['btn btn-sm text-xs', currentView === view.value ? 'btn-primary' : 'btn-ghost']"
            @click="setView(view.value)"
          >
            {{ view.label }}
          </button>
        </div>

        <button class="btn btn-primary" @click="openNewAppointment">
          <IconPlus class="w-4 h-4" />
          Agendar
        </button>
      </div>
    </div>

    <!-- Status bar -->
    <div class="flex gap-4 mb-5 overflow-x-auto pb-1">
      <div
        v-for="status in appointmentStatuses"
        :key="status.key"
        class="flex items-center gap-2 flex-shrink-0"
      >
        <div :class="['w-2.5 h-2.5 rounded-full', status.dot]" />
        <span class="text-xs text-surface-500 dark:text-surface-400">{{ status.label }}</span>
      </div>
    </div>

    <!-- Calendar wrapper -->
    <div class="card p-0 overflow-hidden">
      <ClientOnly>
        <FullCalendar
          ref="calendarRef"
          :options="calendarOptions"
        />
      </ClientOnly>
    </div>

    <!-- Appointment detail modal -->
    <AppointmentModal
      v-if="selectedAppointment"
      :appointment="selectedAppointment"
      @close="selectedAppointment = null"
      @status-change="handleStatusChange"
      @reschedule="handleReschedule"
    />

    <!-- New appointment drawer -->
    <AppointmentDrawer
      v-if="showNewAppointment"
      @close="showNewAppointment = false"
      @created="handleAppointmentCreated"
    />
  </div>
</template>

<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { Plus } from 'lucide-vue-next';

definePageMeta({ layout: 'dashboard' });

const { get, patch } = useApiRequest();
const IconPlus = Plus;

const calendarRef = ref();
const selectedProfessional = ref('');
const currentView = ref('timeGridWeek');
const selectedAppointment = ref(null);
const showNewAppointment = ref(false);
const professionals = ref([]);
const stats = ref({ today: 0 });

const calendarViews = [
  { value: 'timeGridDay', label: 'Dia' },
  { value: 'timeGridWeek', label: 'Semana' },
  { value: 'dayGridMonth', label: 'Mês' },
];

const appointmentStatuses = [
  { key: 'scheduled',  label: 'Agendado',   dot: 'bg-blue-400' },
  { key: 'confirmed',  label: 'Confirmado',  dot: 'bg-emerald-500' },
  { key: 'in_progress',label: 'Em atendimento', dot: 'bg-amber-500' },
  { key: 'completed',  label: 'Concluído',   dot: 'bg-surface-400' },
  { key: 'cancelled',  label: 'Cancelado',   dot: 'bg-red-400' },
  { key: 'no_show',    label: 'Faltou',      dot: 'bg-orange-400' },
];

const statusColors: Record<string, string> = {
  scheduled:   '#3b82f6',
  confirmed:   '#10b981',
  in_progress: '#f59e0b',
  completed:   '#64748b',
  cancelled:   '#ef4444',
  no_show:     '#f97316',
};

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: currentView.value,
  locale: ptBrLocale,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: '',
  },
  height: 'auto',
  slotMinTime: '07:00:00',
  slotMaxTime: '21:00:00',
  slotDuration: '00:30:00',
  slotLabelInterval: '01:00:00',
  allDaySlot: false,
  businessHours: { daysOfWeek: [1, 2, 3, 4, 5, 6], startTime: '08:00', endTime: '19:00' },
  nowIndicator: true,
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,

  select(info: any) {
    // Pré-preencher horário no drawer
    openNewAppointment(info.startStr);
  },

  eventClick(info: any) {
    selectedAppointment.value = info.event.extendedProps;
  },

  eventDrop(info: any) {
    handleEventDrop(info);
  },

  events: async (info: any, successCallback: any, failureCallback: any) => {
    try {
      const params = new URLSearchParams({
        start: info.startStr,
        end: info.endStr,
        ...(selectedProfessional.value && { professionalId: selectedProfessional.value }),
      });

      const data = await get<any[]>(`/appointments/calendar?${params}`);

      const events = data.map((apt: any) => ({
        id: apt.id,
        title: apt.title,
        start: apt.start,
        end: apt.end,
        backgroundColor: statusColors[apt.status] || '#9333ea',
        borderColor: 'transparent',
        textColor: '#fff',
        extendedProps: apt,
        classNames: ['rounded-lg', 'text-xs', 'px-1'],
      }));

      successCallback(events);
    } catch (e) {
      failureCallback(e);
    }
  },
}));

function setView(view: string) {
  currentView.value = view;
  calendarRef.value?.getApi().changeView(view);
}

function refreshCalendar() {
  calendarRef.value?.getApi().refetchEvents();
}

function openNewAppointment(startStr?: string) {
  showNewAppointment.value = true;
}

async function handleStatusChange(id: string, status: string) {
  await patch(`/appointments/${id}/status`, { status });
  refreshCalendar();
  selectedAppointment.value = null;
}

async function handleEventDrop(info: any) {
  try {
    await patch(`/appointments/${info.event.id}`, {
      startAt: info.event.startStr,
    });
  } catch {
    info.revert();
  }
}

function handleReschedule() {
  selectedAppointment.value = null;
  showNewAppointment.value = true;
}

function handleAppointmentCreated() {
  showNewAppointment.value = false;
  refreshCalendar();
}

onMounted(async () => {
  try {
    const [profs, apptStats] = await Promise.all([
      get<any[]>('/professionals'),
      get<any>('/appointments/stats'),
    ]);
    professionals.value = profs;
    stats.value = apptStats;
  } catch (e) {
    console.error(e);
  }
});
</script>
