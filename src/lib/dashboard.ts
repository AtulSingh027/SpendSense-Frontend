import { apiClient } from "./api";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TodaySpend {
  total_amount: string;
  count: number;
  difference: string;
  diff_percent: number;
  is_higher: boolean;
}

export interface CurrentMonthSpend {
  total_amount: string;
  count: number;
  last_month_total: string;
  difference: string;
  diff_percent: number;
  is_higher: boolean;
}

export interface UPIManualSpend {
  upi_spend: string;
  manual_spend: string;
  filter_type: string;
  period_start: string;
  period_end: string;
}

export interface UPIAppBreakdownItem {
  app: string;
  app_label_source: string;
  amount: string;
  percentage: number;
}

export interface UPIAppsBreakdown {
  total_spend: string;
  items: UPIAppBreakdownItem[];
  period_start: string;
  period_end: string;
}

export interface CategoryBreakdownItem {
  category_name: string;
  amount: string;
  percentage: number;
}

export interface CategoryBreakdown {
  total_amount: string;
  categories: CategoryBreakdownItem[];
}

// ─── API Calls ──────────────────────────────────────────────────────────────

export async function fetchTodaySpend(): Promise<TodaySpend> {
  const { data } = await apiClient.get<TodaySpend>("/dashboard/today");
  return data;
}

export async function fetchCurrentMonthSpend(): Promise<CurrentMonthSpend> {
  const { data } = await apiClient.get<CurrentMonthSpend>("/dashboard/current-month");
  return data;
}

export async function fetchUPIManualSpend(
  filterType: string = "month",
  customStart?: string,
  customEnd?: string
): Promise<UPIManualSpend> {
  const { data } = await apiClient.get<UPIManualSpend>("/dashboard/upi-manual-spend", {
    params: {
      filter_type: filterType,
      custom_start: customStart,
      custom_end: customEnd,
    },
  });
  return data;
}

export async function fetchUPIAppsBreakdown(
  filterType: string = "month",
  customStart?: string,
  customEnd?: string
): Promise<UPIAppsBreakdown> {
  const { data } = await apiClient.get<UPIAppsBreakdown>("/dashboard/upi-apps-breakdown", {
    params: {
      filter_type: filterType,
      custom_start: customStart,
      custom_end: customEnd,
    },
  });
  return data;
}

export async function fetchCategoryBreakdown(
  filterType: string = "month",
  customStart?: string,
  customEnd?: string
): Promise<CategoryBreakdown> {
  const { data } = await apiClient.get<CategoryBreakdown>("/dashboard/breakdown", {
    params: {
      filter_type: filterType,
      custom_start: customStart,
      custom_end: customEnd,
    },
  });
  return data;
}
