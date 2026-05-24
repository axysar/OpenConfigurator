/**
 * Generates a print-ready HTML spec sheet that opens in a new window
 * with window.print() pre-invoked. No external PDF library needed.
 *
 * The sheet includes: configuration summary, engineering metrics,
 * BOM table, quote breakdown, and a footer with timestamp.
 */
import type { PergolaSpec } from './pergolaSpec';
import type { PergolaMetrics } from './pergolaMath';
import type { PergolaQuote } from './pricing';
import type { BomRow } from './bom';

interface SpecSheetData {
  spec: PergolaSpec;
  metrics: PergolaMetrics;
  quote: PergolaQuote;
  bom: BomRow[];
  materialLabel: string;
  loadScenarioLabel: string;
  screenshotDataUrl?: string | null;
}

const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const fmtCurrency = (value: number): string =>
  `$${Math.round(value).toLocaleString()}`;

export const generateSpecSheetHtml = (data: SpecSheetData): string => {
  const { spec, metrics, quote, bom, materialLabel, loadScenarioLabel, screenshotDataUrl } = data;

  const imageBlock = screenshotDataUrl
    ? `<div class="screenshot"><img src="${screenshotDataUrl}" alt="Pergola configuration preview" /></div>`
    : '';

  const bomRows = bom
    .map(
      (row) =>
        `<tr><td>${escapeHtml(row.category)}</td><td>${escapeHtml(row.section)}</td><td class="r">${row.count}</td><td class="r">${row.totalLengthM.toFixed(2)} m</td></tr>`,
    )
    .join('');

  const quoteRows = quote.lines
    .map(
      (line) =>
        `<tr><td>${escapeHtml(line.label)}</td><td class="r">${fmtCurrency(line.amount)}</td></tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Pergola Specification Sheet</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; padding: 28px 36px; font-size: 11px; line-height: 1.45; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  h2 { font-size: 13px; margin: 18px 0 6px; text-transform: uppercase; letter-spacing: 0.08em; color: #444; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
  .sub { color: #666; font-size: 10px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; margin: 8px 0; }
  .grid dt { color: #666; }
  .grid dd { font-weight: 600; text-align: right; }
  table { width: 100%; border-collapse: collapse; margin: 6px 0; font-size: 10.5px; }
  th, td { padding: 4px 6px; border-bottom: 1px solid #eee; text-align: left; }
  th { font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.06em; color: #888; }
  .r { text-align: right; }
  .total-row td { border-top: 2px solid #333; font-weight: 700; font-size: 13px; padding-top: 8px; }
  .screenshot { margin: 12px 0; text-align: center; }
  .screenshot img { max-width: 100%; max-height: 280px; border: 1px solid #ddd; border-radius: 6px; }
  .footer { margin-top: 24px; border-top: 1px solid #ccc; padding-top: 8px; color: #999; font-size: 9px; display: flex; justify-content: space-between; }
  @media print { body { padding: 16px; } }
</style>
</head>
<body>
<h1>Pergola Specification Sheet</h1>
<p class="sub">Generated ${new Date().toLocaleString()} • OpenConfigurator</p>

${imageBlock}

<h2>Configuration</h2>
<dl class="grid">
  <dt>Mode</dt><dd>${spec.modelMode === 'parametric' ? 'Mathematical' : 'Sample GLB'}</dd>
  <dt>Dimensions</dt><dd>${spec.dimensions.width.toFixed(2)} × ${spec.dimensions.depth.toFixed(2)} × ${spec.dimensions.height.toFixed(2)} m</dd>
  <dt>Material</dt><dd>${escapeHtml(materialLabel)}</dd>
  <dt>Load Scenario</dt><dd>${escapeHtml(loadScenarioLabel)}</dd>
</dl>

<h2>Engineering Metrics</h2>
<dl class="grid">
  <dt>Footprint</dt><dd>${metrics.footprintM2.toFixed(2)} m²</dd>
  <dt>Perimeter</dt><dd>${metrics.perimeterM.toFixed(2)} m</dd>
  <dt>Clear Height</dt><dd>${metrics.clearHeightM.toFixed(2)} m</dd>
  <dt>Posts</dt><dd>${metrics.postCount} (${Math.round(metrics.postThicknessM * 1000)} mm)</dd>
  <dt>Bays</dt><dd>${metrics.bayCountX} × ${metrics.bayCountZ}</dd>
  <dt>Beam Section</dt><dd>${Math.round(metrics.beamWidthM * 1000)} × ${Math.round(metrics.beamDepthM * 1000)} mm</dd>
  <dt>Slats</dt><dd>${metrics.slatCount}</dd>
  <dt>Shade Coverage</dt><dd>${metrics.shadeCoveragePct.toFixed(1)}%</dd>
  <dt>Design Load</dt><dd>${metrics.designLoadKPa.toFixed(2)} kPa</dd>
  <dt>Utilization</dt><dd>${metrics.structuralUtilizationPct.toFixed(0)}%</dd>
  <dt>Frame Volume</dt><dd>${metrics.frameVolumeM3.toFixed(3)} m³</dd>
  <dt>Est. Weight</dt><dd>${Math.round(metrics.estimatedWeightKg)} kg</dd>
</dl>

<h2>Bill of Materials</h2>
<table>
  <thead><tr><th>Category</th><th>Section</th><th class="r">Qty</th><th class="r">Total Length</th></tr></thead>
  <tbody>${bomRows}</tbody>
</table>

<h2>Estimated Investment</h2>
<table>
  <thead><tr><th>Line Item</th><th class="r">Amount</th></tr></thead>
  <tbody>
    ${quoteRows}
    <tr><td>Subtotal</td><td class="r">${fmtCurrency(quote.subtotal)}</td></tr>
    <tr><td>Tax (est.)</td><td class="r">${fmtCurrency(quote.tax)}</td></tr>
    <tr class="total-row"><td>Total</td><td class="r">${fmtCurrency(quote.total)}</td></tr>
  </tbody>
</table>

<div class="footer">
  <span>OpenConfigurator — Pergola Studio 3D</span>
  <span>This is an estimate for reference only, not a binding contract.</span>
</div>

<script>window.onload = function() { window.print(); }</script>
</body>
</html>`;
};

export const openSpecSheetPdf = (data: SpecSheetData): void => {
  if (typeof window === 'undefined') return;
  const html = generateSpecSheetHtml(data);
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
};
