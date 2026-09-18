import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import type { Order } from '../orders/entities/order.entity';
import type { OrderItem } from '../orders/entities/order-item.entity';
import type { Shop } from '../shops/entities/shop.entity';

export interface InvoiceItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);
  private readonly storagePath: string;

  constructor(private readonly config: ConfigService) {
    this.storagePath = path.join(process.cwd(), 'storage', 'invoices');
    fs.mkdirSync(this.storagePath, { recursive: true });
  }

  async generateInvoice(
    order: Order,
    items: OrderItem[],
    shop: Shop,
    customer: { email: string; fullName?: string },
  ): Promise<{ buffer: Buffer; filePath: string }> {
    const invoiceFilename = `invoice-${order.id}.pdf`;
    const filePath = path.join(this.storagePath, invoiceFilename);

    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // --- Header ---
      doc
        .font('Helvetica-Bold')
        .fontSize(24)
        .text(this.config.get<string>('APP_NAME') ?? 'mini-shop', { align: 'left' })
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#666666')
        .text('Invoice', { align: 'right' })
        .moveDown(0.3);

      // --- Shop info + Invoice meta ---
      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#000000')
        .text(shop.name)
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#666666')
        .text(shop.description ?? '')
        .moveDown(0.5);

      const metaY = doc.y;
      doc.fontSize(9).fillColor('#333333');
      doc.text(`Invoice #: ${order.id.slice(0, 8).toUpperCase()}`, 350, metaY - 20);
      doc.text(`Date: ${order.createdAt.toISOString().split('T')[0]}`, 350, metaY - 7);
      doc.text(`Status: ${order.status}`, 350, metaY + 6);

      doc.moveDown(1.5);

      // --- Customer info ---
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#000000')
        .text('Bill To')
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#333333')
        .text(customer.fullName ?? customer.email)
        .text(customer.email)
        .moveDown(1);

      // --- Items table ---
      const tableTop = doc.y;
      const colWidths = [220, 70, 90, 90] as const;
      const startX = 50;

      // Table header
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor('#ffffff')
        .rect(
          startX,
          tableTop,
          colWidths.reduce((a, b) => a + b, 0),
          20,
        )
        .fill('#374151')
        .text('Product', startX + 8, tableTop + 5, { width: colWidths[0] - 10 })
        .text('Qty', startX + colWidths[0] + 8, tableTop + 5, { width: colWidths[1] - 10 })
        .text('Unit Price', startX + colWidths[0] + colWidths[1] + 8, tableTop + 5, {
          width: colWidths[2] - 10,
        })
        .text('Total', startX + colWidths[0] + colWidths[1] + colWidths[2] + 8, tableTop + 5, {
          width: colWidths[3] - 10,
        });

      let y = tableTop + 22;
      doc.font('Helvetica').fontSize(9);

      for (const item of items) {
        const lineTotal = item.quantity * item.unitPrice;
        doc
          .fillColor('#ffffff')
          .rect(
            startX,
            y,
            colWidths.reduce((a, b) => a + b, 0),
            18,
          )
          .fill('#f9fafb');
        doc.fillColor('#333333');
        doc.text(item.product?.name ?? item.productId, startX + 8, y + 3, {
          width: colWidths[0] - 10,
        });
        doc.text(String(item.quantity), startX + colWidths[0] + 8, y + 3, {
          width: colWidths[1] - 10,
        });
        doc.text(
          `${item.unitPrice.toLocaleString('fr-FR')} FCFA`,
          startX + colWidths[0] + colWidths[1] + 8,
          y + 3,
          {
            width: colWidths[2] - 10,
          },
        );
        doc.text(
          `${lineTotal.toLocaleString('fr-FR')} FCFA`,
          startX + colWidths[0] + colWidths[1] + colWidths[2] + 8,
          y + 3,
          {
            width: colWidths[3] - 10,
          },
        );
        y += 20;
      }

      // --- Totals ---
      y += 10;
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#000000');
      doc.text(`Total: ${Number(order.total).toLocaleString('fr-FR')} FCFA`, 350, y, {
        align: 'right',
        width: 200,
      });
      y += 25;

      // --- Delivery info ---
      if (order.trackingNumber || order.shippedAt || order.deliveredAt) {
        doc.moveDown(1);
        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .fillColor('#000000')
          .text('Delivery Information')
          .font('Helvetica')
          .fontSize(10)
          .fillColor('#333333');
        if (order.trackingNumber) doc.text(`Tracking: ${order.trackingNumber}`);
        if (order.shippedAt) doc.text(`Shipped: ${order.shippedAt.toISOString().split('T')[0]}`);
        if (order.deliveredAt)
          doc.text(`Delivered: ${order.deliveredAt.toISOString().split('T')[0]}`);
      }

      // --- Footer ---
      doc.moveDown(2);
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#999999')
        .text('Thank you for your purchase.', { align: 'center' });

      doc.end();
    });

    fs.writeFileSync(filePath, buffer);
    return { buffer, filePath };
  }

  getInvoicePath(orderId: string): string | null {
    const filePath = path.join(this.storagePath, `invoice-${orderId}.pdf`);
    return fs.existsSync(filePath) ? filePath : null;
  }

  async ensureInvoice(
    order: Order,
    items: OrderItem[],
    shop: Shop,
    customer: { email: string; fullName?: string },
  ): Promise<string> {
    const existing = this.getInvoicePath(order.id);
    if (existing) return existing;
    const { filePath } = await this.generateInvoice(order, items, shop, customer);
    return filePath;
  }
}
