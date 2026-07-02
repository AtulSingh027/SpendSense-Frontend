import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { AppHeader } from "@/components/ui/app-header";
import { Colors, Rounded, Spacing, Typography } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { createCategory } from "@/lib/category";

const ICONS = [
  "shopping-bag",
  "local-cafe",
  "directions-bus",
  "home",
  "medical-services",
  "redeem",
  "restaurant",
  "payments",
  "fitness-center",
  "flight",
  "menu-book",
  "school",
  "work",
  "pets",
  "spa",
  "directions-car",
  "movie",
  "phone-iphone",
];

const COLORS = [
  "#ffdad6", // Soft Pastel Red/Pink
  "#fff9c4", // Soft Pastel Yellow
  "#bbdefb", // Soft Pastel Blue
  "#e1bee7", // Soft Pastel Purple
  "#b2dfdb", // Soft Teal/Mint
  "#f8bbd0", // Soft Pink
  "#ffe0b2", // Soft Orange
  "#d1c4e9", // Lavender
];

export default function AddCategoryScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("shopping-bag");
  const [selectedColor, setSelectedColor] = useState("#b2dfdb");
  const [isLoading, setIsLoading] = useState(false);
  const [showAllIcons, setShowAllIcons] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Required", "Category name is required.");
      return;
    }

    try {
      setIsLoading(true);
      // Combine icon and color as 'icon_name|color_hex'
      const iconPayload = `${selectedIcon}|${selectedColor}`;
      await createCategory({
        name: name.trim(),
        icon: iconPayload,
      });

      Alert.alert("Success", "Category created successfully!", [
        { text: "OK", onPress: () => router.replace("/categories") },
      ]);
    } catch (err: any) {
      console.error("Failed to create category:", err);
      const msg = err.response?.data?.detail || "Failed to create category. Please check if the name is unique.";
      Alert.alert("Error", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/categories");
    }
  };

  const visibleIcons = showAllIcons ? ICONS : ICONS.slice(0, 12);

  return (
    <Container style={styles.container}>
      {/* App Logo Header */}
      <AppHeader />

      {/* Page Title Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Category</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Preview Card */}
        <View style={styles.previewCard}>
          <View style={[styles.previewIconCircle, { backgroundColor: selectedColor }]}>
            <MaterialIcons name={selectedIcon as any} size={32} color={Colors.primary} />
          </View>
          <Text style={styles.previewName}>{name.trim() || "Preview"}</Text>
          <Text style={styles.previewSubtitle}>PREVIEW</Text>
        </View>

        {/* Input Name */}
        <Text style={styles.label}>CATEGORY NAME</Text>
        <View style={styles.inputWrapper}>
          <Input
            iconName="label-outline"
            placeholder="e.g. Subscriptions"
            value={name}
            onChangeText={setName}
            maxLength={30}
          />
        </View>

        {/* Choose Icon */}
        <View style={styles.sectionHeader}>
          <Text style={styles.label}>CHOOSE AN ICON</Text>
          <TouchableOpacity onPress={() => setShowAllIcons(!showAllIcons)}>
            <Text style={styles.viewAllText}>{showAllIcons ? "Collapse" : "View All"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.iconGrid}>
          {visibleIcons.map((icon) => {
            const isSelected = selectedIcon === icon;
            return (
              <TouchableOpacity
                key={icon}
                activeOpacity={0.7}
                style={[
                  styles.iconOption,
                  isSelected && styles.iconOptionSelected,
                ]}
                onPress={() => setSelectedIcon(icon)}
              >
                <MaterialIcons
                  name={icon as any}
                  size={24}
                  color={isSelected ? Colors.onPrimary : Colors.primary}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Choose Color */}
        <Text style={[styles.label, { marginTop: Spacing.lg }]}>CHOOSE A COLOR</Text>
        <View style={styles.colorRow}>
          {COLORS.map((color) => {
            const isSelected = selectedColor === color;
            return (
              <TouchableOpacity
                key={color}
                activeOpacity={0.7}
                style={[styles.colorOption, { backgroundColor: color }]}
                onPress={() => setSelectedColor(color)}
              >
                {isSelected && (
                  <MaterialIcons name="check" size={16} color={Colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.saveBtn}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.onPrimary} />
          ) : (
            <>
              <MaterialIcons name="save" size={18} color={Colors.onPrimary} />
              <Text style={styles.saveBtnText}>Save Category</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerLow,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitle: {
    ...Typography.headlineMd,
    color: Colors.primary,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl * 3,
  },
  previewCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Rounded.lg,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  previewIconCircle: {
    width: 64,
    height: 64,
    borderRadius: Rounded.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  previewName: {
    ...Typography.headlineMd,
    color: Colors.primary,
    fontSize: 18,
    marginBottom: 2,
  },
  previewSubtitle: {
    ...Typography.labelSm,
    color: Colors.muted,
    fontSize: 10,
    letterSpacing: 1,
  },
  label: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  viewAllText: {
    ...Typography.labelSm,
    color: Colors.primary,
    fontSize: 11,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginHorizontal: -4,
  },
  iconOption: {
    width: "15%",
    aspectRatio: 1,
    margin: "0.8%",
    borderRadius: Rounded.default,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  iconOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginHorizontal: -4,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: Rounded.full,
    margin: 6,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerLow,
  },
  saveBtn: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  saveBtnText: {
    ...Typography.button,
    color: Colors.onPrimary,
    marginLeft: Spacing.xs,
  },
});