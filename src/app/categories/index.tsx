import React, { useState, useEffect } from "react";
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
import { Colors, Rounded, Spacing, Typography } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { fetchCategories, type CategoryResponse } from "@/lib/category";
import { AppHeader } from "@/components/ui/app-header";

// Helper to parse icon and color from the icon string or category name fallback
export function parseCategoryIcon(iconStr: string | null, name: string): { iconName: any; color: string } {
  if (!iconStr) {
    switch (name.toLowerCase()) {
      case "food":
        return { iconName: "restaurant", color: "#ffd8b3" }; // Warm pastel orange
      case "travel":
        return { iconName: "flight", color: "#bbdefb" }; // Pastel blue
      case "shopping":
        return { iconName: "shopping-bag", color: "#f8bbd0" }; // Pastel pink
      case "bills":
        return { iconName: "payments", color: "#fff9c4" }; // Pastel yellow
      case "entertainment":
        return { iconName: "celebration", color: "#e1bee7" }; // Pastel purple
      default:
        return { iconName: "more-horiz", color: "#e5e2e1" }; // Neutral grey
    }
  }

  if (iconStr.includes("|")) {
    const [iconName, color] = iconStr.split("|");
    return { iconName, color: color || "#bbe8e4" };
  }

  return { iconName: iconStr, color: "#bbe8e4" };
}

export default function CategoriesIndexScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      Alert.alert("Error", "Failed to load categories. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when screen comes back into focus
  useFocusEffect(
    React.useCallback(() => {
      loadCategories();
    }, [])
  );

  const systemCategories = categories.filter((c) => c.is_system);
  const customCategories = categories.filter((c) => !c.is_system);

  return (
    <Container style={styles.container}>
      {/* App Logo Header */}
      <AppHeader />

      {/* Page Title Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/dashboard/settings")} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categories</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Default Categories Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Default Categories</Text>
              <View style={styles.systemBadge}>
                <Text style={styles.systemBadgeText}>System</Text>
              </View>
            </View>

            <View style={styles.card}>
              {systemCategories.map((cat, idx) => {
                const { iconName, color } = parseCategoryIcon(cat.icon, cat.name);
                return (
                  <View
                    key={cat.id}
                    style={[
                      styles.listItem,
                      idx < systemCategories.length - 1 && styles.borderBottom,
                    ]}
                  >
                    <View style={styles.listItemLeft}>
                      <View style={[styles.iconContainer, { backgroundColor: color }]}>
                        <MaterialIcons name={iconName} size={20} color={Colors.primary} />
                      </View>
                      <Text style={styles.categoryName}>{cat.name}</Text>
                    </View>
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Your Categories Section */}
            <View style={[styles.sectionHeader, { marginTop: Spacing.lg }]}>
              <Text style={styles.sectionTitle}>Your Categories</Text>
            </View>

            {customCategories.length === 0 ? (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.emptyStateCard}
                onPress={() => router.push("/categories/add-categories")}
              >
                <View style={styles.dashedCircle}>
                  <MaterialIcons name="add" size={24} color={Colors.primary} />
                </View>
                <Text style={styles.emptyText}>
                  No custom categories yet — tap below to create one.
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.card}>
                {customCategories.map((cat, idx) => {
                  const { iconName, color } = parseCategoryIcon(cat.icon, cat.name);
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      activeOpacity={0.7}
                      style={[
                        styles.listItem,
                        idx < customCategories.length - 1 && styles.borderBottom,
                      ]}
                      onPress={() => router.push(`/categories/${cat.id}`)}
                    >
                      <View style={styles.listItemLeft}>
                        <View style={[styles.iconContainer, { backgroundColor: color }]}>
                          <MaterialIcons name={iconName} size={20} color={Colors.primary} />
                        </View>
                        <Text style={styles.categoryName}>{cat.name}</Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={20} color={Colors.muted} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>

          {/* Prominent Bottom Add Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.bigAddBtn}
              onPress={() => router.push("/categories/add-categories")}
            >
              <MaterialIcons name="add" size={20} color={Colors.onPrimary} />
              <Text style={styles.bigAddBtnText}>Add Category</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    padding: Spacing.xs,
    marginRight: Spacing.xs,
    borderRadius: Rounded.full,
  },
  headerTitle: {
    ...Typography.headlineMd,
    color: Colors.primary,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Rounded.xl,
  },
  addBtnText: {
    ...Typography.button,
    color: Colors.onPrimary,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    ...Typography.headlineMd,
    fontSize: 16,
    color: Colors.onSurface,
  },
  systemBadge: {
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Rounded.sm,
  },
  systemBadgeText: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    fontSize: 10,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Rounded.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerLow,
  },
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: Rounded.full,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  categoryName: {
    ...Typography.bodyLg,
    fontFamily: "Inter_600SemiBold",
    color: Colors.onSurface,
  },
  defaultBadge: {
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Rounded.sm,
  },
  defaultBadgeText: {
    ...Typography.labelSm,
    color: Colors.muted,
    fontSize: 11,
  },
  emptyStateCard: {
    backgroundColor: Colors.surface,
    borderRadius: Rounded.lg,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: Colors.outlineVariant,
  },
  dashedCircle: {
    width: 48,
    height: 48,
    borderRadius: Rounded.full,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  emptyText: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 20,
  },
  footer: {
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerLow,
  },
  bigAddBtn: {
    flexDirection: "row",
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  bigAddBtnText: {
    ...Typography.button,
    color: Colors.onPrimary,
    fontSize: 16,
    marginLeft: Spacing.xs,
  },
});
