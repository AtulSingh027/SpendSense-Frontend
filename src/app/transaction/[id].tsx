import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";
import { Colors, Rounded, Spacing } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { fetchCategories, type CategoryResponse } from "@/lib/category";
import {
  fetchTransactionById,
  updateTransaction,
  deleteTransaction,
  type TransactionResponse,
} from "@/lib/transaction";
import { getCategoryColor, getCategoryIcon } from "./components/transaction-helpers";

const UPI_APPS = [
  { name: "PhonePe", color: "#5f259f", dotColor: "#8f3df2" },
  { name: "Google Pay", color: "#1a73e8", dotColor: "#4285f4" },
  { name: "Paytm", color: "#00baf2", dotColor: "#00baf2" },
];

// Helper to format date into "24 Oct 2023, 14:32"
function formatDisplayDateTime(timestamp: string): string {
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return timestamp;
  const day = d.getDate();
  const month = d.toLocaleDateString("en-IN", { month: "short" });
  const year = d.getFullYear();
  const time = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${day} ${month} ${year}, ${time}`;
}

// Helper to format date into "YYYY-MM-DD HH:MM" for editing input
function formatEditDateTime(timestamp: string): string {
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const transactionId = parseInt(id || "", 10);

  // States
  const [transaction, setTransaction] = useState<TransactionResponse | null>(null);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [smsExpanded, setSmsExpanded] = useState(false);

  // Form Fields State
  const [amount, setAmount] = useState("");
  const [txnType, setTxnType] = useState<"debit" | "credit">("debit");
  const [merchant, setMerchant] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null);
  const [paymentSource, setPaymentSource] = useState<"manual" | "upi">("manual");
  const [selectedUpiApp, setSelectedUpiApp] = useState<string | null>(null);
  const [dateTime, setDateTime] = useState("");
  const [notes, setNotes] = useState("");

  const loadData = useCallback(async () => {
    if (isNaN(transactionId)) {
      Alert.alert("Error", "Invalid transaction ID.");
      router.back();
      return;
    }

    try {
      setLoading(true);
      const [txnData, catsData] = await Promise.all([
        fetchTransactionById(transactionId),
        fetchCategories(),
      ]);

      setTransaction(txnData);
      setCategories(catsData);

      // Populate form states
      setAmount(parseFloat(txnData.amount).toFixed(2));
      setTxnType(txnData.txn_type);
      setMerchant(txnData.merchant_clean || txnData.merchant_raw || "");
      setPaymentSource(txnData.upi_app ? "upi" : "manual");
      setSelectedUpiApp(txnData.upi_app);
      setDateTime(formatEditDateTime(txnData.txn_timestamp));
      setNotes(txnData.notes || "");

      // Match category state
      const matchingCat = catsData.find((c) => c.id === txnData.category_id);
      setSelectedCategory(matchingCat || null);
    } catch (err: any) {
      console.error("Failed to load transaction details:", err);
      const msg = err?.response?.data?.detail || "Could not retrieve transaction.";
      Alert.alert("Error", msg);
      router.back();
    } finally {
      setLoading(false);
    }
  }, [transactionId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleDelete = () => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to permanently delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setSaving(true);
              await deleteTransaction(transactionId);
              Alert.alert(
                "Success",
                "Transaction deleted successfully.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      router.replace("/dashboard/transactions");
                    },
                  },
                ]
              );
            } catch (err: any) {
              console.error("Failed to delete transaction:", err);
              const msg = err?.response?.data?.detail || "Delete failed.";
              Alert.alert("Error", msg);
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount greater than 0.");
      return;
    }

    const dtRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
    if (!dtRegex.test(dateTime.trim())) {
      Alert.alert("Invalid Date & Time", "Please use the format YYYY-MM-DD HH:MM.");
      return;
    }

    setSaving(false);
    try {
      setSaving(true);
      const [datePart, timePart] = dateTime.trim().split(" ");
      const localIso = `${datePart}T${timePart}:00`;

      const payload = {
        amount: parsedAmount,
        txn_type: txnType,
        merchant_raw: merchant.trim() || null,
        category_id: selectedCategory ? selectedCategory.id : null,
        upi_app: paymentSource === "upi" ? selectedUpiApp : null,
        source: (paymentSource === "upi" ? "sms" : "manual") as "sms" | "manual",
        txn_timestamp: new Date(localIso).toISOString(),
        notes: notes.trim() || null,
      };

      await updateTransaction(transactionId, payload);
      setEditMode(false);
      loadData();
    } catch (err: any) {
      console.error("Failed to save changes:", err);
      const msg = err?.response?.data?.detail || "Failed to update transaction.";
      Alert.alert("Error", msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !transaction) {
    return (
      <Container safe>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </Container>
    );
  }

  const catColors = getCategoryColor(transaction?.category_name || "");
  const catIcon = getCategoryIcon(transaction?.category_name || null);

  return (
    <Container safe style={styles.container}>
      {/* Static Header with logo */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (editMode) {
              setEditMode(false);
            } else if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/dashboard/transactions");
            }
          }}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerLogoContainer}>
          <Image
            source={require("@/assets/wordmark.png")}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.headerActions}>
          {!editMode && (
            <>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setEditMode(true)}
                style={styles.headerActionBtn}
              >
                <MaterialIcons name="edit" size={24} color={Colors.onSurfaceVariant} />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleDelete}
                style={[styles.headerActionBtn, { marginLeft: 16 }]}
              >
                <MaterialIcons name="delete" size={24} color={Colors.error} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Main Content scroll with Keyboard Avoiding */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Top Banner Alert if app not specified */}
          {!transaction?.upi_app && !editMode && (
            <View style={styles.alertBanner}>
              <MaterialIcons name="info" size={20} color="#8c1d18" style={{ marginRight: 8 }} />
              <Text variant="bodyMd" color="#8c1d18" style={{ flex: 1 }}>
                Tell us which app you used — this helps SpendSense learn your spending patterns and predict it automatically next time.
              </Text>
            </View>
          )}

          {/* Circle Icon Container */}
          <View style={styles.avatarSection}>
            <View style={[styles.avatarCircle, { backgroundColor: catColors.bg }]}>
              <MaterialIcons name={catIcon} size={36} color={catColors.text} />
              <View style={styles.avatarDotOverlay} />
            </View>
          </View>

          {/* Merchant Raw / Clean Title */}
          <View style={styles.merchantSection}>
            {editMode ? (
              <TextInput
                style={styles.merchantInput}
                value={merchant}
                onChangeText={setMerchant}
                placeholder="Merchant Name"
                placeholderTextColor={Colors.outlineVariant}
                textAlign="center"
              />
            ) : (
              <Text variant="headlineLg" color={Colors.onSurface} align="center" style={styles.merchantTitle}>
                {transaction?.merchant_clean || transaction?.merchant_raw || "Transaction"}
              </Text>
            )}
          </View>

          {/* Amount Display */}
          <View style={styles.amountSection}>
            {editMode ? (
              <View style={styles.amountInputRow}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={[
                    styles.amountInput,
                    { width: Math.max(60, (amount || "").length * 16) }
                  ]}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor={Colors.outlineVariant}
                  keyboardType="decimal-pad"
                />
              </View>
            ) : (
              <Text style={styles.amountTextMain}>
                <Text style={styles.amountCurrencySymbol}>₹</Text>
                {transaction ? Math.floor(parseFloat(transaction.amount)) : "0"}
                <Text style={styles.amountTextDecimal}>
                  .{transaction ? parseFloat(transaction.amount).toFixed(2).split(".")[1] : "00"}
                </Text>
              </Text>
            )}
          </View>

          {/* Completed badge */}
          <View style={styles.badgeRow}>
            <View style={styles.completedBadge}>
              <MaterialIcons name="check-circle" size={16} color={Colors.onSurfaceVariant} style={{ marginRight: 4 }} />
              <Text variant="button" color={Colors.onSurfaceVariant}>
                Completed
              </Text>
            </View>
          </View>

          {/* Primary Form Card */}
          <View style={styles.formCard}>
            {/* Category selection */}
            <View style={styles.formGroup}>
              <Text variant="labelSm" color={Colors.onSurfaceVariant} style={styles.formLabel}>
                CATEGORY
              </Text>
              {editMode ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalChipsRow}>
                  {categories.map((cat) => {
                    const isSelected = selectedCategory?.id === cat.id;
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
                          name={getCategoryIcon(cat.name)}
                          size={18}
                          color={isSelected ? Colors.onSecondaryContainer : Colors.onSurfaceVariant}
                          style={{ marginRight: 4 }}
                        />
                        <Text variant="button" color={isSelected ? Colors.onSecondaryContainer : Colors.onSurfaceVariant}>
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              ) : (
                <View style={styles.horizontalChipsRow}>
                  <View style={[styles.chip, styles.chipActive]}>
                    <MaterialIcons name={catIcon} size={18} color={Colors.onSecondaryContainer} style={{ marginRight: 4 }} />
                    <Text variant="button" color={Colors.onSecondaryContainer}>
                      {transaction?.category_name || "Uncategorized"}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.divider} />

            {/* Date & Time selection */}
            <View style={styles.formGroup}>
              <Text variant="labelSm" color={Colors.onSurfaceVariant} style={styles.formLabel}>
                DATE & TIME
              </Text>
              {editMode ? (
                <View style={styles.dateInputRow}>
                  <MaterialIcons name="calendar-today" size={20} color={Colors.onSurfaceVariant} style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.dateTextInput}
                    value={dateTime}
                    onChangeText={setDateTime}
                    placeholder="YYYY-MM-DD HH:MM"
                    placeholderTextColor={Colors.outlineVariant}
                  />
                </View>
              ) : (
                <View style={styles.dateValueRow}>
                  <MaterialIcons name="calendar-today" size={20} color={Colors.onSurfaceVariant} style={{ marginRight: 8 }} />
                  <Text variant="bodyLg" color={Colors.onSurface}>
                    {transaction ? formatDisplayDateTime(transaction.txn_timestamp) : ""}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.divider} />

            {/* Paid Via (UPI Apps) selection */}
            <View style={styles.formGroup}>
              <Text variant="labelSm" color={Colors.onSurfaceVariant} style={styles.formLabel}>
                PAID VIA
              </Text>
              {editMode ? (
                <View style={styles.paymentSourceContainer}>
                  <View style={styles.toggleRow}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        setPaymentSource("manual");
                        setSelectedUpiApp(null);
                      }}
                      style={[styles.toggleBtn, paymentSource === "manual" && styles.toggleBtnActive]}
                    >
                      <Text variant="button" color={paymentSource === "manual" ? Colors.onPrimary : Colors.onSurfaceVariant}>
                        Manual/Cash
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        setPaymentSource("upi");
                        if (!selectedUpiApp) setSelectedUpiApp("PhonePe");
                      }}
                      style={[styles.toggleBtn, paymentSource === "upi" && styles.toggleBtnActive]}
                    >
                      <Text variant="button" color={paymentSource === "upi" ? Colors.onPrimary : Colors.onSurfaceVariant}>
                        UPI App
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {paymentSource === "upi" && (
                    <View style={styles.upiChipsGrid}>
                      {UPI_APPS.map((app) => {
                        const isSelected = selectedUpiApp === app.name;
                        return (
                          <TouchableOpacity
                            key={app.name}
                            activeOpacity={0.8}
                            onPress={() => setSelectedUpiApp(app.name)}
                            style={[
                              styles.upiChip,
                              isSelected ? { borderColor: app.color, backgroundColor: `${app.color}15` } : null,
                            ]}
                          >
                            <View style={[styles.colorDot, { backgroundColor: app.dotColor }]} />
                            <Text variant="button" color={isSelected ? app.color : Colors.onSurfaceVariant}>
                              {app.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.horizontalChipsRow}>
                  {transaction?.upi_app ? (
                    <View style={[styles.upiChip, { borderColor: Colors.primary }]}>
                      <View
                        style={[
                          styles.colorDot,
                          {
                            backgroundColor:
                              UPI_APPS.find((u) => u.name === transaction.upi_app)?.dotColor || Colors.primary,
                          },
                        ]}
                      />
                      <Text variant="button" color={Colors.primary}>
                        {transaction.upi_app}
                      </Text>
                    </View>
                  ) : (
                    <View style={[styles.upiChip, { borderColor: Colors.outlineVariant }]}>
                      <View style={[styles.colorDot, { backgroundColor: Colors.outline }]} />
                      <Text variant="button" color={Colors.onSurfaceVariant}>
                        Manual/Cash
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Notes Field (Always visible in edit mode, shown in view mode only if notes exist) */}
            {(editMode || notes.trim().length > 0) && (
              <>
                <View style={styles.divider} />
                <View style={styles.formGroup}>
                  <Text variant="labelSm" color={Colors.onSurfaceVariant} style={styles.formLabel}>
                    NOTES
                  </Text>
                  {editMode ? (
                    <TextInput
                      style={styles.notesInput}
                      value={notes}
                      onChangeText={setNotes}
                      placeholder="Add description or notes..."
                      placeholderTextColor={Colors.outlineVariant}
                      multiline
                    />
                  ) : (
                    <Text variant="bodyLg" color={Colors.onSurface}>
                      {notes}
                    </Text>
                  )}
                </View>
              </>
            )}
          </View>



          {/* Original SMS Accordion */}
          {transaction?.source === "sms" && transaction.sms_raw_text && (
            <View style={styles.accordionContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSmsExpanded(!smsExpanded)}
                style={styles.accordionHeader}
              >
                <View style={styles.accordionTitleRow}>
                  <MaterialIcons name="chat-bubble-outline" size={20} color={Colors.onSurfaceVariant} style={{ marginRight: 8 }} />
                  <Text variant="button" color={Colors.onSurface}>
                    Original SMS Data
                  </Text>
                </View>
                <MaterialIcons
                  name={smsExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                  size={24}
                  color={Colors.onSurfaceVariant}
                />
              </TouchableOpacity>
              {smsExpanded && (
                <View style={styles.accordionContent}>
                  <Text style={styles.smsRawText}>
                    {transaction.sms_raw_text}
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Static Footer Navigation / Action Buttons */}
      <View style={styles.footer}>
        {editMode ? (
          <View style={styles.footerActionsContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSave}
              disabled={saving}
              style={styles.saveButton}
            >
              {saving ? (
                <ActivityIndicator size="small" color={Colors.onPrimary} />
              ) : (
                <>
                  <MaterialIcons name="check" size={18} color={Colors.onPrimary} style={{ marginRight: 6 }} />
                  <Text variant="button" color={Colors.onPrimary}>
                    Save Changes
                  </Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setEditMode(false);
                // Reset form values to loaded transaction data
                if (transaction) {
                  setAmount(parseFloat(transaction.amount).toFixed(2));
                  setMerchant(transaction.merchant_clean || transaction.merchant_raw || "");
                  setPaymentSource(transaction.upi_app ? "upi" : "manual");
                  setSelectedUpiApp(transaction.upi_app);
                  setDateTime(formatEditDateTime(transaction.txn_timestamp));
                  setNotes(transaction.notes || "");
                  const matchingCat = categories.find((c) => c.id === transaction.category_id);
                  setSelectedCategory(matchingCat || null);
                }
              }}
              style={styles.cancelButton}
            >
              <MaterialIcons name="close" size={18} color={Colors.primary} style={{ marginRight: 6 }} />
              <Text variant="button" color={Colors.primary}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.footerActionsContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setEditMode(true)}
              style={styles.editButtonBottom}
            >
              <MaterialIcons name="edit" size={18} color={Colors.primary} style={{ marginRight: 6 }} />
              <Text variant="button" color={Colors.primary}>
                Edit Transaction
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleDelete}
              style={styles.deleteButtonBottom}
            >
              <MaterialIcons name="delete" size={18} color={Colors.onPrimary} style={{ marginRight: 6 }} />
              <Text variant="button" color={Colors.onPrimary}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceVariant,
    backgroundColor: Colors.surface,
  },
  backButton: {
    padding: 4,
  },
  headerLogoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerLogo: {
    width: 130,
    height: 32,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerActionBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  alertBanner: {
    flexDirection: "row",
    backgroundColor: "#fce8e6",
    borderColor: "#f8c0bd",
    borderWidth: 1,
    borderRadius: Rounded.default,
    padding: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  avatarSection: {
    alignItems: "center",
    marginVertical: 16,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  avatarDotOverlay: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.surfaceVariant,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  merchantSection: {
    alignItems: "center",
    marginBottom: 8,
  },
  merchantTitle: {
    fontFamily: "HankenGrotesk_600SemiBold",
  },
  merchantInput: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    fontSize: 22,
    fontFamily: "HankenGrotesk_600SemiBold",
    color: Colors.onSurface,
    width: "80%",
    paddingVertical: 4,
    alignSelf: "center",
    textAlign: "center",
  },
  amountSection: {
    alignItems: "center",
    marginBottom: 16,
  },
  amountTextMain: {
    fontSize: 36,
    fontFamily: "HankenGrotesk_700Bold",
    color: Colors.primary,
    textAlign: "center",
  },
  amountCurrencySymbol: {
    fontSize: 24,
    fontFamily: "HankenGrotesk_700Bold",
    color: Colors.primary,
  },
  amountTextDecimal: {
    fontSize: 20,
    fontFamily: "HankenGrotesk_700Bold",
    color: Colors.primary,
  },
  amountInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    paddingVertical: 4,
    alignSelf: "center",
  },
  currencySymbol: {
    fontSize: 28,
    fontFamily: "HankenGrotesk_700Bold",
    color: Colors.primary,
    marginRight: 4,
  },
  amountInput: {
    fontSize: 28,
    fontFamily: "HankenGrotesk_700Bold",
    color: Colors.primary,
    textAlign: "left",
    padding: 0,
  },
  badgeRow: {
    alignItems: "center",
    marginBottom: 24,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceVariant,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Rounded.full,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: Rounded.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    marginBottom: 16,
  },
  formGroup: {
    marginVertical: 8,
  },
  formLabel: {
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceVariant,
    marginVertical: 12,
  },
  horizontalChipsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Rounded.full,
    marginRight: 10,
  },
  chipActive: {
    backgroundColor: Colors.secondaryContainer,
  },
  chipInactive: {
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  dateInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
    paddingVertical: 4,
  },
  dateTextInput: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: Colors.onSurface,
    flex: 1,
  },
  dateValueRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentSourceContainer: {
    marginTop: 4,
  },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Rounded.default,
    padding: 4,
    marginBottom: 12,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: Rounded.default,
  },
  toggleBtnActive: {
    backgroundColor: Colors.primary,
  },
  upiChipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  upiChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Rounded.full,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    marginRight: 8,
    marginBottom: 8,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: Rounded.default,
    padding: 10,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.onSurface,
    minHeight: 80,
    textAlignVertical: "top",
  },
  smsSourceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  accordionContainer: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Rounded.default,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: "hidden",
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  accordionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  accordionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
  smsRawText: {
    fontFamily: "JetBrainsMono_500Medium",
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
  },
  footer: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  footerActionsContainer: {
    flexDirection: "column",
  },
  editButtonBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Rounded.default,
    paddingVertical: 12,
    marginBottom: 10,
  },
  deleteButtonBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.error,
    borderRadius: Rounded.default,
    paddingVertical: 12,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: Rounded.default,
    paddingVertical: 12,
    marginBottom: 10,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Rounded.default,
    paddingVertical: 12,
  },
});
