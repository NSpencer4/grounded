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
import { CustomerProfilesService } from './customer-profiles.service'
import { OrgScopedParamsDto, OrgScopedResourceParamsDto } from '../../common/dto/uuid-param.dto'
import { PaginationQueryDto, parsePaginationQuery } from '../../common/dto/pagination-query.dto'
import {
  CreateCustomerProfileSchema,
  UpdateCustomerProfileSchema,
  CreateCustomerProfileRequest,
  UpdateCustomerProfileRequest,
} from '../../schemas/requests'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { OrgAuthGuard } from '../../auth/guards/org-auth.guard'

@Controller('organizations/:orgId/customer-profiles')
@UseGuards(JwtAuthGuard, OrgAuthGuard)
export class CustomerProfilesController {
  constructor(private readonly customerProfilesService: CustomerProfilesService) {}

  @Get()
  async listCustomerProfiles(
    @Param() params: OrgScopedParamsDto,
    @Query() query: PaginationQueryDto,
  ) {
    const pagination = parsePaginationQuery(query)
    const profiles = await this.customerProfilesService.listCustomerProfiles(
      params.orgId,
      pagination,
    )
    return {
      data: profiles,
      meta: pagination,
    }
  }

  @Get(':id')
  async getCustomerProfile(@Param() params: OrgScopedResourceParamsDto) {
    const profile = await this.customerProfilesService.getCustomerProfile(
      params.orgId,
      params.id,
    )
    return { data: profile }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCustomerProfile(
    @Param() params: OrgScopedParamsDto,
    @Body(new ZodValidationPipe(CreateCustomerProfileSchema))
    body: CreateCustomerProfileRequest,
  ) {
    const profile = await this.customerProfilesService.createCustomerProfile(params.orgId, body)
    return { data: profile }
  }

  @Patch(':id')
  async updateCustomerProfile(
    @Param() params: OrgScopedResourceParamsDto,
    @Body(new ZodValidationPipe(UpdateCustomerProfileSchema))
    body: UpdateCustomerProfileRequest,
  ) {
    const profile = await this.customerProfilesService.updateCustomerProfile(
      params.orgId,
      params.id,
      body,
    )
    return { data: profile }
  }

  @Delete(':id')
  async deleteCustomerProfile(@Param() params: OrgScopedResourceParamsDto) {
    await this.customerProfilesService.deleteCustomerProfile(params.orgId, params.id)
    return { data: { deleted: true, id: params.id } }
  }
}
