import { NextApiRequest, NextApiResponse } from "next";
import db from "db";
import { getEasyEcomInvoiceUrl } from "utils/easyecom";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { orderId } = req.query;
  if (!orderId) {
    return res.status(400).json({ error: "Missing orderId" });
  }

  try {
    const order = await db.orders.findFirst({
      where: { id: Number(orderId) },
      include: { shopify: true }
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // 1. Check DB cache first (invoiceUrl in shopify table)
    let invoiceUrl: string | null = order.shopify?.invoiceUrl || null;

    // 2. If not cached, fetch from EasyEcom API and cache it
    if (!invoiceUrl) {
      const orderNumber = order.shopify?.orderNumber || order.id.toString();
      invoiceUrl = await getEasyEcomInvoiceUrl(orderNumber);

      // Cache in DB for next time
      if (invoiceUrl && order.shopify?.id) {
        try {
          await db.shopify.update({
            where: { id: order.shopify.id },
            data: { invoiceUrl },
          });
          console.log(`[Invoice Proxy] Cached invoice URL in DB for order ${orderNumber}`);
        } catch (e: any) {
          console.warn(`[Invoice Proxy] Failed to cache invoice URL: ${e.message}`);
        }
      }
    }

    if (!invoiceUrl) {
      return res.status(404).json({ error: "Invoice URL not found for this order" });
    }

    console.log(`[Invoice Proxy] Fetching PDF: ${invoiceUrl}`);
    const response = await axios.get(invoiceUrl, {
      responseType: "arraybuffer",
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=\"invoice.pdf\"");
    return res.send(response.data);
  } catch (error: any) {
    console.error("[Invoice Proxy] Failed to proxy PDF invoice:", error.message);
    return res.status(500).json({ error: "Failed to load PDF invoice" });
  }
}
