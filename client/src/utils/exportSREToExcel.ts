import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Collection, Disbursement } from '../pages/encoder/sre';

export interface ExportSREData {
  startDate: string;
  endDate: string;
  activeView: 'collection' | 'disbursement';
  collections: Collection[];
  disbursements: Disbursement[];
  totalReceipts: number;
  totalExpenditures: number;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export async function exportSREToExcel(data: ExportSREData): Promise<void> {
  const wb = new ExcelJS.Workbook();

  if (data.activeView === 'collection') {
    // ── Collections sheet ───────────────────────────────────────────
    const ws = wb.addWorksheet('Collections');

    ws.columns = [
      { header: 'Transaction ID',      key: 'transaction_id',       width: 20 },
      { header: 'Date',                 key: 'date',                 width: 16 },
      { header: 'Nature of Collection', key: 'nature_of_collection', width: 36 },
      { header: 'Payor',                key: 'payor',                width: 24 },
      { header: 'OR Number',            key: 'or_number',            width: 18 },
      { header: 'Is Flagged',           key: 'is_flagged',           width: 14 },
      { header: 'Amount (PHP)',         key: 'amount',               width: 18 },
    ];

    data.collections.forEach((c) => {
      ws.addRow({
        transaction_id:       c.transactionId,
        date:                 formatDate(c.transactionDate),
        nature_of_collection: c.natureOfCollection,
        payor:                c.payor,
        or_number:            c.orNumber,
        is_flagged:           c.is_flagged ? 'Flagged' : 'Not Flagged',
        amount:               parseFloat(c.amount),
      });
    });

    // Total row
    ws.addRow({
      transaction_id: 'TOTAL',
      amount:         data.totalReceipts,
    });

  } else {
    // ── Disbursements sheet ─────────────────────────────────────────
    const ws = wb.addWorksheet('Disbursements');

    ws.columns = [
      { header: 'Transaction ID',         key: 'transaction_id',         width: 20 },
      { header: 'Date',                    key: 'date',                   width: 16 },
      { header: 'Nature of Disbursement',  key: 'nature_of_disbursement', width: 36 },
      { header: 'Payee',                   key: 'payee',                  width: 24 },
      { header: 'DV Number',               key: 'dv_number',              width: 18 },
      { header: 'Is Flagged',              key: 'is_flagged',             width: 14 },
      { header: 'Amount (PHP)',            key: 'amount',                 width: 18 },
    ];

    data.disbursements.forEach((d) => {
      ws.addRow({
        transaction_id:         d.transactionId,
        date:                   formatDate(d.transactionDate),
        nature_of_disbursement: d.natureOfDisbursement,
        payee:                  d.payee,
        dv_number:              d.dvNumber,
        is_flagged:             d.is_flagged ? 'Flagged' : 'Not Flagged',
        amount:                 parseFloat(d.amount),
      });
    });

    // Total row
    ws.addRow({
      transaction_id: 'TOTAL',
      amount:         data.totalExpenditures,
    });
  }

  // ── Save ──────────────────────────────────────────────────────────
  const sheetLabel = data.activeView === 'collection' ? 'Collections' : 'Disbursements';
  const buffer = await wb.xlsx.writeBuffer();
  const blob   = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `SRE_${sheetLabel}_${data.startDate}_to_${data.endDate}.xlsx`);
}