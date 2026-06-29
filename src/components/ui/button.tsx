import React from "react";
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import { Colors, Rounded, Spacing } from "@/constants/theme";
import { Text } from "./text";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "filled" | "text";
  loading?: boolean;
  hasArrow?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  variant = "filled",
  loading = false,
  hasArrow = false,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const isFilled = variant === "filled";
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        isFilled ? styles.filledContainer : styles.textContainer,
        isDisabled && isFilled && styles.disabledContainer,
        style,
      ]}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={isFilled ? Colors.onPrimary : Colors.primaryContainer} />
      ) : (
        <Text
          variant="button"
          color={isFilled ? Colors.onPrimary : Colors.primary}
          align="center"
          style={styles.buttonText}
        >
          {title}
          {hasArrow && "  →"}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  filledContainer: {
    backgroundColor: Colors.primary,
    borderRadius: Rounded.lg,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 56,
  },
  textContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 48,
    borderRadius: Rounded.lg,
  },
  disabledContainer: {
    backgroundColor: Colors.outline,
  },
  buttonText: {
    fontWeight: "600",
  },
});
