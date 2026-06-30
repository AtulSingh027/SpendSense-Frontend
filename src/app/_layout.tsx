import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";
import { useFonts } from "expo-font";
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
} from "@expo-google-fonts/hanken-grotesk";
import {
  Inter_400Regular,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import {
  JetBrainsMono_500Medium,
} from "@expo-google-fonts/jetbrains-mono";

import { startReadSMS, stopReadSMS } from "@maniac-tech/react-native-expo-read-sms";
import { isTransactionalSMS } from "@/lib/sms";
import { apiClient } from "@/lib/api";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    HankenGrotesk_400Regular,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    Inter_400Regular,
    Inter_600SemiBold,
    JetBrainsMono_500Medium,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Real-time SMS Listener for Android
  useEffect(() => {
    if (Platform.OS !== "android") return;

    try {
      startReadSMS((status: string, sms: string, error: string) => {
        if (status === "success" && sms) {
          try {
            const smsData = JSON.parse(sms);
            const sender = smsData.address || smsData.sender || "";
            const body = smsData.body || "";
            const timestamp = smsData.date ? new Date(smsData.date).toISOString() : new Date().toISOString();

            if (sender && body && isTransactionalSMS(sender, body)) {
              apiClient
                .post("/sms/ingest", {
                  sender_id: sender,
                  raw_text: body,
                  received_at: timestamp,
                })
                .then((res) => console.log("Real-time SMS synced successfully:", res.data))
                .catch((err) => console.error("Real-time SMS sync failed:", err));
            }
          } catch (e) {
            console.error("Error reading real-time SMS payload:", e);
          }
        }
      });
    } catch (e) {
      console.warn("Failed to initialize real-time SMS reader:", e);
    }

    return () => {
      try {
        stopReadSMS();
      } catch (e) {
        console.error("Failed to stop real-time SMS reader:", e);
      }
    };
  }, []);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)/welcome" />
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(auth)/register" />
      <Stack.Screen name="privacy-check" />
      <Stack.Screen name="sms-permission" />
      <Stack.Screen name="transaction" />
      <Stack.Screen name="dashboard" />
    </Stack>
  );
}
