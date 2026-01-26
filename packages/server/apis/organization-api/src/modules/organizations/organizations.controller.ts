import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { OrganizationsService } from './organizations.service'
import { UuidParamDto } from '../../common/dto/uuid-param.dto'
import {
  CreateOrganizationSchema,
  UpdateOrganizationSchema,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
} from '../../schemas/requests'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get(':id')
  async getOrganization(@Param() params: UuidParamDto) {
    const org = await this.organizationsService.getOrganization(params.id)
    return { data: org }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrganization(
    @Body(new ZodValidationPipe(CreateOrganizationSchema)) body: CreateOrganizationRequest,
  ) {
    const org = await this.organizationsService.createOrganization(body)
    return { data: org }
  }

  @Patch(':id')
  async updateOrganization(
    @Param() params: UuidParamDto,
    @Body(new ZodValidationPipe(UpdateOrganizationSchema)) body: UpdateOrganizationRequest,
  ) {
    const org = await this.organizationsService.updateOrganization(params.id, body)
    return { data: org }
  }

  @Delete(':id')
  async deleteOrganization(@Param() params: UuidParamDto) {
    await this.organizationsService.deleteOrganization(params.id)
    return { data: { deleted: true, id: params.id } }
  }
}
