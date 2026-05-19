/**
 * Enterprise & White-Label Module
 *
 * Enables B2B deployment for manufacturers with:
 * - White-label theming (custom logo, colors, fonts, CSS overrides)
 * - Role-based access control (RBAC) for sales reps, managers, admins
 * - CRM integration webhooks (Salesforce, HubSpot, generic)
 * - Audit log for configuration changes
 */

// ---- White-Label Theming ----

export interface WhiteLabelConfig {
  brandName: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  accentColor: string;
  fontFamily?: string;
  headerFontFamily?: string;
  customCss?: string;
  hideOpenConfiguratorBranding?: boolean;
}

export const applyWhiteLabel = (config: WhiteLabelConfig): void => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.style.setProperty('--accent', config.primaryColor);
  root.style.setProperty('--accent-strong', config.accentColor);

  if (config.fontFamily) {
    root.style.setProperty('font-family', config.fontFamily);
  }

  if (config.customCss) {
    let style = document.getElementById('oc-whitelabel-css') as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement('style');
      style.id = 'oc-whitelabel-css';
      document.head.appendChild(style);
    }
    style.textContent = config.customCss;
  }

  if (config.faviconUrl) {
    let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = config.faviconUrl;
  }

  if (config.brandName) {
    document.title = config.brandName;
  }
};

// ---- Role-Based Access Control ----

export type UserRole = 'viewer' | 'sales_rep' | 'manager' | 'admin';

export interface RbacPermissions {
  canConfigure: boolean;
  canViewPricing: boolean;
  canExport: boolean;
  canSave: boolean;
  canManageTemplates: boolean;
  canViewAuditLog: boolean;
  canManageUsers: boolean;
  canEditRules: boolean;
  canWhiteLabel: boolean;
}

const ROLE_PERMISSIONS: Record<UserRole, RbacPermissions> = {
  viewer: {
    canConfigure: true,
    canViewPricing: false,
    canExport: false,
    canSave: false,
    canManageTemplates: false,
    canViewAuditLog: false,
    canManageUsers: false,
    canEditRules: false,
    canWhiteLabel: false,
  },
  sales_rep: {
    canConfigure: true,
    canViewPricing: true,
    canExport: true,
    canSave: true,
    canManageTemplates: false,
    canViewAuditLog: false,
    canManageUsers: false,
    canEditRules: false,
    canWhiteLabel: false,
  },
  manager: {
    canConfigure: true,
    canViewPricing: true,
    canExport: true,
    canSave: true,
    canManageTemplates: true,
    canViewAuditLog: true,
    canManageUsers: false,
    canEditRules: true,
    canWhiteLabel: false,
  },
  admin: {
    canConfigure: true,
    canViewPricing: true,
    canExport: true,
    canSave: true,
    canManageTemplates: true,
    canViewAuditLog: true,
    canManageUsers: true,
    canEditRules: true,
    canWhiteLabel: true,
  },
};

export const getPermissions = (role: UserRole): RbacPermissions =>
  ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.viewer;

export const hasPermission = (role: UserRole, permission: keyof RbacPermissions): boolean =>
  getPermissions(role)[permission];

// ---- CRM Integration Webhooks ----

export interface CrmWebhookConfig {
  provider: 'salesforce' | 'hubspot' | 'generic';
  webhookUrl: string;
  apiKey?: string;
}

export interface CrmLeadPayload {
  source: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  configurationSummary: string;
  configurationJson: string;
  quoteTotal: number;
  currency: string;
  templateId: string;
}

export const sendCrmLead = async (
  config: CrmWebhookConfig,
  lead: CrmLeadPayload,
): Promise<boolean> => {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    let body: string;
    switch (config.provider) {
      case 'hubspot':
        body = JSON.stringify({
          fields: [
            { name: 'firstname', value: lead.name.split(' ')[0] },
            { name: 'lastname', value: lead.name.split(' ').slice(1).join(' ') },
            { name: 'email', value: lead.email },
            { name: 'phone', value: lead.phone ?? '' },
            { name: 'company', value: lead.company ?? '' },
            { name: 'message', value: `${lead.configurationSummary}\n\nQuote: ${lead.currency} ${lead.quoteTotal}` },
          ],
        });
        break;
      case 'salesforce':
        body = JSON.stringify({
          Name: lead.name,
          Email: lead.email,
          Phone: lead.phone,
          Company: lead.company,
          Description: lead.configurationSummary,
          LeadSource: 'OpenConfigurator',
          Custom_Configuration__c: lead.configurationJson,
          Custom_Quote_Total__c: lead.quoteTotal,
        });
        break;
      default:
        body = JSON.stringify(lead);
    }

    const res = await fetch(config.webhookUrl, { method: 'POST', headers, body });
    return res.ok;
  } catch {
    return false;
  }
};

// ---- Audit Log ----

export interface AuditEntry {
  id: string;
  timestamp: number;
  userId: string;
  userName: string;
  action: string;
  details: Record<string, unknown>;
}

const MAX_AUDIT_ENTRIES = 500;
let auditLog: AuditEntry[] = [];

export const logAuditEvent = (
  userId: string,
  userName: string,
  action: string,
  details: Record<string, unknown> = {},
): void => {
  auditLog.push({
    id: `audit_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    userId,
    userName,
    action,
    details,
  });
  if (auditLog.length > MAX_AUDIT_ENTRIES) {
    auditLog = auditLog.slice(-MAX_AUDIT_ENTRIES);
  }
};

export const getAuditLog = (limit = 100): AuditEntry[] =>
  auditLog.slice(-limit).reverse();

export const clearAuditLog = (): void => {
  auditLog = [];
};
