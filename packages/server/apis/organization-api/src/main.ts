import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  })

  const logger = new Logger('Bootstrap')

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  })

  // Global validation pipe with class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )

  // Set global prefix for all routes
  app.setGlobalPrefix('api')

  const port = process.env.PORT || 3000
  await app.listen(port)

  logger.log(`🚀 Organization API running on port ${port}`)
  logger.log(`📍 API endpoints available at http://localhost:${port}/api`)
  logger.log(`🔐 JWT authentication enabled`)
  logger.log(`💾 Database: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`)
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err)
  process.exit(1)
})
