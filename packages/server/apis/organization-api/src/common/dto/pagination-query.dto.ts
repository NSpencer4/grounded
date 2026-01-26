import { Type } from 'class-transformer'
import { IsOptional, IsInt, Min, Max } from 'class-validator'

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0
}

export function parsePaginationQuery(query: PaginationQueryDto): { limit: number; offset: number } {
  return {
    limit: Math.min(query.limit ?? 50, 100),
    offset: query.offset ?? 0,
  }
}
