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
import { RefundsService } from './refunds.service'
import { OrgScopedParamsDto, OrgScopedResourceParamsDto } from '../../common/dto/uuid-param.dto'
import { PaginationQueryDto, parsePaginationQuery } from '../../common/dto/pagination-query.dto'
import {
  CreateRefundSchema,
  UpdateRefundSchema,
  CreateRefundRequest,
  UpdateRefundRequest,
} from '../../schemas/requests'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { OrgAuthGuard } from '../../auth/guards/org-auth.guard'

@Controller('organizations/:orgId/refunds')
@UseGuards(JwtAuthGuard, OrgAuthGuard)
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Get()
  async listRefunds(@Param() params: OrgScopedParamsDto, @Query() query: PaginationQueryDto) {
    const pagination = parsePaginationQuery(query)
    const refunds = await this.refundsService.listRefunds(params.orgId, pagination)
    return {
      data: refunds,
      meta: pagination,
    }
  }

  @Get(':id')
  async getRefund(@Param() params: OrgScopedResourceParamsDto) {
    const refund = await this.refundsService.getRefund(params.orgId, params.id)
    return { data: refund }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRefund(
    @Param() params: OrgScopedParamsDto,
    @Body(new ZodValidationPipe(CreateRefundSchema)) body: CreateRefundRequest,
  ) {
    const refund = await this.refundsService.createRefund(params.orgId, body)
    return { data: refund }
  }

  @Patch(':id')
  async updateRefund(
    @Param() params: OrgScopedResourceParamsDto,
    @Body(new ZodValidationPipe(UpdateRefundSchema)) body: UpdateRefundRequest,
  ) {
    const refund = await this.refundsService.updateRefund(params.orgId, params.id, body)
    return { data: refund }
  }

  @Delete(':id')
  async deleteRefund(@Param() params: OrgScopedResourceParamsDto) {
    await this.refundsService.deleteRefund(params.orgId, params.id)
    return { data: { deleted: true, id: params.id } }
  }
}
