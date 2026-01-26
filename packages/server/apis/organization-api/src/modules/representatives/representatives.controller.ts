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
import { RepresentativesService } from './representatives.service'
import { OrgScopedParamsDto, OrgScopedResourceParamsDto } from '../../common/dto/uuid-param.dto'
import { PaginationQueryDto, parsePaginationQuery } from '../../common/dto/pagination-query.dto'
import {
  CreateRepresentativeSchema,
  UpdateRepresentativeSchema,
  CreateRepresentativeRequest,
  UpdateRepresentativeRequest,
} from '../../schemas/requests'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { OrgAuthGuard } from '../../auth/guards/org-auth.guard'

@Controller('organizations/:orgId/representatives')
@UseGuards(JwtAuthGuard, OrgAuthGuard)
export class RepresentativesController {
  constructor(private readonly representativesService: RepresentativesService) {}

  @Get()
  async listRepresentatives(
    @Param() params: OrgScopedParamsDto,
    @Query() query: PaginationQueryDto,
  ) {
    const pagination = parsePaginationQuery(query)
    const reps = await this.representativesService.listRepresentatives(params.orgId, pagination)
    return {
      data: reps,
      meta: pagination,
    }
  }

  @Get(':id')
  async getRepresentative(@Param() params: OrgScopedResourceParamsDto) {
    const rep = await this.representativesService.getRepresentative(params.orgId, params.id)
    return { data: rep }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRepresentative(
    @Param() params: OrgScopedParamsDto,
    @Body(new ZodValidationPipe(CreateRepresentativeSchema)) body: CreateRepresentativeRequest,
  ) {
    const rep = await this.representativesService.createRepresentative(params.orgId, body)
    return { data: rep }
  }

  @Patch(':id')
  async updateRepresentative(
    @Param() params: OrgScopedResourceParamsDto,
    @Body(new ZodValidationPipe(UpdateRepresentativeSchema)) body: UpdateRepresentativeRequest,
  ) {
    const rep = await this.representativesService.updateRepresentative(
      params.orgId,
      params.id,
      body,
    )
    return { data: rep }
  }

  @Delete(':id')
  async deleteRepresentative(@Param() params: OrgScopedResourceParamsDto) {
    await this.representativesService.deleteRepresentative(params.orgId, params.id)
    return { data: { deleted: true, id: params.id } }
  }
}
