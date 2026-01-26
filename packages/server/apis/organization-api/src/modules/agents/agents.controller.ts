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
import { AgentsService } from './agents.service'
import { OrgScopedParamsDto, OrgScopedResourceParamsDto } from '../../common/dto/uuid-param.dto'
import { PaginationQueryDto, parsePaginationQuery } from '../../common/dto/pagination-query.dto'
import {
  CreateAgentConfigurationSchema,
  UpdateAgentConfigurationSchema,
  CreateAgentConfigurationRequest,
  UpdateAgentConfigurationRequest,
} from '../../schemas/requests'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { OrgAuthGuard } from '../../auth/guards/org-auth.guard'

@Controller('organizations/:orgId/agents')
@UseGuards(JwtAuthGuard, OrgAuthGuard)
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  async listAgentConfigurations(
    @Param() params: OrgScopedParamsDto,
    @Query() query: PaginationQueryDto,
  ) {
    const pagination = parsePaginationQuery(query)
    const agents = await this.agentsService.listAgentConfigurations(params.orgId, pagination)
    return {
      data: agents,
      meta: pagination,
    }
  }

  @Get(':id')
  async getAgentConfiguration(@Param() params: OrgScopedResourceParamsDto) {
    const agent = await this.agentsService.getAgentConfiguration(params.orgId, params.id)
    return { data: agent }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAgentConfiguration(
    @Param() params: OrgScopedParamsDto,
    @Body(new ZodValidationPipe(CreateAgentConfigurationSchema))
    body: CreateAgentConfigurationRequest,
  ) {
    const agent = await this.agentsService.createAgentConfiguration(params.orgId, body)
    return { data: agent }
  }

  @Patch(':id')
  async updateAgentConfiguration(
    @Param() params: OrgScopedResourceParamsDto,
    @Body(new ZodValidationPipe(UpdateAgentConfigurationSchema))
    body: UpdateAgentConfigurationRequest,
  ) {
    const agent = await this.agentsService.updateAgentConfiguration(
      params.orgId,
      params.id,
      body,
    )
    return { data: agent }
  }

  @Delete(':id')
  async deleteAgentConfiguration(@Param() params: OrgScopedResourceParamsDto) {
    await this.agentsService.deleteAgentConfiguration(params.orgId, params.id)
    return { data: { deleted: true, id: params.id } }
  }
}
