import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export class EmailProvider {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: "smtp.ukr.net",
            port: 465,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        this.sender = process.env.SMTP_USER || "mindcare_platform@ukr.net";
    }

    async sendMail(to, subject, html) {
        return this.transporter.sendMail({
            from: `"MindCare Students" <${this.sender}>`,
            to,
            subject,
            html
        });
    }

    async sendRegistrationEmail(to, name) {
        return this.sendMail(
            to,
            "Ласкаво просимо до MindCare Students!",
            `
            <h2>Вітаємо, ${name}!</h2>
            <p>Ваш акаунт успішно створено. Тепер ви можете шукати спеціалістів та записуватись на консультації.</p>
            <p style="color:gray; font-size:12px;">Це автоматичний лист — не відповідайте на нього.</p>
            `
        );
    }

    async sendBookingEmail(to, therapistName, date, time) {
        return this.sendMail(
            to,
            "Ваш запис підтверджено",
            `
            <h2>Запис підтверджено!</h2>
            <p>Ви записані до спеціаліста <strong>${therapistName}</strong>.</p>
            <p><strong>Дата:</strong> ${date}</p>
            <p><strong>Час:</strong> ${time}</p>
            <p>Переглядати записи можна у вашому кабінеті.</p>
            <p style="color:gray; font-size:12px;">Це автоматичний лист.</p>
            `
        );
    }

    async sendCancelEmail(to, therapistName, date, time) {
        return this.sendMail(
            to,
            "Ваш запис скасовано",
            `
            <h2>Запис скасовано</h2>
            <p>Ваш запис до <strong>${therapistName}</strong> було успішно скасовано.</p>
            <p><strong>Дата:</strong> ${date}<br /><strong>Час:</strong> ${time}</p>
            `
        );
    }

    async sendReminder24h(to, therapistName, date, time) {
        return this.sendMail(
            to,
            "Нагадування про консультацію (за 24 години)",
            `
            <h2>Нагадування</h2>
            <p>Нагадуємо, що завтра у вас буде консультація зі спеціалістом <strong>${therapistName}</strong>.</p>
            <p><strong>Дата:</strong> ${date}<br /><strong>Час:</strong> ${time}</p>
            `
        );
    }

    async sendReminder1h(to, therapistName, date, time) {
        return this.sendMail(
            to,
            "Нагадування про консультацію (за 1 годину)",
            `
            <h2>Найближча консультація</h2>
            <p>Через годину у вас онлайн-сесія з <strong>${therapistName}</strong>.</p>
            <p><strong>Дата:</strong> ${date}<br /><strong>Час:</strong> ${time}</p>
            `
        );
    }

    async notifyTherapistNewClient(to, clientName, date, time) {
        return this.sendMail(
            to,
            "Новий запис від пацієнта",
            `
            <h2>Новий запис</h2>
            <p>Пацієнт <strong>${clientName}</strong> записався на консультацію.</p>
            <p><strong>Дата:</strong> ${date}</p>
            <p><strong>Час:</strong> ${time}</p>
            `
        );
    }

    async notifyTherapistCancel(to, patientName, date, time) {
        return this.sendMail(
            to,
            "Клієнт скасував запис",
            `
            <h2>Запис скасовано</h2>
            <p>Пацієнт <strong>${patientName}</strong> скасував запис.</p>
            <p><strong>Дата:</strong> ${date}<br /><strong>Час:</strong> ${time}</p>
            <p style="color:gray; font-size:12px;">Якщо виникли питання — перевірте свій кабінет або зв'яжіться з підтримкою.</p>
            `
        );
    }

    async sendPasswordChangedEmail(to) {
        return this.sendMail(
            to,
            "Пароль успішно змінено",
            `
        <h2>Ваш пароль було змінено</h2>
        <p>Якщо це були не ви, негайно змініть пароль ще раз та зверніться в підтримку.</p>
        <p style="color:gray; font-size:12px;">Це автоматичний лист — не відповідайте на нього.</p>
        `
        );
    }
}
