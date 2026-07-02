import { AppHeader } from "@/components/ui/app-header";
import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";
import { Colors, Rounded, Spacing } from "@/constants/theme";
import { deleteToken, getCurrentUserId } from "@/lib/auth";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {fetchAndSyncSMS} from '@/lib/sms'

import {
  StyleSheet,
  View,
  Alert,
  ScrollView,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
} from "react-native";

type SettingsMenuItem = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
};

export default function SettingsScreen() {
  const router = useRouter();
  const [smsGranted, setSmsGranted] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    checkSmsPermission();
    getCurrentUserId().then((id) => {
      if (id) setUserId(id);
    });
  }, []);

  const checkSmsPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_SMS
        );
        setSmsGranted(granted);
      } catch {
        setSmsGranted(false);
      }
    }
  };

  const doLogout = async () => {
    try {
      await deleteToken();
      router.replace("/(auth)/welcome");
    } catch (e) {
      console.error("Failed to logout:", e);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === "web") {
      // Alert.alert is not supported on web
      doLogout();
    } else {
      Alert.alert(
        "Logout",
        "Are you sure you want to logout securely?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Logout", style: "destructive", onPress: doLogout },
        ]
      );
    }
  };

  // Handel Sync Status for Inest/bulk api
  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const result = await fetchAndSyncSMS(500); // larger batch for manual
      if (result === null) {
        Alert.alert("Not Supported", "SMS sync is only supported on Android devices.");
        return;
      }
      Alert.alert("Sync Complete", 
        `${result.parsed_count} new transactions found, ${result.duplicate_count} duplicates skipped.`
      );
    } catch (err) {
      Alert.alert("Sync Failed", "Please try again later.");
    } finally {
      setSyncing(false);
    }
  };


  const handleComingSoon = (feature: string) => {
    Alert.alert("Coming Soon", `${feature} will be available in a future update.`);
  };

  const menuItems: SettingsMenuItem[] = [
    {
      icon: "category",
      title: "Category Management",
      subtitle: "Add, edit, or delete tracking categories",
      onPress: () => router.push("/categories"),
    },
    {
      icon: "manage-accounts",
      title: "Account Info",
      subtitle: "Personal details and security settings",
      onPress: () => {
        if (userId) {
          router.push(`/user/${userId}`);
        } else {
          getCurrentUserId().then((id) => {
            if (id) {
              router.push(`/user/${id}`);
            } else {
              Alert.alert("Error", "Unable to fetch user profile ID.");
            }
          });
        }
      },
    },
    {
      icon: "support-agent",
      title: "Help & Support",
      subtitle: "FAQs, tutorials, and contact",
      onPress: () => handleComingSoon("Help & Support"),
    },
  ];

  return (
    <Container safe>
      {/* Consistent header */}
      <AppHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Page title & sync status */}
        <View style={styles.titleSection}>
          <Text variant="headlineLg" color={Colors.onSurface} style={styles.pageTitle}>
            Settings
          </Text>
        </View>

        <View style={styles.syncSection}>
          <Text style={styles.syncLabel}>Sync Status</Text>
          <TouchableOpacity
            style={styles.syncButton}
            onPress={handleManualSync}
            disabled={syncing}
          >
            <Text style={styles.syncButtonText}>
              {syncing ? "Syncing..." : "Sync SMS"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* SMS Permission Card */}
        <View style={styles.smsCard}>

          <View style={styles.smsCardContent}>
            <View style={styles.smsCardLeft}>
              <View
                style={[
                  styles.smsIconCircle,
                  {
                    backgroundColor: smsGranted
                      ? Colors.secondaryContainer
                      : Colors.errorContainer,
                  },
                ]}
              >
                <MaterialIcons
                  name={smsGranted ? "check-circle" : "sms-failed"}
                  size={24}
                  color={
                    smsGranted
                      ? Colors.onSecondaryContainer
                      : Colors.error
                  }
                />
              </View>

              <View style={styles.smsTextContainer}>
                <Text
                  variant="headlineMd"
                  color={Colors.onSurface}
                  style={styles.smsTitle}
                >
                  {smsGranted ? "SMS Access Granted" : "SMS Access Required"}
                </Text>
                <Text
                  variant="bodyMd"
                  color={Colors.onSurfaceVariant}
                  style={styles.smsDescription}
                >
                  {smsGranted
                    ? "SpendSense is actively auto-capturing your financial transactions from SMS to keep your ledger up to date seamlessly."
                    : "Grant SMS permission so SpendSense can automatically capture your bank transaction alerts."}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                smsGranted
                  ? handleComingSoon("Manage Access")
                  : router.push("/sms-permission")
              }
              style={styles.manageAccessBtn}
            >
              <Text variant="button" color={Colors.onSurface}>
                {smsGranted ? "Manage Access" : "Grant Access"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              onPress={item.onPress}
              style={styles.menuItem}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <MaterialIcons
                    name={item.icon}
                    size={22}
                    color={Colors.onSurfaceVariant}
                  />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text variant="bodyLg" color={Colors.onSurface} style={styles.menuTitle}>
                    {item.title}
                  </Text>
                  <Text variant="labelSm" color={Colors.onSurfaceVariant}>
                    {item.subtitle}
                  </Text>
                </View>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={22}
                color={Colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            <MaterialIcons name="logout" size={18} color={Colors.onError} />
            <Text variant="button" color={Colors.onError}>
              Logout securely
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl + Spacing.xxl,
  },

  /* ── Title Section ── */
  titleSection: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  pageTitle: {
    fontWeight: "700",
  },
  syncRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },

  /* ── Sync Section ── */
  syncSection: {
    marginBottom: Spacing.lg,
  },
  syncLabel: {
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  syncButton: {
    backgroundColor: Colors.primary,
    borderRadius: Rounded.lg,
    paddingVertical: Spacing.sm,
    alignItems: "center",
  },
  syncButtonText: {
    color: Colors.onPrimary,
    fontWeight: "700",
  },

  /* ── SMS Permission Card ── */
  smsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Rounded.xl,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  smsCardContent: {
    gap: Spacing.md,
  },
  smsCardLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  smsIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  smsTextContainer: {
    flex: 1,
  },
  smsTitle: {
    fontWeight: "700",
    marginBottom: 4,
  },
  smsDescription: {
    lineHeight: 20,
  },
  manageAccessBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Rounded.lg,
    borderWidth: 1,
    borderColor: Colors.outline,
  },

  /* ── Menu Items ── */
  menuSection: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  menuItem: {
    backgroundColor: Colors.surface,
    borderRadius: Rounded.xl,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: Rounded.lg,
    backgroundColor: Colors.surfaceContainer,
    justifyContent: "center",
    alignItems: "center",
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontWeight: "600",
    marginBottom: 2,
  },

  /* ── Logout Section ── */
  logoutSection: {
    alignItems: "center",
    marginTop: Spacing.md,
  },
  logoutButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.error,
    borderRadius: Rounded.lg,
    paddingVertical: Spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
