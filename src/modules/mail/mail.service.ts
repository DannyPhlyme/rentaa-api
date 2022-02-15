// import { Injectable } from '@nestjs/common';
// import { MailerService } from '@nestjs-modules/mailer';

// @Injectable()
// export class MailService {
//   constructor(private mailerService: MailerService) {}

//   async mailUser(payload: {
//     to: string;
//     subject: string;
//     emailData: Record<string, any>;
//     emailTemplate: string;
//   }) {
//     await this.mailerService.sendMail({
//       to: payload.to,
//       // from: '"Support Team" <support@example.com>', // override default from
//       subject: payload.subject,
//       template: `${payload.emailTemplate}`,
//       context: payload.emailData,
//     });
//   }
// }
