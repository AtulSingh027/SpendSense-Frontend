import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";
import { Colors, Rounded, Spacing } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { fetchAndSyncSMS } from "@/lib/sms";
import {
  Alert,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

export default function SMSPermissionScreen() {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncStatus, setSyncStatus] = React.useState<string | null>(null);
  const [showRestrictedGuide, setShowRestrictedGuide] = React.useState(false);

  const handleBack = () => {
    // Go back to the privacy-check page
    router.replace("/privacy-check");
  };

  const handleAllowSMS = async () => {
    try {
      if (Platform.OS === "android") {
        setIsSyncing(true);
        setSyncStatus("Requesting permissions...");
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_SMS,
          PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
        ]);

        const readGranted =
          granted[PermissionsAndroid.PERMISSIONS.READ_SMS] ===
          PermissionsAndroid.RESULTS.GRANTED;
        const receiveGranted =
          granted[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] ===
          PermissionsAndroid.RESULTS.GRANTED;

        console.log("SMS Permission Status:", { readGranted, receiveGranted });

        if (readGranted) {
          setShowRestrictedGuide(false);
          setSyncStatus("Syncing transaction history...");
          try {
            // Trigger bulk ingest API and await the result to ensure it is uploaded immediately
            const res = await fetchAndSyncSMS(300);
            console.log("Initial SMS sync result:", res);
            setSyncStatus("Sync complete!");
            await new Promise((resolve) => setTimeout(resolve, 800));
            router.replace("/dashboard");
          } catch (syncErr) {
            console.error("Initial SMS sync failed:", syncErr);
            setSyncStatus("Sync failed. Navigating to dashboard...");
            await new Promise((resolve) => setTimeout(resolve, 1500));
            router.replace("/dashboard");
          }
        } else {
          setIsSyncing(false);
          setSyncStatus(null);
          setShowRestrictedGuide(true);
          Alert.alert(
            "SMS Permission Required",
            "To automatically track expenses, SpendSense requires permission to read SMS transaction alerts. If the option is greyed out, please enable Restricted Settings.",
            [{ text: "OK" }]
          );
        }
      } else {
        // Alert on non-Android and wait for user acknowledgment before navigating
        Alert.alert(
          "Not Supported",
          "SMS auto-import is only supported on Android devices.",
          [{ text: "OK", onPress: () => router.replace("/dashboard") }]
        );
      }
    } catch (err) {
      console.warn("Permission request error:", err);
      setIsSyncing(false);
      setSyncStatus(null);
      router.replace("/dashboard");
    }
  };

  const handleNotNow = () => {
    // Skip for now and go to dashboard
    router.replace("/dashboard");
  };

  if (isSyncing) {
    return (
      <Container safe>
        <View style={styles.syncContainer}>
          <ActivityIndicator size="large" color={Colors.primary} style={styles.syncSpinner} />
          <Text variant="headlineMd" color={Colors.onSurface} align="center" style={styles.syncTitle}>
            {syncStatus || "Syncing..."}
          </Text>
          <Text variant="bodyMd" color={Colors.onSurfaceVariant} align="center" style={styles.syncDescription}>
            We are analyzing your SMS inbox for bank transaction alerts and securely updating your transaction history. This only takes a moment.
          </Text>
        </View>
      </Container>
    );
  }

  return (
    <Container safe>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text variant="headlineMd" color={Colors.primary} style={styles.brandText}>
            SpendSense
          </Text>
        </View>

        {/* Content Box */}
        <View style={styles.content}>
          {/* Illustration with double circles */}
          <View style={styles.illustrationContainer}>
            <View style={styles.haloBg} />
            <View style={styles.cardCircle}>
              <View style={styles.smsIconContainer}>
                <MaterialIcons name="sms" size={80} color={Colors.primary} />
                {/* Overlaying Sync Badge */}
                <View style={styles.syncBadge}>
                  <MaterialIcons name="sync" size={22} color={Colors.onPrimary} />
                </View>
              </View>
            </View>
          </View>

          {/* Title & Description */}
          <View style={styles.textContainer}>
            <Text
              variant="headlineLg"
              color={Colors.onSurface}
              align="center"
              style={styles.title}
            >
              Almost There!
            </Text>
            <Text
              variant="bodyLg"
              color={Colors.onSurfaceVariant}
              align="center"
              style={styles.description}
            >
              When you tap "Allow", Android will ask for permission to read your SMS.
              This allows{" "}
              <Text style={styles.boldBrandText}>SpendSense</Text> to automatically
              import your bank transactions and save you from entering expenses manually.
            </Text>
          </View>

          {/* Privacy Trust Card */}
          <View style={styles.privacyCard}>
            <MaterialIcons name="verified-user" size={24} color={Colors.primary} />
            <View style={styles.cardContent}>
              <Text variant="labelSm" color={Colors.onSurfaceVariant} style={styles.cardHeader}>
                Privacy First
              </Text>
              <Text variant="bodyMd" color={Colors.onSurfaceVariant} style={styles.cardBody}>
                We only scan financial SMS. Personal messages are never read or stored.
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <Button
              title="Allow SMS Access"
              onPress={handleAllowSMS}
              style={styles.primaryBtn}
            />
            <TouchableOpacity
              onPress={handleNotNow}
              style={styles.secondaryBtn}
              activeOpacity={0.7}
            >
              <Text variant="button" color={Colors.onSurfaceVariant} align="center">
                Not Now
              </Text>
            </TouchableOpacity>
          </View>

          {showRestrictedGuide && (
            <View style={styles.restrictedCard}>
              <View style={styles.restrictedHeaderRow}>
                <MaterialIcons name="error-outline" size={20} color="#D93025" />
                <Text variant="labelSm" color="#D93025" style={styles.restrictedHeader}>
                  HOW TO ALLOW RESTRICTED SETTINGS
                </Text>
              </View>
              <Text variant="bodyMd" color={Colors.onSurfaceVariant} style={styles.restrictedBody}>
                If Android has disabled this setting for security (sideloaded app):
              </Text>
              <View style={styles.stepList}>
                <Text variant="bodyMd" color={Colors.onSurfaceVariant} style={styles.stepText}>
                  1. Long press the <Text style={styles.boldText}>SpendSense</Text> icon on your home screen and tap <Text style={styles.boldText}>App Info</Text> (or go to Settings &gt; Apps &gt; SpendSense).
                </Text>
                <Text variant="bodyMd" color={Colors.onSurfaceVariant} style={styles.stepText}>
                  2. Tap the <Text style={styles.boldText}>3-dot menu</Text> in the top-right corner.
                </Text>
                <Text variant="bodyMd" color={Colors.onSurfaceVariant} style={styles.stepText}>
                  3. Select <Text style={styles.boldText}>"Allow restricted settings"</Text> and verify your identity.
                </Text>
                <Text variant="bodyMd" color={Colors.onSurfaceVariant} style={styles.stepText}>
                  4. Tap <Text style={styles.boldText}>Permissions &gt; SMS</Text> and set it to <Text style={styles.boldText}>"Allow"</Text>.
                </Text>
                <Text variant="bodyMd" color={Colors.onSurfaceVariant} style={styles.stepText}>
                  5. Re-open SpendSense and tap Allow again.
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    padding: Spacing.xs,
    marginLeft: -Spacing.xs,
  },
  brandText: {
    fontFamily: "HankenGrotesk_700Bold",
    fontWeight: "700",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
  },
  illustrationContainer: {
    width: 240,
    height: 240,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
    position: "relative",
  },
  haloBg: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(0, 80, 67, 0.04)",
  },
  cardCircle: {
    width: 176,
    height: 176,
    borderRadius: 88,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: "rgba(191, 201, 196, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(0, 0, 0, 0.03)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  smsIconContainer: {
    position: "relative",
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
  },
  syncBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(0, 0, 0, 0.15)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xs,
  },
  title: {
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  description: {
    lineHeight: 24,
  },
  boldBrandText: {
    fontWeight: "600",
    color: Colors.primary,
  },
  privacyCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f6f3f2",
    borderRadius: Rounded.md,
    borderWidth: 1,
    borderColor: "rgba(191, 201, 196, 0.2)",
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    width: "100%",
    maxWidth: 420,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardBody: {
    lineHeight: 20,
  },
  actionContainer: {
    width: "100%",
    maxWidth: 420,
    gap: Spacing.sm,
  },
  primaryBtn: {
    height: 56,
  },
  secondaryBtn: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Rounded.lg,
  },
  syncContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.background,
  },
  syncSpinner: {
    marginBottom: Spacing.lg,
  },
  syncTitle: {
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  syncDescription: {
    lineHeight: 22,
    maxWidth: 320,
  },
  restrictedCard: {
    backgroundColor: "#FDF2F2",
    borderRadius: Rounded.md,
    borderWidth: 1,
    borderColor: "#F5C2C2",
    padding: Spacing.md,
    marginTop: Spacing.lg,
    width: "100%",
    maxWidth: 420,
  },
  restrictedHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  restrictedHeader: {
    fontWeight: "600",
    letterSpacing: 1.1,
  },
  restrictedBody: {
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  stepList: {
    gap: Spacing.xs,
  },
  stepText: {
    lineHeight: 20,
  },
  boldText: {
    fontWeight: "700",
  },
});
