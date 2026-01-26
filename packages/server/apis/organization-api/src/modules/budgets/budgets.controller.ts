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
import { BudgetsService } from './budgets.service'
import { OrgScopedParamsDto, OrgScopedResourceParamsDto } from '../../common/dto/uuid-param.dto'
import { PaginationQueryDto, parsePaginationQuery } from '../../common/dto/pagination-query.dto'
import {
  CreateBudgetSchema,
  UpdateBudgetSchema,
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from '../../schemas/requests'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { OrgAuthGuard } from '../../auth/guards/org-auth.guard'

@Controller('organizations/:orgId/budgets')
@UseGuards(JwtAuthGuard, OrgAuthGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  async listBudgets(@Param() params: OrgScopedParamsDto, @Query() query: PaginationQueryDto) {
    const pagination = parsePaginationQuery(query)
    const budgets = await this.budgetsService.listBudgets(params.orgId, pagination)
    return {
      data: budgets,
      meta: pagination,
    }
  }

  @Get(':id')
  async getBudget(@Param() params: OrgScopedResourceParamsDto) {
    const budget = await this.budgetsService.getBudget(params.orgId, params.id)
    return { data: budget }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBudget(
    @Param() params: OrgScopedParamsDto,
    @Body(new ZodValidationPipe(CreateBudgetSchema)) body: CreateBudgetRequest,
  ) {
    const budget = await this.budgetsService.createBudget(params.orgId, body)
    return { data: budget }
  }

  @Patch(':id')
  async updateBudget(
    @Param() params: OrgScopedResourceParamsDto,
    @Body(new ZodValidationPipe(UpdateBudgetSchema)) body: UpdateBudgetRequest,
  ) {
    const budget = await this.budgetsService.updateBudget(params.orgId, params.id, body)
    return { data: budget }
  }

  @Delete(':id')
  async deleteBudget(@Param() params: OrgScopedResourceParamsDto) {
    await this.budgetsService.deleteBudget(params.orgId, params.id)
    return { data: { deleted: true, id: params.id } }
  }
}
