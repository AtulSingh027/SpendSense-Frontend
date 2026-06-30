import React, { useState } from "react";
import { View, TextInput, StyleSheet, TextInputProps } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors, Spacing } from "@/constants/theme";

interface InputProps extends TextInputProps {
  iconName?: keyof typeof MaterialIcons.glyphMap;
  error?: boolean;
  prefix?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export function Input({
  iconName,
  error,
  style,
  onFocus,
  onBlur,
  prefix,
  rightElement,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {iconName && (
        <MaterialIcons
          name={iconName}
          size={20}
          color={isFocused ? Colors.primary : Colors.outline}
          style={[styles.icon, props.multiline && { top: 14 }]}
        />
      )}
      {prefix && (
        <View style={[styles.prefixContainer, iconName ? { left: 44 } : { left: 16 }]}>
          {prefix}
        </View>
      )}
      <TextInput
        style={[
          styles.input,
          iconName ? { paddingLeft: 44 } : { paddingLeft: Spacing.md },
          prefix ? (iconName ? { paddingLeft: 125 } : { paddingLeft: 95 }) : {},
          rightElement ? { paddingRight: 48 } : {},
          isFocused && styles.inputFocused,
          error && styles.inputError,
          props.multiline && { textAlignVertical: "top", paddingTop: 14 },
          style,
        ]}
        placeholderTextColor={Colors.outlineVariant}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
      {rightElement && (
        <View style={styles.rightElementContainer}>
          {rightElement}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    justifyContent: "center",
  },
  icon: {
    position: "absolute",
    left: 16,
    zIndex: 1,
  },
  input: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(191, 201, 196, 0.5)", // Colors.outline variant
    borderRadius: 12,
    paddingVertical: 14,
    paddingRight: 16,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.onSurface,
  },
  inputFocused: {
    borderColor: Colors.primary,
  },
  inputError: {
    borderColor: "red", // Or Colors.error if defined
  },
  prefixContainer: {
    position: "absolute",
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  rightElementContainer: {
    position: "absolute",
    right: 16,
    zIndex: 1,
    justifyContent: "center",
  },
});
