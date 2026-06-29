import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";
import { Colors, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

export default function DashboardScreen() {
  return (
    <Container safe>
      <View style={styles.content}>
        <Text variant="headlineLg" color={Colors.onSurface} align="center">
          Dashboard
        </Text>
        <Text variant="bodyMd" color={Colors.onSurfaceVariant} align="center">
          Your dashboard will be added here.
        </Text>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
});
