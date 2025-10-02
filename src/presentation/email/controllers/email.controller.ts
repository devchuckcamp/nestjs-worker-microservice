import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { QueueEmailUseCase } from '../../../application/email/use-cases/queue-email.use-case';
import { SendEmailDto } from '../dto/send-email.dto';
import {
  EmailDomainException,
  InvalidEmailAddressException,
  EmailContentValidationException,
} from '../../../domain/email/exceptions/email.exceptions';

@Controller('email')
export class EmailController {
  constructor(private readonly queueEmailUseCase: QueueEmailUseCase) {}

  @Post('send')
  async sendEmail(@Body() sendEmailDto: SendEmailDto) {
    try {
      const emailId = await this.queueEmailUseCase.execute({
        from: sendEmailDto.from,
        to: sendEmailDto.to,
        subject: sendEmailDto.subject,
        textContent: sendEmailDto.textContent,
        htmlContent: sendEmailDto.htmlContent,
      });

      return {
        success: true,
        emailId: emailId.value,
        message: 'Email queued successfully',
      };
    } catch (error) {
      if (error instanceof InvalidEmailAddressException) {
        throw new HttpException(
          {
            message: error.message,
            code: error.code,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (error instanceof EmailContentValidationException) {
        throw new HttpException(
          {
            message: error.message,
            code: error.code,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (error instanceof EmailDomainException) {
        throw new HttpException(
          {
            message: error.message,
            code: error.code,
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      // Generic error handling for unexpected errors
      throw new HttpException(
        {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
