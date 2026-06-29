import React from "react";
import { View, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors, Spacing } from "@/constants/theme";
import { Text } from "../ui/text";

export function LogoHeader() {
  return (
    <View style={styles.container}>
      <MaterialIcons
        name="account-balance-wallet"
        size={30}
        color={Colors.primary}
      />
      <Text variant="headlineLg" color={Colors.primary} style={styles.brandName}>
        SpendSense
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.lg,
  },
  brandName: {
    fontWeight: "700",
    letterSpacing: -0.5,
  },
});
