import { apiClient } from "./api";

export interface CategoryResponse {
  id: number;
  user_id: number | null;
  name: string;
  icon: string | null;
  is_system: boolean;
  created_at: string;
}

export async function fetchCategories(): Promise<CategoryResponse[]> {
  const { data } = await apiClient.get<CategoryResponse[]>("/categories/");
  return data;
}
