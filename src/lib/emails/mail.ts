// import nodemailer from "nodemailer";

// export const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: Number(process.env.SMTP_PORT),
//   secure: Number(process.env.SMTP_PORT) === 465, // true for port 465, false for others like 587
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);
