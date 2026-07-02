import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Colors, Spacing } from "@/constants/theme";
import { apiClient } from "@/lib/api";
import { saveToken } from "@/lib/auth";

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(auth)/welcome");
    }
  };

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert("Validation Error", "Please fill in all required fields.");
      return;
    }

    // Format phone number to start with +91 if user didn't write it
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone.replace(/\s+/g, "")}`;

    setIsLoading(true);
    try {
      const response = await apiClient.post("/auth/login", {
        phone_number: formattedPhone,
        password: password,
      });

      const { access_token } = response.data;
      if (access_token) {
        await saveToken(access_token);
        router.replace("/privacy-check");
      } else {
        throw new Error("No access token returned from server.");
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || error.message || "Invalid phone number or password.";
      Alert.alert("Sign In Failed", errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const phonePrefix = (
    <View style={styles.prefixWrapper}>
      <Text style={styles.flagEmoji}>🇮🇳</Text>
      <Text variant="bodyMd" color={Colors.onSurface} style={styles.countryCode}>
        +91
      </Text>
      <View style={styles.separator} />
    </View>
  );

  const passwordRightElement = (
    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
      <MaterialIcons
        name={showPassword ? "visibility" : "visibility-off"}
        size={22}
        color={Colors.outline}
      />
    </TouchableOpacity>
  );

  return (
    <Container safe>


      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Background ambient effect representation */}
        <View style={styles.ambientBackground} />

        <View style={styles.formWrapper}>
          {/* Brand Header Logo Block */}
          <View style={styles.brandContainer}>
            <Image
              source={require("@/assets/wordmark.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>


          {/* Title Section */}
          <View style={styles.titleContainer}>
            <Text variant="headlineLg" color={Colors.onSurface} style={[styles.title, { textAlign: "left" }]}>
              Welcome Back
            </Text>
            <Text
              variant="bodyMd"
              color={Colors.onSurfaceVariant}
              style={{ textAlign: "left" }}
            >
              Sign in to continue tracking your expenses automatically.
            </Text>
          </View>


          {/* Form */}
          <View style={styles.formContainer}>
            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text variant="labelSm" color={Colors.outline} style={[styles.inputLabel]}>
                Phone Number
              </Text>
              <Input
                iconName="call"
                placeholder="98765 43210"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                prefix={phonePrefix}
              />
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text variant="labelSm" color={Colors.outline} style={styles.inputLabel}>
                Password
              </Text>
              <Input
                iconName="lock"
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                rightElement={passwordRightElement}
              />
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPasswordContainer} activeOpacity={0.7}>
              <Text variant="labelSm" color={Colors.outline} style={styles.forgotPasswordText}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <Button
              title="Sign In"
              hasArrow
              loading={isLoading}
              onPress={handleLogin}
              style={styles.submitButton}
            />
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerTextContainer}>
              <Text variant="labelSm" color={Colors.outline} style={styles.dividerText}>
                OR
              </Text>
            </View>
          </View>

          {/* Google Sign In */}
          <TouchableOpacity style={styles.googleButton} activeOpacity={0.8}>
            <AntDesign name="google" size={18} color="#EA4335" style={styles.googleIcon} />
            <Text variant="button" color={Colors.onSurface} style={styles.googleButtonText}>
              Continue with Google
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text variant="bodyMd" color={Colors.onSurfaceVariant}>
              Don't have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text variant="bodyMd" color={Colors.primary} style={styles.signUpText}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
    zIndex: 50,
    shadowColor: "rgba(0, 0, 0, 0.05)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  backButton: {
    marginRight: Spacing.sm,
  },
  headerTitle: {
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xl,
  },
  ambientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: "rgba(0, 52, 43, 0.03)",
    borderBottomLeftRadius: 150,
    borderBottomRightRadius: 150,
    transform: [{ scaleX: 1.5 }],
  },
  formWrapper: {
    width: "100%",
    maxWidth: 400,
    paddingTop: Spacing.lg,
  },
  brandContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 200,
    height: 52,
  },
  titleContainer: {
    marginBottom: Spacing.xl,
    alignItems: "flex-start",
    width: "100%",
  },
    title: {
    fontWeight: "700",
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  formContainer: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 0.2,
    color: Colors.outline,
  },
  prefixWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  flagEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  countryCode: {
    fontWeight: "500",
    marginRight: Spacing.xs,
  },
  separator: {
    width: 1,
    height: 18,
    backgroundColor: "rgba(191, 201, 196, 0.5)",
    marginHorizontal: 4,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginTop: -Spacing.xs,
    marginBottom: Spacing.lg,
  },
  forgotPasswordText: {
    fontWeight: "500",
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.xl,
    width: "100%",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(191, 201, 196, 0.3)",
  },
  dividerTextContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  dividerText: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    fontWeight: "600",
    letterSpacing: 1,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(191, 201, 196, 0.5)",
    borderRadius: 12,
    height: 56,
    backgroundColor: "#ffffff",
    marginBottom: Spacing.xl,
    width: "100%",
  },
  googleIcon: {
    marginRight: Spacing.sm,
  },
  googleButtonText: {
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  signUpText: {
    fontWeight: "600",
  },
});
