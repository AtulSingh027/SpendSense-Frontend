import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";
import { Colors, Spacing } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

export default function SettingsScreen() {
  return (
    <Container safe>
      <View style={styles.header}>
        <Text variant="headlineMd" color={Colors.primary} style={styles.brandTitle}>
          Settings
        </Text>
      </View>
      <View style={styles.content}>
        <MaterialIcons name="settings" size={48} color={Colors.outlineVariant} />
        <Text variant="headlineMd" color={Colors.onSurface} align="center">
          Coming Soon
        </Text>
        <Text variant="bodyMd" color={Colors.onSurfaceVariant} align="center">
          App settings and preferences will appear here.
        </Text>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  brandTitle: {
    fontFamily: "HankenGrotesk_700Bold",
    fontWeight: "700",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
});
