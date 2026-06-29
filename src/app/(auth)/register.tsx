import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Colors, Spacing } from "@/constants/theme";
import { apiClient } from "@/lib/api";

export default function RegisterScreen() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(auth)/welcome");
    }
  };

  const handleRegister = async () => {
    const { full_name, phone_number, email, password, confirm_password } = formData;

    if (!full_name || !phone_number || !password || !confirm_password) {
      Alert.alert("Validation Error", "Please fill in all required fields.");
      return;
    }

    if (password !== confirm_password) {
      Alert.alert("Validation Error", "Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      // Endpoint specified by the user
      await apiClient.post("/auth/register", {
        phone_number,
        password,
        full_name,
        email,
      });

      Alert.alert("Success", "Account created successfully!");
      handleBack();
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || error.message || "An error occurred.";
      Alert.alert("Registration Failed", errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container safe>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text variant="headlineMd" color={Colors.primary} style={styles.headerTitle}>
          SpendSense
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Background ambient effect representation */}
        <View style={styles.ambientBackground} />

        <View style={styles.formWrapper}>
          {/* Title Section */}
          <View style={styles.titleContainer}>
            <Text variant="headlineLg" color={Colors.onSurface} style={styles.title}>
              Create your account
            </Text>
            <Text variant="bodyMd" color={Colors.onSurfaceVariant}>
              Join SpendSense to start tracking.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text variant="labelSm" color={Colors.outline} style={styles.inputLabel}>
                Full Name
              </Text>
              <Input
                iconName="person"
                placeholder="Enter your full name"
                value={formData.full_name}
                onChangeText={(text) => handleChange("full_name", text)}
              />
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text variant="labelSm" color={Colors.outline} style={styles.inputLabel}>
                  Phone Number
                </Text>
                <Text style={styles.requiredLabel}>REQUIRED</Text>
              </View>
              <Input
                iconName="call"
                placeholder="+91 00000 00000"
                keyboardType="phone-pad"
                value={formData.phone_number}
                onChangeText={(text) => handleChange("phone_number", text)}
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text variant="labelSm" color={Colors.outline} style={styles.inputLabel}>
                  Email
                </Text>
                <Text style={styles.optionalLabel}>Optional</Text>
              </View>
              <Input
                iconName="mail"
                placeholder="email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => handleChange("email", text)}
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
                secureTextEntry
                value={formData.password}
                onChangeText={(text) => handleChange("password", text)}
              />
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text variant="labelSm" color={Colors.outline} style={styles.inputLabel}>
                Confirm Password
              </Text>
              <Input
                iconName="lock-reset"
                placeholder="••••••••"
                secureTextEntry
                value={formData.confirm_password}
                onChangeText={(text) => handleChange("confirm_password", text)}
              />
            </View>

            {/* Submit Button */}
            <Button
              title="Create Account"
              hasArrow
              loading={isLoading}
              onPress={handleRegister}
              style={styles.submitButton}
            />
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerTextContainer}>
              <Text variant="labelSm" color={Colors.outline}>
                or continue with Google
              </Text>
            </View>
          </View>

          {/* Google Sign In */}
          <TouchableOpacity style={styles.googleButton}>
            <Text variant="button" color={Colors.onSurface}>
              Sign up with Google
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text variant="bodyMd" color={Colors.onSurfaceVariant}>
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={handleBack}>
              <Text variant="bodyMd" color={Colors.primary} style={styles.signInText}>
                Sign In
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
    bottom: 0,
    backgroundColor: "rgba(187, 232, 228, 0.4)", // secondary-container
    opacity: 0.1, // very subtle blur representation
  },
  formWrapper: {
    width: "100%",
    maxWidth: 420,
    zIndex: 10,
  },
  titleContainer: {
    marginBottom: Spacing.xl,
    alignItems: "center",
  },
  title: {
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  formContainer: {
    gap: Spacing.md,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputLabel: {
    paddingHorizontal: 4,
  },
  requiredLabel: {
    fontSize: 10,
    color: "#ba1a1a", // Colors.error
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  optionalLabel: {
    fontSize: 10,
    color: Colors.outline,
    fontStyle: "italic",
  },
  submitButton: {
    marginTop: Spacing.lg,
  },
  dividerContainer: {
    position: "relative",
    marginVertical: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  dividerLine: {
    position: "absolute",
    width: "100%",
    borderTopWidth: 1,
    borderColor: "rgba(191, 201, 196, 0.3)", // outline-variant/30
  },
  dividerTextContainer: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
  },
  googleButton: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(191, 201, 196, 0.5)",
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 1,
  },
  footer: {
    marginTop: Spacing.xl,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signInText: {
    fontWeight: "600",
  },
});