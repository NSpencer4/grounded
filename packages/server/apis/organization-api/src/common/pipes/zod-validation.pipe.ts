import { PipeTransform, Injectable, BadRequestException, ArgumentMetadata } from '@nestjs/common'
import { ZodSchema, ZodError } from 'zod'

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value
    }

    const result = this.schema.safeParse(value)

    if (!result.success) {
      const errors = result.error.errors.map((err: ZodError['errors'][0]) => ({
        field: err.path.join('.') || 'root',
        message: err.message,
      }))

      throw new BadRequestException({
        error: 'Validation failed',
        details: errors,
      })
    }

    return result.data
  }
}

export function ZodValidation(schema: ZodSchema): ZodValidationPipe {
  return new ZodValidationPipe(schema)
}
