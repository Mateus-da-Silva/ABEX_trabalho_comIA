import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Client } from '../database/entities/client.entity';
import { Appointment } from '../database/entities/appointment.entity';
import { FinancialTransaction, TransactionType } from '../database/entities/financial.entity';
import dayjs from 'dayjs';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly anthropic: Anthropic;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Client)
    private clientsRepo: Repository<Client>,
    @InjectRepository(Appointment)
    private appointmentsRepo: Repository<Appointment>,
    @InjectRepository(FinancialTransaction)
    private financialRepo: Repository<FinancialTransaction>,
  ) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  /**
   * Assistente geral da clínica - responde perguntas sobre o negócio
   */
  async chat(clinicId: string, message: string, history: any[] = []) {
    const context = await this.buildClinicContext(clinicId);

    const systemPrompt = `Você é um assistente inteligente de gestão para clínicas de estética.

Você tem acesso aos dados reais da clínica e pode ajudar com:
- Análise de faturamento e métricas
- Sugestões de campanhas de marketing
- Identificação de clientes inativos
- Sugestões de agendamentos e otimização de agenda
- Análise de serviços mais lucrativos
- Estratégias para aumentar receita

DADOS ATUAIS DA CLÍNICA:
${context}

Responda sempre em português do Brasil, de forma clara, objetiva e profissional.
Quando apresentar dados numéricos, formate em R$ e use tabelas quando útil.`;

    const messages = [
      ...history,
      { role: 'user' as const, content: message },
    ];

    const response = await this.anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      messages,
    });

    return {
      message: (response.content[0] as any).text,
      usage: response.usage,
    };
  }

  /**
   * Análise de faturamento com IA - insights automáticos
   */
  async analyzeRevenue(clinicId: string) {
    const monthStart = dayjs().startOf('month').toDate();
    const monthEnd = dayjs().endOf('month').toDate();
    const lastMonthStart = dayjs().subtract(1, 'month').startOf('month').toDate();
    const lastMonthEnd = dayjs().subtract(1, 'month').endOf('month').toDate();

    const [currentMonth, lastMonth, topServices] = await Promise.all([
      this.financialRepo
        .createQueryBuilder('f')
        .select('SUM(f.final_amount)', 'total')
        .addSelect('COUNT(*)', 'count')
        .where('f.clinic_id = :clinicId', { clinicId })
        .andWhere('f.type = :type', { type: TransactionType.INCOME })
        .andWhere('f.paid_at BETWEEN :start AND :end', { start: monthStart, end: monthEnd })
        .getRawOne(),

      this.financialRepo
        .createQueryBuilder('f')
        .select('SUM(f.final_amount)', 'total')
        .where('f.clinic_id = :clinicId', { clinicId })
        .andWhere('f.type = :type', { type: TransactionType.INCOME })
        .andWhere('f.paid_at BETWEEN :start AND :end', { start: lastMonthStart, end: lastMonthEnd })
        .getRawOne(),

      this.appointmentsRepo
        .createQueryBuilder('a')
        .leftJoin('a.service', 's')
        .select('s.name', 'serviceName')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(a.final_price)', 'revenue')
        .where('a.clinic_id = :clinicId', { clinicId })
        .andWhere('a.start_at BETWEEN :start AND :end', { start: monthStart, end: monthEnd })
        .andWhere('a.status = :status', { status: 'completed' })
        .groupBy('s.name')
        .orderBy('revenue', 'DESC')
        .limit(5)
        .getRawMany(),
    ]);

    const currentRevenue = parseFloat(currentMonth?.total || '0');
    const lastRevenue = parseFloat(lastMonth?.total || '0');
    const growth = lastRevenue > 0
      ? (((currentRevenue - lastRevenue) / lastRevenue) * 100).toFixed(1)
      : '0';

    const prompt = `Analise os dados financeiros desta clínica de estética e forneça insights estratégicos:

FATURAMENTO ATUAL (${dayjs().format('MMMM/YYYY')}): R$ ${currentRevenue.toFixed(2)}
FATURAMENTO MÊS ANTERIOR: R$ ${lastRevenue.toFixed(2)}
VARIAÇÃO: ${growth}%

TOP 5 SERVIÇOS DO MÊS:
${topServices.map((s, i) => `${i + 1}. ${s.serviceName}: ${s.count} atendimentos - R$ ${parseFloat(s.revenue).toFixed(2)}`).join('\n')}

Forneça:
1. Análise do desempenho financeiro
2. 3 insights principais sobre os dados
3. 2 ações concretas para aumentar o faturamento no próximo mês
4. Alerta sobre qualquer padrão preocupante

Responda em formato estruturado e profissional.`;

    const response = await this.anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    return {
      data: { currentRevenue, lastRevenue, growth: `${growth}%`, topServices },
      insights: (response.content[0] as any).text,
    };
  }

  /**
   * Sugestões de campanhas de marketing baseadas nos dados da clínica
   */
  async suggestMarketingCampaigns(clinicId: string) {
    const thirtyDaysAgo = dayjs().subtract(30, 'day').toDate();
    const ninetyDaysAgo = dayjs().subtract(90, 'day').toDate();

    const [inactiveClients, birthdays, topClients] = await Promise.all([
      // Clientes sem visita há 60+ dias
      this.clientsRepo
        .createQueryBuilder('c')
        .where('c.clinic_id = :clinicId', { clinicId })
        .andWhere('c.last_visit_at < :date', { date: thirtyDaysAgo })
        .andWhere('c.status = :status', { status: 'active' })
        .select(['c.id', 'c.name', 'c.last_visit_at', 'c.total_spent'])
        .limit(10)
        .getMany(),

      // Aniversariantes do mês
      this.clientsRepo
        .createQueryBuilder('c')
        .where('c.clinic_id = :clinicId', { clinicId })
        .andWhere("EXTRACT(MONTH FROM c.birth_date) = :month", { month: dayjs().month() + 1 })
        .select(['c.id', 'c.name', 'c.birth_date'])
        .getMany(),

      // Clientes VIP (maior gasto)
      this.clientsRepo.find({
        where: { clinicId },
        order: { totalSpent: 'DESC' },
        take: 5,
        select: ['id', 'name', 'totalSpent', 'totalVisits'],
      }),
    ]);

    const prompt = `Você é um especialista em marketing para clínicas de estética.

Com base nos dados abaixo, sugira 4 campanhas de marketing personalizadas e prontas para implementar:

CLIENTES INATIVOS (sem visita recente): ${inactiveClients.length} clientes
ANIVERSARIANTES DO MÊS: ${birthdays.length} clientes
CLIENTES VIP (top faturamento): ${topClients.map(c => `${c.name} - R$${c.totalSpent}`).join(', ')}

Para cada campanha, forneça:
- Nome da campanha
- Segmento alvo
- Objetivo
- Mensagem de WhatsApp pronta para envio (use emojis, seja informal e caloroso)
- Oferta/incentivo sugerido
- Melhor momento para enviar

Seja criativo, use gatilhos emocionais e urgência quando adequado.`;

    const response = await this.anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    return {
      segments: {
        inactiveClients: inactiveClients.length,
        birthdays: birthdays.length,
        vipClients: topClients.length,
      },
      campaigns: (response.content[0] as any).text,
    };
  }

  /**
   * Sugerir tratamentos para um cliente específico baseado no histórico
   */
  async suggestTreatments(clinicId: string, clientId: string) {
    const client = await this.clientsRepo.findOne({
      where: { id: clientId, clinicId },
    });

    if (!client) throw new Error('Cliente não encontrado');

    const appointments = await this.appointmentsRepo
      .createQueryBuilder('a')
      .leftJoin('a.service', 's')
      .select(['a.startAt', 'a.status', 's.name', 's.category'])
      .where('a.client_id = :clientId', { clientId })
      .orderBy('a.start_at', 'DESC')
      .limit(20)
      .getRawMany();

    const prompt = `Você é uma consultora sênior de estética especializada em protocolos de tratamento.

PERFIL DA CLIENTE:
- Nome: ${client.name}
- Tipo de pele: ${client.anamnesis?.skinType || 'Não informado'}
- Condições: ${client.anamnesis?.skinConditions?.join(', ') || 'Não informado'}
- Alergias: ${client.anamnesis?.allergies || 'Nenhuma'}
- Histórico de ${appointments.length} atendimentos recentes

TRATAMENTOS JÁ REALIZADOS:
${appointments.map(a => `- ${a.s_name} (${a.s_category}) em ${dayjs(a.a_startAt).format('MM/YYYY')}`).join('\n') || 'Nenhum'}

OBSERVAÇÕES DA ANAMNESE:
${client.anamnesis?.observations || 'Nenhuma'}

Com base neste perfil, sugira:
1. 3 tratamentos altamente recomendados para esta cliente (com justificativa)
2. Sequência ideal de protocolo
3. Frequência de manutenção sugerida
4. Produtos para recomendar usar em casa

Seja técnica e específica, usando terminologia de estética profissional.`;

    const response = await this.anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    return {
      client: { id: client.id, name: client.name },
      suggestions: (response.content[0] as any).text,
    };
  }

  private async buildClinicContext(clinicId: string): Promise<string> {
    const monthStart = dayjs().startOf('month').toDate();
    const monthEnd = dayjs().endOf('month').toDate();
    const today = new Date();

    const [totalClients, monthAppointments, monthRevenue] = await Promise.all([
      this.clientsRepo.count({ where: { clinicId } }),
      this.appointmentsRepo.count({
        where: { clinicId, startAt: Between(monthStart, monthEnd) },
      }),
      this.financialRepo
        .createQueryBuilder('f')
        .select('SUM(f.final_amount)', 'total')
        .where('f.clinic_id = :clinicId', { clinicId })
        .andWhere('f.type = :type', { type: TransactionType.INCOME })
        .andWhere('f.paid_at BETWEEN :start AND :end', { start: monthStart, end: monthEnd })
        .getRawOne(),
    ]);

    return `
- Total de clientes cadastrados: ${totalClients}
- Atendimentos este mês: ${monthAppointments}
- Faturamento este mês: R$ ${parseFloat(monthRevenue?.total || '0').toFixed(2)}
- Data atual: ${dayjs(today).format('DD/MM/YYYY')}
    `.trim();
  }
}
