import { apiClient } from "./api";

export interface TransactionResponse {
  id: number;
  user_id: number;
  sms_log_id: number | null;
  amount: string;
  txn_type: "debit" | "credit";
  merchant_raw: string | null;
  merchant_clean: string | null;
  category_id: number | null;
  category_name: string | null;
  upi_app: string | null;
  app_label_source: string | null;
  app_label_confidence: number | null;
  source: "manual" | "sms";
  bank_ref_id: string | null;
  txn_timestamp: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionListResponse {
  total: number;
  limit: number;
  offset: number;
  items: TransactionResponse[];
}

export interface FetchTransactionsParams {
  category_id?: number;
  month?: number;
  year?: number;
  from_date?: string;
  to_date?: string;
  source?: "manual" | "sms";
  upi_app?: string;
  limit?: number;
  offset?: number;
}

export async function fetchTransactions(
  params?: FetchTransactionsParams
): Promise<TransactionListResponse> {
  const { data } = await apiClient.get<TransactionListResponse>("/transaction/", {
    params,
  });
  return data;
}

export interface CreateTransactionPayload {
  amount: number;
  txn_type: "debit" | "credit";
  merchant_raw?: string;
  category_id?: number | null;
  upi_app?: string | null;
  source: "manual" | "sms";
  txn_timestamp: string;
  notes?: string;
}

export async function createTransaction(
  payload: CreateTransactionPayload
): Promise<TransactionResponse> {
  const { data } = await apiClient.post<TransactionResponse>("/transaction/", payload);
  return data;
}
