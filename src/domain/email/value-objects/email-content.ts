export class EmailContent {
  private readonly subject: string;
  private readonly textContent: string;
  private readonly htmlContent: string;

  constructor(subject: string, textContent: string, htmlContent?: string) {
    if (!subject || subject.trim().length === 0) {
      throw new Error('Email subject cannot be empty');
    }
    if (!textContent || textContent.trim().length === 0) {
      throw new Error('Email text content cannot be empty');
    }

    this.subject = subject.trim();
    this.textContent = textContent.trim();
    this.htmlContent = htmlContent?.trim() || '';
  }

  getSubject(): string {
    return this.subject;
  }

  getTextContent(): string {
    return this.textContent;
  }

  getHtmlContent(): string {
    return this.htmlContent;
  }

  hasHtmlContent(): boolean {
    return this.htmlContent.length > 0;
  }
}
