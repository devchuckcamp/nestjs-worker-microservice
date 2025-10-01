import { EmailAddress } from '../value-objects/email-address';
import { EmailContent } from '../value-objects/email-content';

export interface EmailId {
  value: string;
}

export class Email {
  private readonly id: EmailId;
  private readonly from: EmailAddress;
  private readonly to: EmailAddress;
  private readonly content: EmailContent;
  private readonly createdAt: Date;
  private status: EmailStatus;
  private sentAt?: Date;
  private failureReason?: string;

  constructor(
    id: EmailId,
    from: EmailAddress,
    to: EmailAddress,
    content: EmailContent,
  ) {
    this.id = id;
    this.from = from;
    this.to = to;
    this.content = content;
    this.createdAt = new Date();
    this.status = EmailStatus.PENDING;
  }

  getId(): EmailId {
    return this.id;
  }

  getFrom(): EmailAddress {
    return this.from;
  }

  getTo(): EmailAddress {
    return this.to;
  }

  getContent(): EmailContent {
    return this.content;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getStatus(): EmailStatus {
    return this.status;
  }

  getSentAt(): Date | undefined {
    return this.sentAt;
  }

  getFailureReason(): string | undefined {
    return this.failureReason;
  }

  markAsSent(): void {
    if (this.status !== EmailStatus.PENDING) {
      throw new Error('Only pending emails can be marked as sent');
    }
    this.status = EmailStatus.SENT;
    this.sentAt = new Date();
    this.failureReason = undefined;
  }

  markAsFailed(reason: string): void {
    if (this.status !== EmailStatus.PENDING) {
      throw new Error('Only pending emails can be marked as failed');
    }
    this.status = EmailStatus.FAILED;
    this.failureReason = reason;
  }

  retry(): void {
    if (this.status !== EmailStatus.FAILED) {
      throw new Error('Only failed emails can be retried');
    }
    this.status = EmailStatus.PENDING;
    this.failureReason = undefined;
  }

  isPending(): boolean {
    return this.status === EmailStatus.PENDING;
  }

  isSent(): boolean {
    return this.status === EmailStatus.SENT;
  }

  isFailed(): boolean {
    return this.status === EmailStatus.FAILED;
  }
}

export enum EmailStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}
