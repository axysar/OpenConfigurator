import { describe, expect, it } from 'vitest';
import {
  getPermissions,
  hasPermission,
  logAuditEvent,
  getAuditLog,
  clearAuditLog,
  type UserRole,
} from '@core/enterprise';

describe('enterprise RBAC', () => {
  it('admin has all permissions', () => {
    const perms = getPermissions('admin');
    expect(perms.canConfigure).toBe(true);
    expect(perms.canManageUsers).toBe(true);
    expect(perms.canWhiteLabel).toBe(true);
    expect(perms.canEditRules).toBe(true);
  });

  it('viewer has minimal permissions', () => {
    const perms = getPermissions('viewer');
    expect(perms.canConfigure).toBe(true);
    expect(perms.canViewPricing).toBe(false);
    expect(perms.canExport).toBe(false);
    expect(perms.canManageUsers).toBe(false);
  });

  it('sales_rep can export but not manage', () => {
    expect(hasPermission('sales_rep', 'canExport')).toBe(true);
    expect(hasPermission('sales_rep', 'canManageTemplates')).toBe(false);
  });

  it('unknown role defaults to viewer', () => {
    const perms = getPermissions('unknown' as UserRole);
    expect(perms.canManageUsers).toBe(false);
  });
});

describe('audit log', () => {
  it('records and retrieves events', () => {
    clearAuditLog();
    logAuditEvent('u1', 'Alice', 'config_saved', { templateId: 'pergola' });
    logAuditEvent('u1', 'Alice', 'export_pdf', {});

    const log = getAuditLog();
    expect(log).toHaveLength(2);
    expect(log[0].action).toBe('export_pdf');
    expect(log[1].action).toBe('config_saved');
  });

  it('clears the log', () => {
    logAuditEvent('u2', 'Bob', 'test', {});
    clearAuditLog();
    expect(getAuditLog()).toHaveLength(0);
  });
});
