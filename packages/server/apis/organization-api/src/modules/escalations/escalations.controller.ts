import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common'
import { EscalationsService } from './escalations.service'
import { OrgScopedParamsDto, OrgScopedResourceParamsDto } from '../../common/dto/uuid-param.dto'
import { PaginationQueryDto, parsePaginationQuery } from '../../common/dto/pagination-query.dto'
import {
  CreateEscalationSchema,
  UpdateEscalationSchema,
  CreateEscalationRequest,
  UpdateEscalationRequest,
} from '../../schemas/requests'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { OrgAuthGuard } from '../../auth/guards/org-auth.guard'

@Controller('organizations/:orgId/escalations')
@UseGuards(JwtAuthGuard, OrgAuthGuard)
export class EscalationsController {
  constructor(private readonly escalationsService: EscalationsService) {}

  @Get()
  async listEscalations(@Param() params: OrgScopedParamsDto, @Query() query: PaginationQueryDto) {
    const pagination = parsePaginationQuery(query)
    const escalations = await this.escalationsService.listEscalations(params.orgId, pagination)
    return {
      data: escalations,
      meta: pagination,
    }
  }

  @Get(':id')
  async getEscalation(@Param() params: OrgScopedResourceParamsDto) {
    const escalation = await this.escalationsService.getEscalation(params.orgId, params.id)
    return { data: escalation }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createEscalation(
    @Param() params: OrgScopedParamsDto,
    @Body(new ZodValidationPipe(CreateEscalationSchema)) body: CreateEscalationRequest,
  ) {
    const escalation = await this.escalationsService.createEscalation(params.orgId, body)
    return { data: escalation }
  }

  @Patch(':id')
  async updateEscalation(
    @Param() params: OrgScopedResourceParamsDto,
    @Body(new ZodValidationPipe(UpdateEscalationSchema)) body: UpdateEscalationRequest,
  ) {
    const escalation = await this.escalationsService.updateEscalation(
      params.orgId,
      params.id,
      body,
    )
    return { data: escalation }
  }

  @Delete(':id')
  async deleteEscalation(@Param() params: OrgScopedResourceParamsDto) {
    await this.escalationsService.deleteEscalation(params.orgId, params.id)
    return { data: { deleted: true, id: params.id } }
  }
}
