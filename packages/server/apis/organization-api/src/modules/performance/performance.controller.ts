import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { PerformanceService } from './performance.service'
import { OrgScopedParamsDto } from '../../common/dto/uuid-param.dto'
import { PaginationQueryDto, parsePaginationQuery } from '../../common/dto/pagination-query.dto'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { OrgAuthGuard } from '../../auth/guards/org-auth.guard'
import { IsUUID } from 'class-validator'

class RepPerformanceParamsDto extends OrgScopedParamsDto {
  @IsUUID('4')
  repId!: string
}

@Controller('organizations/:orgId')
@UseGuards(JwtAuthGuard, OrgAuthGuard)
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get('performance-metrics')
  async listPerformanceMetrics(
    @Param() params: OrgScopedParamsDto,
    @Query() query: PaginationQueryDto,
  ) {
    const pagination = parsePaginationQuery(query)
    const metrics = await this.performanceService.listPerformanceMetrics(params.orgId, pagination)
    return {
      data: metrics,
      meta: pagination,
    }
  }

  @Get('team-performance')
  async listTeamPerformance(@Param() params: OrgScopedParamsDto, @Query() query: PaginationQueryDto) {
    const pagination = parsePaginationQuery(query)
    const performance = await this.performanceService.listTeamPerformance(
      params.orgId,
      pagination,
    )
    return {
      data: performance,
      meta: pagination,
    }
  }

  @Get('representatives/:repId/performance')
  async getRepresentativePerformance(
    @Param() params: RepPerformanceParamsDto,
    @Query() query: PaginationQueryDto,
  ) {
    const pagination = parsePaginationQuery(query)
    const performance = await this.performanceService.getRepresentativePerformance(
      params.orgId,
      params.repId,
      pagination,
    )
    return {
      data: performance,
      meta: pagination,
    }
  }
}
