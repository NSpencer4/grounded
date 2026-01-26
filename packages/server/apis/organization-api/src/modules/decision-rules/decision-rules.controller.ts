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
import { DecisionRulesService } from './decision-rules.service'
import { OrgScopedParamsDto, OrgScopedResourceParamsDto } from '../../common/dto/uuid-param.dto'
import { PaginationQueryDto, parsePaginationQuery } from '../../common/dto/pagination-query.dto'
import {
  CreateDecisionRuleSchema,
  UpdateDecisionRuleSchema,
  CreateDecisionRuleRequest,
  UpdateDecisionRuleRequest,
} from '../../schemas/requests'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { OrgAuthGuard } from '../../auth/guards/org-auth.guard'

@Controller('organizations/:orgId/decision-rules')
@UseGuards(JwtAuthGuard, OrgAuthGuard)
export class DecisionRulesController {
  constructor(private readonly decisionRulesService: DecisionRulesService) {}

  @Get()
  async listDecisionRules(@Param() params: OrgScopedParamsDto, @Query() query: PaginationQueryDto) {
    const pagination = parsePaginationQuery(query)
    const rules = await this.decisionRulesService.listDecisionRules(params.orgId, pagination)
    return {
      data: rules,
      meta: pagination,
    }
  }

  @Get(':id')
  async getDecisionRule(@Param() params: OrgScopedResourceParamsDto) {
    const rule = await this.decisionRulesService.getDecisionRule(params.orgId, params.id)
    return { data: rule }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createDecisionRule(
    @Param() params: OrgScopedParamsDto,
    @Body(new ZodValidationPipe(CreateDecisionRuleSchema)) body: CreateDecisionRuleRequest,
  ) {
    const rule = await this.decisionRulesService.createDecisionRule(params.orgId, body)
    return { data: rule }
  }

  @Patch(':id')
  async updateDecisionRule(
    @Param() params: OrgScopedResourceParamsDto,
    @Body(new ZodValidationPipe(UpdateDecisionRuleSchema)) body: UpdateDecisionRuleRequest,
  ) {
    const rule = await this.decisionRulesService.updateDecisionRule(params.orgId, params.id, body)
    return { data: rule }
  }

  @Delete(':id')
  async deleteDecisionRule(@Param() params: OrgScopedResourceParamsDto) {
    await this.decisionRulesService.deleteDecisionRule(params.orgId, params.id)
    return { data: { deleted: true, id: params.id } }
  }
}
