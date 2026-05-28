import https from 'https';

function postRequest(url: string, body: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      }
    };
    const req = https.request(options, res => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Invalid JSON: ${data.substring(0, 200)}`)); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function getRequest(url: string, headers: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url.startsWith('http') ? url : `https://api.easyecom.io${url}`);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: "GET",
      headers
    };
    const req = https.get(options, res => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Invalid JSON: ${data.substring(0, 200)}`)); }
      });
    });
    req.on("error", reject);
  });
}

/**
 * Fetches the EasyEcom invoice PDF URL for a given Shopify order number.
 * Calls the EasyEcom API directly — no Excel file dependency.
 * Returns the S3 URL of the invoice PDF, or null if not found.
 */
export async function getEasyEcomInvoiceUrl(orderNumber: string): Promise<string | null> {
  if (!orderNumber) return null;

  const cleanNum = orderNumber.toString().trim();

  const apiKey = process.env.EASYECOM_API_KEY;
  const email = process.env.EASYECOM_EMAIL;
  const password = process.env.EASYECOM_PASSWORD;
  const locationKey = process.env.EASYECOM_LOCATION_KEY;

  if (!apiKey || !email || !password || !locationKey) {
    console.warn('[EasyEcom] Missing credentials in environment for API lookup.');
    return null;
  }

  try {
    console.log(`[EasyEcom] Fetching invoice URL from EasyEcom API for order ${cleanNum}...`);

    // Login to EasyEcom
    const loginData = JSON.stringify({ email, password, location_key: locationKey });
    const loginRes = await postRequest("https://api.easyecom.io/access/token", loginData);

    if (!loginRes?.data?.token?.jwt_token) {
      throw new Error('EasyEcom login token missing in response');
    }

    const token = `Bearer ${loginRes.data.token.jwt_token}`;

    // Search for the order by reference number (Shopify order number)
    const searchUrl = `https://api.easyecom.io/orders/V2/getAllOrders?reference_num=${cleanNum}`;
    const searchRes = await getRequest(searchUrl, {
      "x-api-key": apiKey,
      "Authorization": token
    });

    if (searchRes?.code === 200 && searchRes?.data?.orders) {
      // Find the matching order (reference_code often starts with the Shopify order number)
      const matchedOrder = searchRes.data.orders.find((o: any) =>
        o.reference_code &&
        (o.reference_code.toString().trim() === cleanNum ||
         o.reference_code.toString().trim().startsWith(cleanNum + '-') ||
         o.reference_code.toString().trim().startsWith(cleanNum))
      );

      if (matchedOrder?.documents?.easyecom_invoice) {
        const url = matchedOrder.documents.easyecom_invoice;
        console.log(`[EasyEcom] ✔ Found invoice URL for order ${cleanNum}: ${url}`);
        return url;
      } else {
        console.log(`[EasyEcom] No invoice URL found in EasyEcom for order ${cleanNum}`);
      }
    }
  } catch (err) {
    console.error(`[EasyEcom] API lookup failed for order ${cleanNum}: ${(err as Error).message}`);
  }

  return null;
}
