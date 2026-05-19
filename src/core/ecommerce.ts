/**
 * E-Commerce Deep Integration Layer
 *
 * Provides platform-specific adapters for Shopify, WooCommerce, and generic
 * e-commerce carts. Each adapter translates a configured product spec into
 * the platform's native cart line item format and sends it via the embed API
 * or direct API call.
 *
 * Usage (from embed host page):
 *   window.addEventListener('message', (e) => {
 *     if (e.data.type === 'oc:addToCart') {
 *       // e.data.lineItem contains platform-formatted cart data
 *     }
 *   });
 */

export interface CartLineItem {
  title: string;
  variant_id?: string;
  quantity: number;
  price: number;
  properties: Record<string, string>;
  image_url?: string;
}

export interface EcommerceAdapter {
  platform: string;
  formatLineItem(config: CartConfig): CartLineItem;
  addToCart(item: CartLineItem): Promise<boolean>;
}

export interface CartConfig {
  templateId: string;
  templateName: string;
  specSummary: string;
  specJson: string;
  totalPrice: number;
  currency: string;
  screenshotUrl?: string;
  shareUrl?: string;
}

// ---- Shopify Adapter ----

export const createShopifyAdapter = (options?: {
  variantId?: string;
  shopDomain?: string;
}): EcommerceAdapter => ({
  platform: 'shopify',

  formatLineItem(config) {
    return {
      title: `${config.templateName} — Custom Configuration`,
      variant_id: options?.variantId,
      quantity: 1,
      price: config.totalPrice,
      properties: {
        _configuration: config.specJson,
        'Configuration Summary': config.specSummary,
        'Share URL': config.shareUrl ?? '',
      },
      image_url: config.screenshotUrl,
    };
  },

  async addToCart(item) {
    try {
      if (typeof window !== 'undefined' && window.parent !== window) {
        window.parent.postMessage({ type: 'oc:addToCart', lineItem: item, platform: 'shopify' }, '*');
        return true;
      }
      if (options?.shopDomain) {
        const res = await fetch(`https://${options.shopDomain}/cart/add.js`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: [{
              id: item.variant_id,
              quantity: item.quantity,
              properties: item.properties,
            }],
          }),
        });
        return res.ok;
      }
      return false;
    } catch {
      return false;
    }
  },
});

// ---- WooCommerce Adapter ----

export const createWooCommerceAdapter = (options?: {
  productId?: number;
  ajaxUrl?: string;
}): EcommerceAdapter => ({
  platform: 'woocommerce',

  formatLineItem(config) {
    return {
      title: `${config.templateName} — Custom Configuration`,
      quantity: 1,
      price: config.totalPrice,
      properties: {
        configuration_json: config.specJson,
        configuration_summary: config.specSummary,
        share_url: config.shareUrl ?? '',
      },
      image_url: config.screenshotUrl,
    };
  },

  async addToCart(item) {
    try {
      if (typeof window !== 'undefined' && window.parent !== window) {
        window.parent.postMessage({ type: 'oc:addToCart', lineItem: item, platform: 'woocommerce' }, '*');
        return true;
      }
      if (options?.ajaxUrl && options?.productId) {
        const formData = new FormData();
        formData.append('product_id', String(options.productId));
        formData.append('quantity', String(item.quantity));
        Object.entries(item.properties).forEach(([key, value]) => {
          formData.append(`configuration[${key}]`, value);
        });
        const res = await fetch(options.ajaxUrl, { method: 'POST', body: formData });
        return res.ok;
      }
      return false;
    } catch {
      return false;
    }
  },
});

// ---- Generic Adapter (postMessage only) ----

export const createGenericAdapter = (): EcommerceAdapter => ({
  platform: 'generic',

  formatLineItem(config) {
    return {
      title: `${config.templateName} — Custom Configuration`,
      quantity: 1,
      price: config.totalPrice,
      properties: {
        spec: config.specJson,
        summary: config.specSummary,
        shareUrl: config.shareUrl ?? '',
      },
      image_url: config.screenshotUrl,
    };
  },

  async addToCart(item) {
    if (typeof window !== 'undefined') {
      window.parent.postMessage({ type: 'oc:addToCart', lineItem: item, platform: 'generic' }, '*');
      return true;
    }
    return false;
  },
});

// ---- Webhook for order fulfillment ----

export interface FulfillmentWebhook {
  url: string;
  secret?: string;
}

export const sendFulfillmentWebhook = async (
  webhook: FulfillmentWebhook,
  payload: {
    orderId: string;
    config: CartConfig;
    customer: { name: string; email: string };
  },
): Promise<boolean> => {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (webhook.secret) {
      headers['X-Webhook-Secret'] = webhook.secret;
    }
    const res = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
};
