import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit');
import { DischargePlan } from '../entities/discharge-plan.entity';
import { Surgery } from '../../planning/entities/surgery.entity';
import { Patient } from '../../hce/entities/patient.entity';

@Injectable()
export class PdfGeneratorService {
  /**
   * Genera un PDF del plan de alta con datos de cirugía y paciente.
   * Requiere plan con relations: surgery, surgery.patient
   */
  async generateDischargePlanPdf(plan: DischargePlan): Promise<Buffer> {
    const surgery = plan.surgery as (Surgery & { patient?: Patient }) | undefined;
    const patient = surgery?.patient as Patient | undefined;
    const patientName = patient
      ? `${patient.firstName ?? ''} ${patient.lastName ?? ''}`.trim() || 'Paciente'
      : 'Paciente';
    const procedure = surgery?.procedure ?? 'Procedimiento';
    const scheduledDate = surgery?.scheduledDate
      ? new Date(surgery.scheduledDate).toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '—';

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ margin: 50, size: 'A4' });

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Título
      doc.fontSize(18).font('Helvetica-Bold').text('Plan de Alta Médica', { align: 'center' });
      doc.moveDown(1);

      // Datos del paciente y cirugía
      doc.fontSize(11).font('Helvetica');
      doc.text(`Paciente: ${patientName}`, { continued: false });
      doc.text(`Procedimiento: ${procedure}`);
      doc.text(`Fecha programada: ${scheduledDate}`);
      doc.text(`Estado del plan: ${plan.status === 'finalized' ? 'Finalizado' : 'Borrador'}`);
      doc.moveDown(1);

      // Resumen de la cirugía
      if (plan.surgerySummary) {
        doc.fontSize(12).font('Helvetica-Bold').text('Resumen de la cirugía');
        doc.fontSize(10).font('Helvetica');
        doc.text(plan.surgerySummary, { align: 'justify' });
        doc.moveDown(1);
      }

      // Instrucciones generales
      if (plan.instructions) {
        doc.fontSize(12).font('Helvetica-Bold').text('Instrucciones generales');
        doc.fontSize(10).font('Helvetica');
        doc.text(plan.instructions, { align: 'justify' });
        doc.moveDown(1);
      }

      // Instrucciones personalizadas
      if (plan.customInstructions?.length) {
        doc.fontSize(12).font('Helvetica-Bold').text('Instrucciones específicas');
        doc.fontSize(10).font('Helvetica');
        for (const item of plan.customInstructions) {
          doc.font('Helvetica-Bold').text(item.title);
          doc.font('Helvetica').text(item.content ?? '', { align: 'justify' });
          doc.moveDown(0.5);
        }
        doc.moveDown(0.5);
      }

      // Medicación al alta
      if (plan.medicationsAtDischarge?.length) {
        doc.fontSize(12).font('Helvetica-Bold').text('Medicación al alta');
        doc.fontSize(10).font('Helvetica');
        for (const med of plan.medicationsAtDischarge) {
          const line = [
            med.name,
            med.dosage && ` · ${med.dosage}`,
            med.frequency && ` · ${med.frequency}`,
            med.duration && ` · ${med.duration}`,
            med.indications && ` (${med.indications})`,
          ]
            .filter(Boolean)
            .join('');
          doc.text(`• ${line}`);
        }
        doc.moveDown(1);
      }

      // Citas de seguimiento
      if (plan.followUpAppointments?.length) {
        doc.fontSize(12).font('Helvetica-Bold').text('Citas de seguimiento');
        doc.fontSize(10).font('Helvetica');
        for (const apt of plan.followUpAppointments) {
          const dateStr = apt.date
            ? new Date(apt.date + 'T12:00:00.000Z').toLocaleDateString('es-ES', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : '—';
          doc.text(`• ${dateStr} — ${apt.type ?? 'Control'}${apt.notes ? `: ${apt.notes}` : ''}`);
        }
        doc.moveDown(1);
      }

      const generatedAt = new Date();
      const datePart = generatedAt.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const timePart = generatedAt.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });
      doc.fontSize(9).font('Helvetica').text(
        `Documento generado el ${datePart} a las ${timePart}. SIGQ - Sistema Integrado de Gestión Quirúrgica.`,
        { align: 'center' },
      );

      doc.end();
    });
  }
}
