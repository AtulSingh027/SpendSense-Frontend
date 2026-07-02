import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Spacing } from "@/constants/theme";

export function LogoHeader() {
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/wordmark.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
  },
  logo: {
    width: 180,
    height: 48,
  },
});
