import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { Platform, AppState } from "react-native";
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
import { isTransactionalSMS, fetchAndSyncSMS } from "@/lib/sms";
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

  // Catch-up SMS sync on app open/foregrounding with 5-minute interval guard
  const lastAttemptRef = useRef(0);
  const MIN_SYNC_INTERVAL_MS = 5 * 60 * 1000;

  useEffect(() => {
    const trySync = () => {
      const now = Date.now();
      if (now - lastAttemptRef.current < MIN_SYNC_INTERVAL_MS) return;
      lastAttemptRef.current = now;
      fetchAndSyncSMS()
        .then((res) => {
          if (res) {
            console.log("Background sync complete:", res);
          }
        })
        .catch((err) => console.warn("Background sync failed:", err));
    };

    trySync(); // Cold start sync

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        trySync();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

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
      <Stack.Screen name="categories" />
    </Stack>
  );
}
