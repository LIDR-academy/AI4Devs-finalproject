import nodemailer from 'nodemailer';
import { IOrder } from '../../domain/models/Order';
import { Store } from '../../domain/models/Store';
import fs from 'fs';
import path from 'path';

// Create a transporter object using Mailtrap SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || 'your_mailtrap_username',
      pass: process.env.SMTP_PASSWORD || 'your_mailtrap_password',
    },
  });
};

/**
 * Send email to store with voucher attached
 * @param order - Order data
 * @param store - Store data
 * @param pdfPath - Path to the voucher PDF
 */
export const sendStoreEmail = async (
  order: IOrder,
  store: any,
  pdfPath: string
): Promise<void> => {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"Gift Voucher Platform" <${process.env.EMAIL_FROM || 'noreply@giftvoucherplatform.com'}>`,
      to: store.email,
      subject: 'A new voucher has been purchased!',
      html: `
        <h1>New Voucher Purchase</h1>
        <p>Hello ${store.name},</p>
        <p>A new voucher has been purchased for your store.</p>
        <h2>Client Details:</h2>
        <ul>
          <li><strong>Sender:</strong> ${order.voucher.sender_name} (${order.voucher.sender_email})</li>
          <li><strong>Receiver:</strong> ${order.voucher.receiver_name} (${order.voucher.receiver_email})</li>
          <li><strong>Amount:</strong> $${order.paymentDetails.amount}</li>
          <li><strong>Voucher Code:</strong> ${order.voucher.code}</li>
          <li><strong>Expiration Date:</strong> ${new Date(order.voucher.expirationDate).toLocaleDateString()}</li>
        </ul>
        <p>The voucher is attached to this email.</p>
        <p>Thank you for using our platform!</p>
      `,
      attachments: [
        {
          filename: `voucher-${order.voucher.code}.pdf`,
          path: pdfPath,
          contentType: 'application/pdf',
        },
      ],
    });

    console.log(`Email sent to store: ${store.email}`);
  } catch (error: any) {
    console.error('Error sending email to store:', error);
    throw new Error(`Failed to send email to store: ${error.message}`);
  }
};

/**
 * Send email to receiver with voucher attached
 * @param order - Order data
 * @param pdfPath - Path to the voucher PDF
 */
export const sendReceiverEmail = async (
  order: IOrder,
  pdfPath: string
): Promise<void> => {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"Gift Voucher Platform" <${process.env.EMAIL_FROM || 'noreply@giftvoucherplatform.com'}>`,
      to: order.voucher.receiver_email,
      subject: `You've received a gift voucher from ${order.voucher.sender_name}!`,
      html: `
        <h1>You've Received a Gift Voucher!</h1>
        <p>Hello ${order.voucher.receiver_name},</p>
        <p>${order.voucher.sender_name} has sent you a gift voucher with the following message:</p>
        <blockquote style="border-left: 4px solid #ccc; padding-left: 16px; margin-left: 0; font-style: italic;">
          "${order.voucher.message}"
        </blockquote>
        <p>Your voucher code is: <strong>${order.voucher.code}</strong></p>
        <p>Expiration Date: ${new Date(order.voucher.expirationDate).toLocaleDateString()}</p>
        <p>The voucher is attached to this email as a PDF.</p>
        <p>Enjoy your gift!</p>
      `,
      attachments: [
        {
          filename: `voucher-${order.voucher.code}.pdf`,
          path: pdfPath,
          contentType: 'application/pdf',
        },
      ],
    });

    console.log(`Email sent to receiver: ${order.voucher.receiver_email}`);
  } catch (error: any) {
    console.error('Error sending email to receiver:', error);
    throw new Error(`Failed to send email to receiver: ${error.message}`);
  }
};

/**
 * Send email to customer with voucher attached
 * @param order - Order data
 * @param pdfPath - Path to the voucher PDF
 */
export const sendCustomerEmail = async (
  order: IOrder,
  pdfPath: string
): Promise<void> => {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"Gift Voucher Platform" <${process.env.EMAIL_FROM || 'noreply@giftvoucherplatform.com'}>`,
      to: order.paymentDetails.paymentEmail,
      subject: 'Your Gift Voucher Purchase Confirmation',
      html: `
        <h1>Gift Voucher Purchase Confirmation</h1>
        <p>Hello ${order.voucher.sender_name},</p>
        <p>Thank you for your purchase! Your gift voucher has been created successfully.</p>
        <h2>Voucher Details:</h2>
        <ul>
          <li><strong>Voucher Code:</strong> ${order.voucher.code}</li>
          <li><strong>Recipient:</strong> ${order.voucher.receiver_name}</li>
          <li><strong>Amount:</strong> $${order.paymentDetails.amount}</li>
          <li><strong>Expiration Date:</strong> ${new Date(order.voucher.expirationDate).toLocaleDateString()}</li>
        </ul>
        <p>The voucher has been sent to ${order.voucher.receiver_email} and is also attached to this email.</p>
        <p>Thank you for using our platform!</p>
      `,
      attachments: [
        {
          filename: `voucher-${order.voucher.code}.pdf`,
          path: pdfPath,
          contentType: 'application/pdf',
        },
      ],
    });

    console.log(`Email sent to customer: ${order.paymentDetails.paymentEmail}`);
  } catch (error: any) {
    console.error('Error sending email to customer:', error);
    throw new Error(`Failed to send email to customer: ${error.message}`);
  }
};

/**
 * Send all emails for a voucher order
 * @param order - Order data
 * @param pdfPath - Path to the voucher PDF
 */
export const sendAllVoucherEmails = async (
  order: IOrder,
  pdfPath: string
): Promise<void> => {
  try {
    // Get store information
    const store = await Store.findById(order.voucher.storeId);
    if (!store) {
      throw new Error(`Store not found with ID: ${order.voucher.storeId}`);
    }

    // Send emails with error handling for each
    const results = await Promise.allSettled([
      sendStoreEmail(order, store, pdfPath),
      sendReceiverEmail(order, pdfPath),
      sendCustomerEmail(order, pdfPath)
    ]);

    // Check for any failures
    const failures = results.filter(result => result.status === 'rejected');
    if (failures.length > 0) {
      console.warn(`${failures.length} out of 3 emails failed to send`);
      failures.forEach((failure, index) => {
        if (failure.status === 'rejected') {
          console.error(`Email ${index} failed:`, failure.reason);
        }
      });
      
      // If all emails failed, throw an error
      if (failures.length === 3) {
        throw new Error('All emails failed to send');
      }
    } else {
      console.log(`All emails sent successfully for order: ${order._id}`);
    }
  } catch (error: any) {
    console.error('Error sending voucher emails:', error);
    throw new Error(`Failed to send voucher emails: ${error.message}`);
  }
}; 