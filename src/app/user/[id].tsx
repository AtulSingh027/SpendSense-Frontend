import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Colors, Rounded, Spacing } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { deleteToken } from "@/lib/auth";
import {
  fetchUserProfile,
  updateUserProfile,
  type userProfileResponse,
} from "@/lib/user";

export default function UserProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const userId = Number(id);

  // States
  const [profile, setProfile] = useState<userProfileResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states (for editing)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  // Fetch user profile on mount / userId change
  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const data = await fetchUserProfile(userId);
      setProfile(data);
      // Initialize form fields
      setFullName(data.full_name || "");
      setEmail(data.email || "");
      // Strip prefix if already starts with +91 for cleaner editing
      const num = data.phone_number || "";
      setPhoneNumber(num.startsWith("+91") ? num.replace("+91", "").trim() : num);
      setSelectedImageUri(data.image_url);
      setSelectedImageBase64(null);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      Alert.alert("Error", "Could not fetch user profile details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadUserProfile();
    }
  }, [userId]);

  const handleLogout = async () => {
    const doLogout = async () => {
      try {
        await deleteToken();
        router.replace("/(auth)/welcome");
      } catch (e) {
        console.error("Failed to logout:", e);
      }
    };

    if (Platform.OS === "web") {
      doLogout();
    } else {
      Alert.alert("Logout", "Are you sure you want to logout securely?", [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: doLogout },
      ]);
    }
  };

  // Image Selection Handler
  const handleSelectPhoto = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant media library access to change your profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedImageUri(asset.uri);
        if (asset.base64) {
          setSelectedImageBase64(`data:image/jpeg;base64,${asset.base64}`);
        }
      }
    } catch (err) {
      console.error("Failed to pick image:", err);
      Alert.alert("Error", "Failed to select image from gallery.");
    }
  };

  // Save changes handler
  const handleSaveChanges = async () => {
    if (!fullName.trim()) {
      Alert.alert("Validation Error", "Full Name cannot be empty.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Validation Error", "Please enter a valid email address.");
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert("Validation Error", "Phone number cannot be empty.");
      return;
    }

    try {
      setIsSaving(true);
      // Format phone number to include country code prefix if it doesn't already have one
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+91${phoneNumber.replace(/\s+/g, "")}`;

      const updateData: any = {
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone_number: formattedPhone,
      };

      if (selectedImageBase64) {
        updateData.image_url = selectedImageBase64;
      }

      const updated = await updateUserProfile(userId, updateData);
      setProfile(updated);
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully.");
      // Reload profile to ensure everything is in sync
      loadUserProfile();
    } catch (error) {
      console.error("Failed to update profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    return parts
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleBack = () => {
    if (isEditing) {
      // Revert edits
      if (profile) {
        setFullName(profile.full_name || "");
        setEmail(profile.email || "");
        const num = profile.phone_number || "";
        setPhoneNumber(num.startsWith("+91") ? num.replace("+91", "").trim() : num);
        setSelectedImageUri(profile.image_url);
        setSelectedImageBase64(null);
      }
      setIsEditing(false);
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <Container safe style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </Container>
    );
  }

  const initials = getInitials(profile?.full_name || "");

  const phonePrefix = (
    <View style={styles.phonePrefixContainer}>
      <Text style={styles.phoneFlag}>🇮🇳</Text>
      <Text style={styles.phoneCode}>+91</Text>
      <View style={styles.phoneDivider} />
    </View>
  );

  return (
    <Container safe style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text variant="headlineMd" color={Colors.onSurface} style={styles.headerTitle}>
          {isEditing ? "Edit Profile" : "Account Info"}
        </Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              activeOpacity={isEditing ? 0.8 : 1}
              onPress={isEditing ? handleSelectPhoto : undefined}
              style={styles.avatarContainer}
            >
              {selectedImageUri ? (
                <Image source={{ uri: selectedImageUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.initialsContainer}>
                  <Text style={styles.initialsText}>{initials}</Text>
                </View>
              )}

              {isEditing && (
                <View style={styles.editBadge}>
                  <MaterialIcons name="edit" size={16} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
            {isEditing && (
              <TouchableOpacity onPress={handleSelectPhoto} style={styles.changePhotoBtn}>
                <Text variant="bodyMd" color={Colors.primary} style={styles.changePhotoText}>
                  Tap to change photo
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Details Card */}
          <View style={styles.card}>
            {isEditing ? (
              // Edit Form
              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text variant="labelSm" color={Colors.onSurfaceVariant} style={styles.inputLabel}>
                    Full Name
                  </Text>
                  <Input
                    iconName="person"
                    placeholder="Enter full name"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text variant="labelSm" color={Colors.onSurfaceVariant} style={styles.inputLabel}>
                    Email ID
                  </Text>
                  <Input
                    iconName="email"
                    placeholder="Enter email ID"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text variant="labelSm" color={Colors.onSurfaceVariant} style={styles.inputLabel}>
                    Phone Number
                  </Text>
                  <Input
                    placeholder="98765 43210"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    prefix={phonePrefix}
                  />
                </View>
              </View>
            ) : (
              // View Info
              <View style={styles.infoContainer}>
                <Text variant="headlineLg" color={Colors.onSurface} style={styles.infoName}>
                  {profile?.full_name || "SpendSense User"}
                </Text>
                <Text variant="bodyMd" color={Colors.onSurfaceVariant} style={styles.infoText}>
                  {profile?.email || "No email provided"}
                </Text>

                <View style={styles.phoneVerifiedRow}>
                  <Text variant="bodyMd" color={Colors.onSurfaceVariant} style={styles.infoText}>
                    {profile?.phone_number || "No phone number"}
                  </Text>
                  <View style={styles.verifiedBadge}>
                    <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.editProfileBtn}
                  activeOpacity={0.7}
                  onPress={() => setIsEditing(true)}
                >
                  <Text variant="bodyLg" color={Colors.primary}>
                    Edit Profile
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Menu Items Card */}
          <View style={styles.menuCard}>
            <View style={[styles.menuItem, styles.menuItemDisabled]}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuItemIconContainer}>
                  <MaterialIcons name="lock" size={20} color={Colors.onSurfaceVariant} />
                </View>
                <Text variant="bodyLg" color={Colors.onSurfaceVariant}>
                  Change Password
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={Colors.outlineVariant} />
            </View>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => Alert.alert("Coming Soon", "Notification preferences will be available soon.")}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuItemIconContainer}>
                  <MaterialIcons name="notifications" size={20} color={Colors.primary} />
                </View>
                <Text variant="bodyLg" color={Colors.onSurface}>
                  Notification Preferences
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => Alert.alert("Coming Soon", "Bank accounts management will be available soon.")}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuItemIconContainer}>
                  <MaterialIcons name="account-balance" size={20} color={Colors.primary} />
                </View>
                <View>
                  <Text variant="bodyLg" color={Colors.onSurface}>
                    Linked Bank Accounts
                  </Text>
                  <Text variant="labelSm" color={Colors.outline} style={{ marginTop: 2 }}>
                    2 ACCOUNTS
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {isEditing ? (
              <Button
                title="Save Changes"
                loading={isSaving}
                onPress={handleSaveChanges}
                style={styles.saveBtn}
              />
            ) : null}

            <TouchableOpacity
              style={styles.logoutBtn}
              activeOpacity={0.7}
              onPress={handleLogout}
            >
              <MaterialIcons name="logout" size={20} color={Colors.error} style={{ marginRight: 8 }} />
              <Text variant="bodyLg" color={Colors.error}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>

          {/* Version Footer */}
          <View style={styles.footer}>
            <Text variant="bodyMd" color={Colors.outline} style={styles.versionText}>
              SpendSense version 1.0
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  headerBtn: {
    padding: 4,
  },
  headerTitle: {
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  headerRightPlaceholder: {
    width: 32,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    position: "relative",
    width: 110,
    height: 110,
    borderRadius: 55,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  initialsContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    fontSize: 36,
    fontWeight: "bold",
    color: Colors.onPrimaryContainer,
    fontFamily: "Inter_700Bold",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  changePhotoBtn: {
    marginTop: 8,
    paddingVertical: 4,
  },
  changePhotoText: {
    fontWeight: "600",
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Rounded.xl,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  infoContainer: {
    alignItems: "center",
  },
  infoName: {
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
    textAlign: "center",
  },
  infoText: {
    textAlign: "center",
    marginBottom: 4,
  },
  phoneVerifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  verifiedBadge: {
    marginLeft: 6,
  },
  editProfileBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: Rounded.lg,
    paddingVertical: 10,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  formContainer: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontWeight: "600",
    marginBottom: 6,
    marginLeft: 4,
  },
  phonePrefixContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  phoneFlag: {
    fontSize: 16,
    marginRight: 4,
  },
  phoneCode: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
    color: Colors.onSurface,
  },
  phoneDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.outline,
    marginHorizontal: 8,
  },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: Rounded.xl,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    paddingVertical: 8,
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemDisabled: {
    opacity: 0.6,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemIconContainer: {
    width: 36,
    height: 36,
    borderRadius: Rounded.lg,
    backgroundColor: Colors.secondaryContainer,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    marginHorizontal: 16,
  },
  actionsContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 32,
  },
  saveBtn: {
    marginBottom: 16,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    width: "100%",
  },
  footer: {
    alignItems: "center",
    marginTop: 8,
  },
  versionText: {
    fontWeight: "500",
  },
});