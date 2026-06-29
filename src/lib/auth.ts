import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "spendsense_auth_token";

export async function saveToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.warn("Failed to save token to localStorage", e);
    }
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (e) {
      console.warn("Failed to get token from localStorage", e);
      return null;
    }
  } else {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  }
}

export async function deleteToken(): Promise<void> {
  if (Platform.OS === "web") {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.warn("Failed to delete token from localStorage", e);
    }
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}
