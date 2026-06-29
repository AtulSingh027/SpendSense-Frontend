import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Image, ScrollView, Alert, Animated } from "react-native";
import { useRouter } from "expo-router";
import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { LogoHeader } from "@/components/welcome/logo-header";
import { Colors, Spacing } from "@/constants/theme";

export default function WelcomeScreen() {
  const router = useRouter();
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 6,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);

  const handleGetStarted = () => {
    router.push("/register");
  };

  const handleSignIn = () => {
    router.push("/login");
  };

  return (
    <Container safe>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Section - Header Brand */}
        <LogoHeader />

        {/* Center Section - Rounded Illustration Card with Floating Animation */}
        <Animated.View style={[
          styles.illustrationCardContainer,
          { transform: [{ translateY: floatAnim }] }
        ]}>
          <View style={styles.illustrationCard}>
            <Image
              source={require("@/assets/images/welcome-illustration.png")}
              style={styles.illustrationImage}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Info Section - Welcome Headings */}
        <View style={styles.infoContainer}>
          <Text variant="headlineLg" color={Colors.onSurface} align="center" style={styles.title}>
            Welcome to SpendSense
          </Text>
          <Text variant="bodyLg" color={Colors.onSurfaceVariant} align="center" style={styles.description}>
            Track your expenses automatically from your bank transaction SMS and gain better control over your spending.
          </Text>
        </View>

        {/* Action Buttons Section */}
        <View style={styles.actionsContainer}>
          <Button 
            title="Get Started" 
            hasArrow 
            variant="filled" 
            onPress={handleGetStarted}
            style={styles.getStartedButton}
          />
          <Button 
            title="Sign In" 
            variant="text" 
            onPress={handleSignIn}
            style={styles.signInButton}
          />
        </View>

        {/* Footer Trust Badges */}
        <View style={styles.footerContainer}>
          <Text variant="labelSm" color={Colors.outline} align="center" style={styles.footerText}>
            Secure • Private • Encrypted
          </Text>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    justifyContent: "space-between",
    alignItems: "center",
  },
  illustrationCardContainer: {
    marginVertical: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  illustrationCard: {
    backgroundColor: "#ffffff",
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    width: 280,
    height: 280,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    overflow: "hidden",
    // Soft subtle shadow matching tailwind aspect shadow
    shadowColor: "rgba(0, 0, 0, 0.03)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  illustrationImage: {
    width: "100%",
    height: "100%",
  },
  infoContainer: {
    alignItems: "center",
    width: "100%",
    marginBottom: Spacing.xxl,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.md,
  },
  title: {
    // Styling handled by variant
  },
  description: {
    // Styling handled by variant
  },
  actionsContainer: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.md,
  },
  getStartedButton: {
    width: "100%",
  },
  signInButton: {
    width: "100%",
  },
  footerContainer: {
    marginTop: Spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
});
