import type {
  BackendCollection,
  BackendDisbursement,
  BackendBudgetEntry,
  Collection,
  Disbursement,
  BudgetEntry,
} from "../types";

export function backendCollectionToFrontend(backend: BackendCollection): Collection {
  return {
    id: backend.id,
    transaction_date: backend.transaction_date,
    category: backend.category,
    nature_of_collection: backend.nature_of_collection,
    payor: backend.payor,
    amount: backend.amount.toString(),
    fund_source: backend.fund_source,
    is_flagged: backend.is_flagged,
  };
}

export function backendDisbursementToFrontend(backend: BackendDisbursement): Disbursement {
  return {
    id: backend.id,
    transaction_date: backend.transaction_date,
    category: backend.category,
    nature_of_disbursement: backend.nature_of_disbursement,
    payee: backend.payee,
    amount: backend.amount.toString(),
    fund_source: backend.fund_source,
    is_flagged: backend.is_flagged,
  };
}

export function backendBudgetEntryToFrontend(backend: BackendBudgetEntry): BudgetEntry {
  return {
    id: backend.id,
    transactionDate: backend.transaction_date,
    category: backend.category,
    subcategory: backend.subcategory,
    payee: backend.payee,
    dvNumber: backend.dv_number,
    amount: backend.amount.toString(),
    fundSource: backend.fund_source,
    expenditureProgram: backend.expenditure_program,
    programDescription: backend.program_description,
    remarks: backend.remarks,
  };
}