import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { IOrder } from '../../domain/models/Order';
import { Store } from '../../domain/models/Store';
import { Product } from '../../domain/models/Product';

/**
 * Generate a PDF voucher from an order
 * @param order - Order data
 * @returns Path to the generated PDF file
 */
export const generateVoucherPDF = async (order: IOrder): Promise<string> => {
  let browser = null;
  try {
    console.log(`Starting PDF generation for order: ${order._id}`);
    
    // Get store and product information
    console.log(`Fetching store with ID: ${order.voucher.storeId}`);
    const store = await Store.findById(order.voucher.storeId);
    if (!store) {
      throw new Error(`Store not found with ID: ${order.voucher.storeId}`);
    }
    console.log(`Store found: ${store.name}`);

    console.log(`Fetching product with ID: ${order.voucher.productId}`);
    const product = await Product.findById(order.voucher.productId);
    if (!product) {
      throw new Error(`Product not found with ID: ${order.voucher.productId}`);
    }
    console.log(`Product found: ${product.name}`);

    // Read the template file
    const templatePath = path.join(
      __dirname,
      '../../../src/templates',
      `voucher-${order.voucher.template}.html`
    );
    
    console.log('Template path:', templatePath);
    console.log('Template exists:', fs.existsSync(templatePath));
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found at path: ${templatePath}`);
    }
    
    let templateHtml = fs.readFileSync(templatePath, 'utf8');
    console.log(`Template loaded, size: ${templateHtml.length} bytes`);

    // Replace placeholders with actual data
    console.log('Replacing placeholders in template');
    templateHtml = templateHtml
      .replace(/{{storeName}}/g, store.name)
      .replace(/{{storeAddress}}/g, store.address)
      .replace(/{{storePhone}}/g, store.phone)
      .replace(/{{storeEmail}}/g, store.email)
      .replace(/{{storeSocial}}/g, 'Follow us on social media')
      .replace(/{{storeLogo}}/g, 'https://via.placeholder.com/150x50?text=Logo')
      .replace(/{{productName}}/g, product.name)
      .replace(/{{productDescription}}/g, product.description || '')
      .replace(/{{amount}}/g, `$${order.paymentDetails.amount.toFixed(2)}`)
      .replace(/{{code}}/g, order.voucher.code)
      .replace(/{{expirationDate}}/g, new Date(order.voucher.expirationDate).toLocaleDateString())
      .replace(/{{sender_name}}/g, order.voucher.sender_name)
      .replace(/{{receiver_name}}/g, order.voucher.receiver_name)
      .replace(/{{message}}/g, order.voucher.message)
      .replace(/{{qrCode}}/g, order.voucher.qrCode);

    // Create directory for PDFs if it doesn't exist
    const pdfDir = path.join(__dirname, '../../../uploads/pdfs');
    console.log(`PDF directory path: ${pdfDir}`);
    
    if (!fs.existsSync(pdfDir)) {
      console.log(`Creating PDF directory: ${pdfDir}`);
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    // Generate PDF file path
    const pdfPath = path.join(pdfDir, `voucher-${order.voucher.code}.pdf`);
    console.log('PDF path:', pdfPath);

    // Launch puppeteer
    console.log('Launching puppeteer');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    console.log('Creating new page');
    const page = await browser.newPage();
    
    // Set content and generate PDF
    console.log('Setting page content');
    await page.setContent(templateHtml, { waitUntil: 'networkidle0' });
    
    console.log('Generating PDF');
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });
    
    console.log('Closing browser');
    await browser.close();
    browser = null;
    
    console.log(`PDF generated successfully: ${pdfPath}`);
    
    // Verify the file was created
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file was not created at path: ${pdfPath}`);
    }
    
    const fileStats = fs.statSync(pdfPath);
    console.log(`PDF file size: ${fileStats.size} bytes`);
    
    return pdfPath;
  } catch (error: any) {
    console.error('Error generating voucher PDF:', error);
    console.error(error.stack);
    
    // Clean up browser if it's still open
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
    
    throw new Error(`Failed to generate voucher PDF: ${error.message}`);
  }
}; 