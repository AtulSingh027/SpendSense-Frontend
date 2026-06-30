import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";
import { Colors, Rounded, Spacing } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

const privacyPoints = [
  "Read only bank transaction SMS",
  "Detect UPI, card, and bank payments automatically",
  "Never read personal chats",
  "Your data is handled securely with 256-bit encryption",
];

export default function PrivacyCheckScreen() {
  const router = useRouter();

  const handleContinue = () => {
    router.replace("/sms-permission");
  };

  return (
    <Container safe>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <MaterialIcons name="arrow-back" size={22} color={Colors.primary} />
          </View>
          <Text variant="bodyMd" color={Colors.primary} style={styles.brandText}>
            SpendSense
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.illustrationHalo}>
            <View style={styles.phoneFrame}>
              <View style={styles.smsBubble}>
                <MaterialIcons name="sms" size={12} color={Colors.primary} />
                <View style={styles.smsLine} />
              </View>
              <View style={styles.shield}>
                <MaterialIcons name="lock" size={30} color={Colors.onPrimary} />
              </View>
            </View>
          </View>

          <View style={styles.titleBlock}>
            <Text
              variant="headlineMd"
              color={Colors.onSurface}
              align="center"
              style={styles.title}
            >
              Enable Automatic Expense Tracking
            </Text>
            <Text
              variant="bodyMd"
              color={Colors.onSurfaceVariant}
              align="center"
              style={styles.description}
            >
              SpendSense reads only your bank transaction SMS to automatically
              detect and categorize your expenses. We do not read personal
              conversations or messages from chat apps.
            </Text>
          </View>

          <View style={styles.privacyCard}>
            <Text variant="labelSm" color={Colors.outline} style={styles.cardTitle}>
              HOW WE HANDLE YOUR DATA
            </Text>

            <View style={styles.pointList}>
              {privacyPoints.map((point) => (
                <View key={point} style={styles.pointRow}>
                  <View style={styles.checkIcon}>
                    <MaterialIcons name="check" size={12} color={Colors.onPrimary} />
                  </View>
                  <Text variant="bodyMd" color={Colors.onSurface} style={styles.pointText}>
                    {point}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.footerNote}>
            <MaterialIcons name="verified-user" size={14} color={Colors.outlineVariant} />
            <Text variant="labelSm" color={Colors.outline} style={styles.footerText}>
              Privacy-first design architecture
            </Text>
          </View>
        </View>

        <Button title="Continue" onPress={handleContinue} style={styles.continueButton} />
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  headerIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
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
  illustrationHalo: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(0, 52, 43, 0.03)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  phoneFrame: {
    width: 86,
    height: 136,
    borderRadius: 16,
    backgroundColor: "#5fae78",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.35)",
    alignItems: "center",
    paddingTop: Spacing.sm,
    shadowColor: "#00342b",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 4,
  },
  smsBubble: {
    width: 66,
    height: 24,
    borderRadius: Rounded.sm,
    backgroundColor: Colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
  },
  smsLine: {
    flex: 1,
    height: 5,
    borderRadius: Rounded.full,
    backgroundColor: "rgba(0, 52, 43, 0.18)",
  },
  shield: {
    width: 56,
    height: 66,
    marginTop: Spacing.sm,
    borderRadius: Rounded.lg,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  title: {
    fontWeight: "700",
  },
  description: {
    paddingHorizontal: Spacing.xs,
  },
  privacyCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: Colors.surface,
    borderRadius: Rounded.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  cardTitle: {
    marginBottom: Spacing.md,
  },
  pointList: {
    gap: Spacing.sm,
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  checkIcon: {
    width: 18,
    height: 18,
    borderRadius: Rounded.full,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  pointText: {
    flex: 1,
  },
  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    marginTop: Spacing.lg,
  },
  footerText: {
    fontSize: 11,
  },
  continueButton: {
    marginTop: Spacing.md,
  },
});
