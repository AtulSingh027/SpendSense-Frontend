import React from "react";
import { Text as RNText, TextProps, TextStyle, StyleSheet, StyleProp } from "react-native";
import { Typography, Colors } from "@/constants/theme";

export type TypographyVariant =
  | "displayCurrency"
  | "displayCurrencyMobile"
  | "headlineLg"
  | "headlineMd"
  | "bodyLg"
  | "bodyMd"
  | "labelSm"
  | "button";

interface CustomTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: "auto" | "left" | "right" | "center" | "justify";
  children?: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

export function Text({
  variant = "bodyMd",
  color = Colors.onSurface,
  align = "left",
  style,
  children,
  ...props
}: CustomTextProps) {
  const variantStyle = styles[variant] || styles.bodyMd;

  return (
    <RNText
      style={[
        variantStyle,
        { color, textAlign: align },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  displayCurrency: Typography.displayCurrency as TextStyle,
  displayCurrencyMobile: Typography.displayCurrencyMobile as TextStyle,
  headlineLg: Typography.headlineLg as TextStyle,
  headlineMd: Typography.headlineMd as TextStyle,
  bodyLg: Typography.bodyLg as TextStyle,
  bodyMd: Typography.bodyMd as TextStyle,
  labelSm: Typography.labelSm as TextStyle,
  button: Typography.button as TextStyle,
});
