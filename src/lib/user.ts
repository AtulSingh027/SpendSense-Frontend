import { apiClient } from "./api";

export interface userProfileResponse {
  id: number;
  phone_number: string;
  full_name: string | null;
  email: string | null;
  image_url: string | null;
}

export interface updateProfileRequest {
  full_name?: string;
  email?: string;
  phone_number?: string;
  image_url?: string | null;
}

export async function fetchUserProfile(userId: number): Promise<userProfileResponse> {
  const { data } = await apiClient.get<userProfileResponse>(`/user/${userId}`);
  return data;
}

export async function updateUserProfile(userId: number, user: updateProfileRequest): Promise<userProfileResponse> {
  const { data } = await apiClient.put<userProfileResponse>(`/user/${userId}`, user);
  return data;
}
