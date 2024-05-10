'use server';

import nodemailer from 'nodemailer';
import prisma from '@/prisma/prismaSingleton';
import { TooManyEmailRequestsError } from '@/app/page';

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 465,
  secure: true, // Use secure connection
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
});

const COOLDOWN_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const sendEmail = async (
  emailBody: string,
  meterId: string
): Promise<void> => {
  const meter = await prisma.meter.findUnique({
    where: {
      meterId,
    },
  });

  if (!meter) {
    throw new Error(`Meter ${meterId} does not exist`);
  }

  const lastEmailSentAt = meter.sentEmailAt?.getTime() || 0;
  const currentTime = Date.now();

  if (currentTime - lastEmailSentAt < COOLDOWN_DURATION) {
    throw new TooManyEmailRequestsError(meterId);
  }

  const mailOptions = {
    from: 'accountable_evs@proton.me',
    to: process.env.EMAIL_RECIPIENT,
    subject: 'Discrepancy in Meter Credits',
    text: emailBody,
  };

  try {
    await transporter.sendMail(mailOptions);
    await prisma.meter.update({
      where: {
        meterId,
      },
      data: {
        sentEmailAt: new Date(),
      },
    });
  } catch (error) {
    throw new Error(`Failed to send email: ${error}`);
  }
};

export const sendEmailUsingMailto = (
  emailBody: string,
  meterId: string
): string => {
  const subject = encodeURIComponent('Discrepancy in Meter Credits');
  const body = encodeURIComponent(emailBody);
  const mailtoLink = `mailto:${process.env.EMAIL_RECIPIENT}?subject=${subject}&body=${body}`;

  return mailtoLink;
};