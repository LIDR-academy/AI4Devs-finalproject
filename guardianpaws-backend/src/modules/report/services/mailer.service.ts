import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { ReportePerdida } from '../entities/reporte-perdida.entity';

@Injectable()
export class MailerService {
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.configService.get('MAIL_USER'),
                pass: this.configService.get('MAIL_PASSWORD'),
            },
        });
    }

    async sendPotentialMatchEmail(
        ownerEmail: string,
        reporteOriginal: ReportePerdida,
        reporteCoincidencia: ReportePerdida,
        similarity: number
    ): Promise<void> {
        const encodedEmail = encodeURIComponent(ownerEmail);
        const reportUrl = `${this.configService.get('FRONTEND_URL')}/reportes/${reporteCoincidencia.id}?email=${encodedEmail}`;

        const mailOptions = {
            from: this.configService.get('MAIL_USER'),
            to: ownerEmail,
            subject: '¡Posible coincidencia encontrada para tu mascota!',
            html: `
                <h1>¡Hemos encontrado una posible coincidencia para tu mascota!</h1>
                <p>Hemos encontrado una mascota que podría ser la tuya con un ${similarity.toFixed(2)}% de similitud.</p>
                <p>Detalles del reporte original:</p>
                <ul>
                    <li>Fecha de reporte: ${reporteOriginal.fechaReporte}</li>
                    <li>Ubicación: ${reporteOriginal.ubicacion}</li>
                </ul>
                <p>Detalles de la posible coincidencia:</p>
                <ul>
                    <li>Fecha de reporte: ${reporteCoincidencia.fechaReporte}</li>
                    <li>Ubicación: ${reporteCoincidencia.ubicacion}</li>
                </ul>
                <p>Por favor, ingresa a la plataforma para ver más detalles y contactar a la persona que reportó la mascota.</p>
                <a href="${reportUrl}">
                    Ver detalles del reporte
                </a>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }
} 