import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'booking@bukguide.com',
        pass: 'pazkiqegahoigqse',
    },
});

export const sendEmailService = async (template: any, dataConfig: any, toEmail: any, subjectEmail: any) => {
    const templateFile = fs.readFileSync(`src/email/template/${template}.hbs`, 'utf8');
    const compiledTemplate = handlebars.compile(templateFile);
    const html = compiledTemplate(dataConfig);
    const mailOptions = {
        from: 'booking@bukguide.com',
        to: toEmail,
        subject: subjectEmail,
        html: html,
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }

}