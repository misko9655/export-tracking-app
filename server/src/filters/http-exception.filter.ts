import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = this.extractMessage(exception);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const stack = exception instanceof Error ? exception.stack : String(exception);
      this.logger.error(`Unhandled exception: ${JSON.stringify(message)}`, stack);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message,
    });
  }

  private extractMessage(exception: unknown): string {
    if (!(exception instanceof HttpException)) {
      return 'Greška na serveru';
    }

    const body = exception.getResponse();
    if (typeof body === 'string') {
      return body;
    }
    if (body && typeof body === 'object' && 'message' in body) {
      const raw = (body as { message: unknown }).message;
      return Array.isArray(raw) ? raw.join(', ') : String(raw);
    }
    return exception.message;
  }
}