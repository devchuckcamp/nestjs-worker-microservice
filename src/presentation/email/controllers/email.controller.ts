import { Controller, Post, Body } from '@nestjs/common';
import { QueueEmailUseCase } from '../../../application/email/use-cases/queue-email.use-case';
import { SendEmailDto } from '../dto/send-email.dto';

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
      return {
        success: false,
        message: `Failed to queue email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}
