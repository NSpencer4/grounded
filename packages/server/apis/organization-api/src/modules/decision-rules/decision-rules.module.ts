import { Module } from '@nestjs/common'
import { DecisionRulesController } from './decision-rules.controller'
import { DecisionRulesService } from './decision-rules.service'

@Module({
  controllers: [DecisionRulesController],
  providers: [DecisionRulesService],
})
export class DecisionRulesModule {}
