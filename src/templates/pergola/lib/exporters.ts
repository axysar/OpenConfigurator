/**
 * Browser-only export helpers. They live in the template (not @shared)
 * because the file shapes are pergola-specific.
 */

const triggerDownload = (blob: Blob, filename: string): void => {
  if (typeof window === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 800);
};

export const downloadJson = <T,>(data: T, filename: string): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  triggerDownload(blob, filename);
};

export const downloadCsv = (csv: string, filename: string): void => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  triggerDownload(blob, filename);
};

export const downloadPng = (dataUrl: string, filename: string): void => {
  if (typeof window === 'undefined') return;
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const copyTextToClipboard = async (text: string): Promise<boolean> => {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* fall through to legacy path */
    }
  }
  if (typeof document === 'undefined') return false;
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
};
