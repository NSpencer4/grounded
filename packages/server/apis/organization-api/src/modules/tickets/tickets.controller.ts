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
import { TicketsService } from './tickets.service'
import { OrgScopedParamsDto, OrgScopedResourceParamsDto } from '../../common/dto/uuid-param.dto'
import { PaginationQueryDto, parsePaginationQuery } from '../../common/dto/pagination-query.dto'
import {
  CreateTicketSchema,
  UpdateTicketSchema,
  CreateTicketRequest,
  UpdateTicketRequest,
} from '../../schemas/requests'
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { OrgAuthGuard } from '../../auth/guards/org-auth.guard'

@Controller('organizations/:orgId/tickets')
@UseGuards(JwtAuthGuard, OrgAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  async listTickets(@Param() params: OrgScopedParamsDto, @Query() query: PaginationQueryDto) {
    const pagination = parsePaginationQuery(query)
    const tickets = await this.ticketsService.listTickets(params.orgId, pagination)
    return {
      data: tickets,
      meta: pagination,
    }
  }

  @Get(':id')
  async getTicket(@Param() params: OrgScopedResourceParamsDto) {
    const ticket = await this.ticketsService.getTicket(params.orgId, params.id)
    return { data: ticket }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTicket(
    @Param() params: OrgScopedParamsDto,
    @Body(new ZodValidationPipe(CreateTicketSchema)) body: CreateTicketRequest,
  ) {
    const ticket = await this.ticketsService.createTicket(params.orgId, body)
    return { data: ticket }
  }

  @Patch(':id')
  async updateTicket(
    @Param() params: OrgScopedResourceParamsDto,
    @Body(new ZodValidationPipe(UpdateTicketSchema)) body: UpdateTicketRequest,
  ) {
    const ticket = await this.ticketsService.updateTicket(params.orgId, params.id, body)
    return { data: ticket }
  }

  @Delete(':id')
  async deleteTicket(@Param() params: OrgScopedResourceParamsDto) {
    await this.ticketsService.deleteTicket(params.orgId, params.id)
    return { data: { deleted: true, id: params.id } }
  }
}
