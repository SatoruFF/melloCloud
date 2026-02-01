// @ts-nocheck
// FIXME: remove this in future
import _ from 'lodash';

import nodemailer from 'nodemailer';

import {
  SERVICE_NAME,
  SMTP_HOST,
  SMTP_PASSWORD,
  SMTP_PORT,
  SMTP_USER,
} from '../configs/config.js';
import { getTemplate } from '../utils/getTemplate.js';

class MailServiceClass {
  transport: any;

  constructor() {
    this.transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });
  }

  async sendActivationMail(to: string, userData: any) {
    await this.transport.sendMail({
      from: SMTP_USER,
      to,
      subject: `Account activation on ${SERVICE_NAME}`,
      text: '',
      html: getTemplate(userData),
    });
  }
}

export const MailService = new MailServiceClass();
