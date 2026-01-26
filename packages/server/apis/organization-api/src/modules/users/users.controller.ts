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
import { UsersService } from './users.service'
import { OrgScopedParamsDto, OrgScopedResourceParamsDto } from '../../common/dto/uuid-param.dto'
import { PaginationQueryDto, parsePaginationQuery } from '../../common/dto/pagination-query.dto'
import {
  CreateUserSchema,
  UpdateUserSchema,
  CreateUserRequest,
  UpdateUserRequest,
} from '../../schemas/requests'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { OrgAuthGuard } from '../../auth/guards/org-auth.guard'

@Controller('organizations/:orgId/users')
@UseGuards(JwtAuthGuard, OrgAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async listUsers(@Param() params: OrgScopedParamsDto, @Query() query: PaginationQueryDto) {
    const pagination = parsePaginationQuery(query)
    const users = await this.usersService.listUsers(params.orgId, pagination)
    return {
      data: users,
      meta: pagination,
    }
  }

  @Get(':id')
  async getUser(@Param() params: OrgScopedResourceParamsDto) {
    const user = await this.usersService.getUser(params.orgId, params.id)
    return { data: user }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Param() params: OrgScopedParamsDto,
    @Body(new ZodValidationPipe(CreateUserSchema)) body: CreateUserRequest,
  ) {
    const user = await this.usersService.createUser(params.orgId, body)
    return { data: user }
  }

  @Patch(':id')
  async updateUser(
    @Param() params: OrgScopedResourceParamsDto,
    @Body(new ZodValidationPipe(UpdateUserSchema)) body: UpdateUserRequest,
  ) {
    const user = await this.usersService.updateUser(params.orgId, params.id, body)
    return { data: user }
  }

  @Delete(':id')
  async deleteUser(@Param() params: OrgScopedResourceParamsDto) {
    await this.usersService.deleteUser(params.orgId, params.id)
    return { data: { deleted: true, id: params.id } }
  }
}
