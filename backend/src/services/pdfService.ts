export interface TicketReportRow {
  ticketNumber: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  assignee: string;
  department: string;
  createdAt: string;
}

export interface ReportMetrics {
  totalTickets: number;
  resolvedTickets: number;
  openTickets: number;
  slaComplianceRate: number;
  avgCsat: number;
  generatedAt: string;
}

function escapePdfText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, '?'); // sanitize to standard ASCII for Helvetica
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen - 3) + '...';
}

function pad(text: string, len: number): string {
  const clean = truncate(text, len);
  return clean + ' '.repeat(Math.max(0, len - clean.length));
}

export function generateEnterprisePdfReport(
  metrics: ReportMetrics,
  tickets: TicketReportRow[],
  filterSummary: string = 'All Departments • All Priorities'
): Buffer {
  const streamLines: string[] = [];

  // Begin text block
  streamLines.push('BT');

  // Title Header
  streamLines.push('/F1 18 Tf');
  streamLines.push('50 745 Td');
  streamLines.push(`(${escapePdfText('HelpDesk 360 — Executive IT Support Report')}) Tj`);

  // Subtitle
  streamLines.push('0 -20 Td');
  streamLines.push('/F1 10 Tf');
  streamLines.push(`(${escapePdfText(`Generated on: ${metrics.generatedAt} | Scope: ${filterSummary}`)}) Tj`);

  // Section Divider
  streamLines.push('0 -15 Td');
  streamLines.push(`(${escapePdfText('==========================================================================================')}) Tj`);

  // KPI Metrics Summary Box
  streamLines.push('0 -20 Td');
  streamLines.push('/F1 11 Tf');
  streamLines.push(`(${escapePdfText('EXECUTIVE SUMMARY & OPERATIONAL HEALTH')}) Tj`);
  streamLines.push('0 -16 Td');
  streamLines.push('/F1 9 Tf');
  streamLines.push(
    `(${escapePdfText(
      `Total Requests: ${metrics.totalTickets}   |   Resolved: ${metrics.resolvedTickets}   |   Open: ${metrics.openTickets}   |   SLA Compliance: ${metrics.slaComplianceRate}%   |   Avg CSAT: ${metrics.avgCsat}/5.0`
    )}) Tj`
  );

  // Divider
  streamLines.push('0 -15 Td');
  streamLines.push(`(${escapePdfText('------------------------------------------------------------------------------------------')}) Tj`);

  // Table Column Header
  streamLines.push('0 -18 Td');
  streamLines.push('/F1 9 Tf');
  const tableHeader =
    pad('TICKET ID', 11) +
    pad('TITLE', 32) +
    pad('CATEGORY', 14) +
    pad('PRIORITY', 10) +
    pad('STATUS', 12) +
    pad('TECHNICIAN', 16);
  streamLines.push(`(${escapePdfText(tableHeader)}) Tj`);

  streamLines.push('0 -12 Td');
  streamLines.push(`(${escapePdfText('------------------------------------------------------------------------------------------')}) Tj`);

  // Rows (limit to first 30 for clean single/two page layout)
  const displayTickets = tickets.slice(0, 32);
  for (const t of displayTickets) {
    streamLines.push('0 -13 Td');
    const rowText =
      pad(t.ticketNumber, 11) +
      pad(t.title, 32) +
      pad(t.category, 14) +
      pad(t.priority, 10) +
      pad(t.status, 12) +
      pad(t.assignee || 'Unassigned', 16);
    streamLines.push(`(${escapePdfText(rowText)}) Tj`);
  }

  if (tickets.length > displayTickets.length) {
    streamLines.push('0 -15 Td');
    streamLines.push(`(${escapePdfText(`... and ${tickets.length - displayTickets.length} additional ticket records archived in system database.` )}) Tj`);
  }

  // Footer Notice
  streamLines.push('0 -22 Td');
  streamLines.push('/F1 8 Tf');
  streamLines.push(`(${escapePdfText('Confidential • HelpDesk 360 Enterprise ITSM Platform • Verified Cryptographic Token Authentication')}) Tj`);

  // End text block
  streamLines.push('ET');

  const streamBody = streamLines.join('\n');
  const streamByteLength = Buffer.byteLength(streamBody, 'latin1');

  // PDF Structure
  const objects: string[] = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');
  objects.push('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj');
  objects.push('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj');
  objects.push(`5 0 obj\n<< /Length ${streamByteLength} >>\nstream\n${streamBody}\nendstream\nendobj`);

  const chunks: Buffer[] = [];
  const headerBuf = Buffer.from('%PDF-1.4\n', 'latin1');
  chunks.push(headerBuf);

  const offsets: number[] = [0];
  let currentOffset = headerBuf.length;

  for (const obj of objects) {
    offsets.push(currentOffset);
    const objBuf = Buffer.from(obj + '\n', 'latin1');
    chunks.push(objBuf);
    currentOffset += objBuf.length;
  }

  const xrefOffset = currentOffset;
  let xrefStr = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    const off = offsets[i];
    xrefStr += `${off.toString().padStart(10, '0')} 00000 n \n`;
  }
  xrefStr += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  chunks.push(Buffer.from(xrefStr, 'latin1'));
  return Buffer.concat(chunks);
}
