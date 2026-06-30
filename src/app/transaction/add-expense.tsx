import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Colors, Rounded, Spacing, Typography } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { fetchCategories, type CategoryResponse } from "@/lib/category";
import { createTransaction } from "@/lib/transaction";

// Helper to format date & time as YYYY-MM-DD HH:MM
function getCurrentDateTimeString(): string {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

const CATEGORY_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  food: "local-dining",
  dining: "local-dining",
  travel: "directions-car",
  commute: "directions-car",
  shopping: "shopping-bag",
  bills: "receipt",
  other: "category",
};

function getCategoryIconName(name: string): keyof typeof MaterialIcons.glyphMap {
  const normalized = name.toLowerCase();
  for (const key of Object.keys(CATEGORY_ICONS)) {
    if (normalized.includes(key)) {
      return CATEGORY_ICONS[key];
    }
  }
  return "category";
}

const UPI_APPS = [
  { name: "PhonePe", color: "#5f259f", icon: "account-balance-wallet" as const },
  { name: "GPay", color: "#1a73e8", icon: "payments" as const },
  { name: "Paytm", color: "#00baf2", icon: "qr-code-2" as const },
  { name: "Other", color: "#3f4945", icon: "more-horiz" as const },
];

export default function AddExpenseScreen() {
  const router = useRouter();
  
  // Form State
  const [amount, setAmount] = useState("");
  const [categoriesList, setCategoriesList] = useState<CategoryResponse[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null);
  const [paymentSource, setPaymentSource] = useState<"manual" | "upi">("upi");
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>("PhonePe");
  const [dateTime, setDateTime] = useState(getCurrentDateTimeString());
  const [merchant, setMerchant] = useState("");
  const [notes, setNotes] = useState("");
  
  // Loading & Action State
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load Categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchCategories();
        setCategoriesList(data);
        if (data.length > 0) {
          // Pre-select Food & Dining or Food if available
          const foodCat = data.find(c => c.name.toLowerCase().includes("food"));
          setSelectedCategory(foodCat || data[0]);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  const handleSave = async () => {
    // Validate Amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount greater than 0.");
      return;
    }

    // Validate Category
    if (!selectedCategory) {
      Alert.alert("Category Required", "Please select a category.");
      return;
    }

    // Validate Date & Time Format (YYYY-MM-DD HH:MM)
    const dtRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
    if (!dtRegex.test(dateTime.trim())) {
      Alert.alert("Invalid Date & Time", "Please use the format YYYY-MM-DD HH:MM.");
      return;
    }

    setSaving(true);

    try {
      // Parse YYYY-MM-DD HH:MM to ISO
      const [datePart, timePart] = dateTime.trim().split(" ");
      const localIso = `${datePart}T${timePart}:00`;
      
      const payload = {
        amount: parsedAmount,
        txn_type: "debit" as const,
        merchant_raw: merchant.trim() || undefined,
        category_id: selectedCategory.id,
        upi_app: paymentSource === "upi" ? selectedUpiApp : null,
        source: paymentSource === "upi" ? ("sms" as const) : ("manual" as const),
        txn_timestamp: new Date(localIso).toISOString(),
        notes: notes.trim() || undefined,
      };

      await createTransaction(payload);
      router.replace("/dashboard/transactions");
    } catch (err: any) {
      console.error("Save expense error:", err);
      const errMsg = err?.response?.data?.detail || "Something went wrong. Please try again.";
      Alert.alert("Error", errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container safe style={styles.container}>
      {/* TopAppBar */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>
        <Text variant="headlineMd" style={styles.headerTitle}>
          Add Expense
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Main Content ScrollView */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Large Amount Input */}
        <View style={styles.amountSection}>
          <Text variant="labelSm" color={Colors.onSurfaceVariant} style={styles.sectionLabel}>
            AMOUNT
          </Text>
          <View style={styles.amountInputRow}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={Colors.surfaceVariant}
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Category Picker */}
          <View style={styles.formGroup}>
            <Text variant="labelSm" color={Colors.onSurfaceVariant} style={styles.formLabel}>
              CATEGORY
            </Text>
            {loadingCategories ? (
              <ActivityIndicator size="small" color={Colors.primary} style={{ alignSelf: "flex-start", marginTop: 8 }} />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {categoriesList.map((cat) => {
                  const isSelected = selectedCategory?.id === cat.id;
                  const iconName = getCategoryIconName(cat.name);
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      activeOpacity={0.8}
                      onPress={() => setSelectedCategory(cat)}
                      style={[
                        styles.chip,
                        isSelected ? styles.chipActive : styles.chipInactive,
                      ]}
                    >
                      <MaterialIcons
                        name={iconName}
                        size={18}
                        color={isSelected ? Colors.onSecondaryContainer : Colors.onSurfaceVariant}
                      />
                      <Text
                        variant="button"
                        color={isSelected ? Colors.onSecondaryContainer : Colors.onSurfaceVariant}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* Payment Source Picker */}
          <View style={styles.formGroup}>
            <Text variant="labelSm" color={Colors.onSurfaceVariant} style={styles.formLabel}>
              PAYMENT SOURCE
            </Text>
            <View style={styles.toggleRowContainer}>
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setPaymentSource("manual")}
                  style={[
                    styles.toggleBtn,
                    paymentSource === "manual" && styles.toggleBtnActive,
                  ]}
                >
                  <Text
                    variant="button"
                    color={paymentSource === "manual" ? Colors.onPrimary : Colors.onSurfaceVariant}
                  >
                    Manual
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setPaymentSource("upi")}
                  style={[
                    styles.toggleBtn,
                    paymentSource === "upi" && styles.toggleBtnActive,
                  ]}
                >
                  <Text
                    variant="button"
                    color={paymentSource === "upi" ? Colors.onPrimary : Colors.onSurfaceVariant}
                  >
                    UPI
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* UPI Apps Row if source is UPI */}
            {paymentSource === "upi" && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.horizontalScroll, { marginTop: 12 }]}
              >
                {UPI_APPS.map((app) => {
                  const isSelected = selectedUpiApp === app.name;
                  const borderCol = isSelected ? app.color : Colors.outlineVariant;
                  const bgCol = isSelected ? `${app.color}15` : "transparent";
                  return (
                    <TouchableOpacity
                      key={app.name}
                      activeOpacity={0.8}
                      onPress={() => setSelectedUpiApp(app.name)}
                      style={[
                        styles.appChip,
                        { borderColor: borderCol, backgroundColor: bgCol }
                      ]}
                    >
                      <MaterialIcons
                        name={app.icon}
                        size={18}
                        color={isSelected ? app.color : Colors.onSurfaceVariant}
                      />
                      <Text
                        variant="button"
                        style={{ color: isSelected ? app.color : Colors.onSurfaceVariant }}
                      >
                        {app.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* Date & Time Picker Input */}
          <View style={styles.formGroup}>
            <Text variant="labelSm" color={Colors.onSurfaceVariant} style={styles.formLabel}>
              DATE & TIME
            </Text>
            <Input
              iconName="calendar-today"
              value={dateTime}
              onChangeText={setDateTime}
              placeholder="YYYY-MM-DD HH:MM"
            />
          </View>

          {/* Merchant Name Input */}
          <View style={styles.formGroup}>
            <Text variant="labelSm" color={Colors.onSurfaceVariant} style={styles.formLabel}>
              MERCHANT / PAYEE
            </Text>
            <Input
              iconName="storefront"
              placeholder="E.g., Starbucks, Amazon"
              value={merchant}
              onChangeText={setMerchant}
            />
          </View>

          {/* Optional Note */}
          <View style={[styles.formGroup, { marginBottom: 0 }]}>
            <Text variant="labelSm" color={Colors.onSurfaceVariant} style={styles.formLabel}>
              NOTE (OPTIONAL)
            </Text>
            <Input
              iconName="notes"
              placeholder="Add details..."
              multiline
              numberOfLines={2}
              style={styles.notesTextarea}
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        </View>
      </ScrollView>

      {/* Save Button (Fixed Bottom) */}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        >
          {saving ? (
            <ActivityIndicator size="small" color={Colors.onPrimary} />
          ) : (
            <>
              <MaterialIcons name="check" size={20} color={Colors.onPrimary} />
              <Text variant="button" color={Colors.onPrimary} style={styles.saveButtonText}>
                Save Expense
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceVariant + "40",
    backgroundColor: Colors.surface,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontFamily: "HankenGrotesk_700Bold",
    fontWeight: "700",
    color: Colors.primary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: 120, // offset for footer button
  },
  amountSection: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: Spacing.xs,
  },
  amountInputRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    width: "100%",
  },
  currencySymbol: {
    fontFamily: "HankenGrotesk_600SemiBold",
    fontSize: 28,
    color: Colors.onSurfaceVariant,
    marginRight: 4,
  },
  amountInput: {
    fontFamily: "HankenGrotesk_700Bold",
    fontSize: 32,
    color: Colors.primary,
    textAlign: "center",
    minWidth: 150,
    maxWidth: 250,
    padding: 0,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: Rounded.md,
    borderWidth: 1,
    borderColor: "rgba(229, 226, 225, 0.5)",
    padding: Spacing.md,
    gap: Spacing.lg,
    shadowColor: "rgba(0,0,0,0.03)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  formGroup: {
    gap: Spacing.xs,
  },
  formLabel: {
    fontSize: 10,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  horizontalScroll: {
    gap: Spacing.sm,
    paddingRight: Spacing.md,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Rounded.full,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: Colors.secondaryContainer,
    borderColor: "transparent",
  },
  chipInactive: {
    backgroundColor: "transparent",
    borderColor: Colors.outlineVariant,
  },
  toggleRowContainer: {
    alignItems: "flex-start",
  },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Rounded.full,
    padding: 3,
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 24,
    borderRadius: Rounded.full,
  },
  toggleBtnActive: {
    backgroundColor: Colors.primary,
  },
  appChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Rounded.full,
    borderWidth: 1,
  },
  notesTextarea: {
    minHeight: 60,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceVariant + "40",
    padding: Spacing.md,
    zIndex: 10,
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontWeight: "700",
  },
});
