import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/shared/schema/users';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: User, otp: number) {
    const url = `example.com/auth/confirm?token=${otp}`;

    await this.mailerService
      .sendMail({
        to: user.email,
        subject: 'Welcome to Nice App! Confirm your Email',
        template: './transactional',
        context: {
          name: user.name,
          url,
        },
      })
      .then((success) => {
        console.log(success);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async sendUserOtp(user: User, otp: number) {
    const url = `example.com/auth/confirm?token=${otp}`;

    await this.mailerService
      .sendMail({
        to: user.email,
        subject: 'Welcome to Nice App! Confirm your Email',
        template: './transactional',
        context: {
          name: user.name,
          url,
        },
      })
      .then((success) => {
        console.log(success);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async forgotPassword(user: User, password: string) {
    const url = `digitic.com/forgotpassword/confirm?token=${password}`;

    await this.mailerService
      .sendMail({
        to: user.email,
        subject: 'Welcome to Nice App! Confirm your Email',
        template: './forgotPassword',
        context: {
          name: user.name,
          url,
          password,
        },
      })
      .then((success) => {
        //console.log(success);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
