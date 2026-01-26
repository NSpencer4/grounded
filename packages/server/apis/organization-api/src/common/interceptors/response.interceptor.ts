import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface ApiResponse<T> {
  data: T
  meta?: {
    limit?: number
    offset?: number
    total?: number
  }
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((response) => {
        if (response && typeof response === 'object' && 'data' in response) {
          return response as ApiResponse<T>
        }
        return { data: response }
      }),
    )
  }
}
