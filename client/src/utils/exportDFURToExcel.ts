import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { DfurProject } from '../pages/encoder/dfur';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export async function exportDFURToExcel(projects: DfurProject[]): Promise<void> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('DFUR Projects');

  ws.columns = [
    { header: 'Transaction ID',  key: 'transaction_id',      width: 20 },
    { header: 'Project',         key: 'project',              width: 30 },
    { header: 'Nature',          key: 'name_of_collection',   width: 24 },
    { header: 'Location',        key: 'location',             width: 24 },
    { header: 'Approved Cost',   key: 'total_cost_approved',  width: 18 },
    { header: 'Incurred Cost',   key: 'total_cost_incurred',  width: 18 },
    { header: 'Status',          key: 'status',               width: 14 },
    { header: 'Extensions',      key: 'no_extensions',        width: 12 },
    { header: 'Is Flagged',      key: 'is_flagged',           width: 14 },
  ];

  projects.forEach((p) => {
    ws.addRow({
      transaction_id:     p.transaction_id,
      project:            p.project,
      name_of_collection: p.name_of_collection,
      location:           p.location,
      total_cost_approved: parseFloat(p.total_cost_approved),
      total_cost_incurred: parseFloat(p.total_cost_incurred),
      status:             p.status,
      no_extensions:      p.no_extensions,
      is_flagged:         p.is_flagged ? 'Flagged' : 'Not Flagged',
    });
  });

  // Total row
  ws.addRow({
    transaction_id:      'TOTAL',
    total_cost_approved: projects.reduce((s, p) => s + parseFloat(p.total_cost_approved), 0),
    total_cost_incurred: projects.reduce((s, p) => s + parseFloat(p.total_cost_incurred), 0),
  });

  const today = formatDate(new Date().toISOString());
  const buffer = await wb.xlsx.writeBuffer();
  const blob   = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `DFUR_Projects_${today}.xlsx`);
}