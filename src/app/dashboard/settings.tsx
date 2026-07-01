import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Colors, Spacing, Rounded } from "@/constants/theme";
import { deleteToken } from "@/lib/auth";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, View, Alert } from "react-native";

export default function SettingsScreen() {
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteToken();
              router.replace("/(auth)/welcome");
            } catch (e) {
              console.error("Failed to sign out:", e);
            }
          },
        },
      ]
    );
  };

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
          Settings
        </Text>
        <Text variant="bodyMd" color={Colors.onSurfaceVariant} align="center" style={styles.description}>
          App settings and preferences.
        </Text>
        
        <View style={styles.actionContainer}>
          <Button
            title="Sign Out"
            variant="filled"
            onPress={handleSignOut}
            style={styles.signOutBtn}
          />
        </View>
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
  description: {
    marginBottom: Spacing.lg,
  },
  actionContainer: {
    width: "100%",
    maxWidth: 320,
  },
  signOutBtn: {
    backgroundColor: "#D93025",
  },
});
