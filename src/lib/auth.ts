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

export async function getCurrentUserId(): Promise<number | null> {
  try {
    const token = await getToken();
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn("Token is not in JWT format");
      return null;
    }
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add base64 padding
    let paddedBase64 = base64;
    while (paddedBase64.length % 4) {
      paddedBase64 += '=';
    }

    // Safe base64 decoding
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = paddedBase64.replace(/=+$/, '');
    let binaryString = '';
    for (let bc = 0, bs = 0, buffer, i = 0; buffer = str.charAt(i++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? binaryString += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
      buffer = chars.indexOf(buffer);
    }

    // Convert binary string to UTF-8
    const percentEncoded = binaryString.split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join('');
    
    const utf8String = decodeURIComponent(percentEncoded);
    const payload = JSON.parse(utf8String);
    return payload.user_id ? Number(payload.user_id) : null;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}

