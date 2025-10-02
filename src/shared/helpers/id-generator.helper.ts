export class IdGenerator {
  static generateEmailId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `email_${timestamp}_${random}`;
  }

  static generateJobId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `job_${timestamp}_${random}`;
  }

  static isValidEmailId(id: string): boolean {
    return /^email_\d+_[a-z0-9]{9}$/.test(id);
  }
}
