import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { AuthModule } from './auth/auth.module'
import { DatabaseModule } from './database/database.module'
import { OrganizationsModule } from './modules/organizations/organizations.module'
import { UsersModule } from './modules/users/users.module'
import { RepresentativesModule } from './modules/representatives/representatives.module'
import { CustomerProfilesModule } from './modules/customer-profiles/customer-profiles.module'
import { TicketsModule } from './modules/tickets/tickets.module'
import { EscalationsModule } from './modules/escalations/escalations.module'
import { RefundsModule } from './modules/refunds/refunds.module'
import { BudgetsModule } from './modules/budgets/budgets.module'
import { AgentsModule } from './modules/agents/agents.module'
import { DecisionRulesModule } from './modules/decision-rules/decision-rules.module'
import { PerformanceModule } from './modules/performance/performance.module'
import { HealthModule } from './modules/health/health.module'
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    OrganizationsModule,
    UsersModule,
    RepresentativesModule,
    CustomerProfilesModule,
    TicketsModule,
    EscalationsModule,
    RefundsModule,
    BudgetsModule,
    AgentsModule,
    DecisionRulesModule,
    PerformanceModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
