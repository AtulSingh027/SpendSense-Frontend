import { apiClient } from "./api";

export interface CategoryResponse {
  id: number;
  user_id: number | null;
  name: string;
  icon: string | null;
  is_system: boolean;
  created_at: string;
}

export interface CreateCategoryRequest {
  user_id?: number;
  name: string;
  icon?: string;
}

export async function fetchCategories(): Promise<CategoryResponse[]> {
  const { data } = await apiClient.get<CategoryResponse[]>("/categories/");
  return data;
}

export async function createCategory(category: CreateCategoryRequest): Promise<CategoryResponse> {
  const { data } = await apiClient.post<CategoryResponse>("/categories/create", category);
  return data;
}

export async function updateCategory(id: number, category: Partial<CreateCategoryRequest>): Promise<CategoryResponse> {
  const { data } = await apiClient.put<CategoryResponse>(`/categories/${id}`, category);
  return data;
}

export async function deleteCategory(id: number): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.delete<{ success: boolean; message: string }>(`/categories/${id}`);
  return data;
}

export async function fetchCategoryById(id: number): Promise<CategoryResponse> {
  const { data } = await apiClient.get<CategoryResponse>(`/categories/${id}`);
  return data;
}

