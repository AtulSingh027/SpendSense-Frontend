import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "./text";
import { Colors } from "@/constants/theme";

export function AppHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.avatarPlaceholder}>
        <MaterialIcons name="person" size={20} color={Colors.onPrimary} />
      </View>
      <Text variant="headlineMd" color={Colors.primary} style={styles.brandTitle}>
        SpendSense
      </Text>
      <MaterialIcons name="notifications-none" size={24} color={Colors.onSurfaceVariant} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  brandTitle: {
    flex: 1,
    textAlign: "center",
  },
});
