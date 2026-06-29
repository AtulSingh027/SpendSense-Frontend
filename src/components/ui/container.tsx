import React from "react";
import { View, StyleSheet, StatusBar, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";

interface ContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  safe?: boolean;
}

export function Container({ children, style, safe = true }: ContainerProps) {
  if (safe) {
    return (
      <SafeAreaView style={[styles.container, style]}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        {children}
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
