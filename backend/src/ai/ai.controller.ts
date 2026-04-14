import { Controller, Post, Get, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class ChatMessageDto {
  @ApiProperty({ example: 'Como foi o faturamento deste mês?' })
  @IsString()
  message: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Assistente IA da clínica - conversa livre' })
  chat(@CurrentTenant() clinicId: string, @Body() dto: ChatMessageDto) {
    return this.aiService.chat(clinicId, dto.message, dto.history);
  }

  @Get('analyze-revenue')
  @ApiOperation({ summary: 'Análise de faturamento com insights de IA' })
  analyzeRevenue(@CurrentTenant() clinicId: string) {
    return this.aiService.analyzeRevenue(clinicId);
  }

  @Get('marketing-campaigns')
  @ApiOperation({ summary: 'Sugestões de campanhas de marketing com IA' })
  suggestCampaigns(@CurrentTenant() clinicId: string) {
    return this.aiService.suggestMarketingCampaigns(clinicId);
  }

  @Get('suggest-treatments/:clientId')
  @ApiOperation({ summary: 'Sugerir tratamentos personalizados para cliente' })
  suggestTreatments(
    @CurrentTenant() clinicId: string,
    @Param('clientId', ParseUUIDPipe) clientId: string,
  ) {
    return this.aiService.suggestTreatments(clinicId, clientId);
  }
}
