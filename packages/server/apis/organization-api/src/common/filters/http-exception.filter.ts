import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Response } from 'express'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let error = 'Internal Server Error'
    let message = 'An unexpected error occurred'
    let details: unknown = undefined

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse
        error = exception.name
      } else if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as Record<string, unknown>
        error = (res.error as string) || exception.name
        message = (res.message as string) || message
        details = res.details
      }
    } else if (exception instanceof Error) {
      message = exception.message
      this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack)
    }

    const responseBody: Record<string, unknown> = {
      error,
      message,
    }

    if (details) {
      responseBody.details = details
    }

    response.status(status).json(responseBody)
  }
}
