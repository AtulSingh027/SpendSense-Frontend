import { Container } from "@/components/ui/container";
import { DonutChart } from "@/components/ui/donut-chart";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Colors, Rounded, Spacing, Typography } from "@/constants/theme";
import {
  fetchCurrentMonthSpend,
  fetchTodaySpend,
  fetchUPIManualSpend,
  fetchUPIAppsBreakdown,
  fetchCategoryBreakdown,
  type CurrentMonthSpend,
  type TodaySpend,
  type UPIManualSpend,
  type UPIAppsBreakdown,
  type CategoryBreakdown,
} from "@/lib/dashboard";
import { fetchTransactions, type TransactionResponse } from "@/lib/transaction";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { AppHeader } from "@/components/ui/app-header";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  ScrollView as LegendScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
} from "react-native";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "₹0";
  return "₹" + num.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function formatCompact(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "₹0";
  if (num >= 100000) return "₹" + (num / 100000).toFixed(1) + "L";
  if (num >= 1000) return "₹" + (num / 1000).toFixed(1) + "k";
  return "₹" + num.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function formatTxnTime(timestampStr: string): string {
  const date = new Date(timestampStr);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const timeStr = date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (compareDate.getTime() === today.getTime()) {
    return `Today, ${timeStr}`;
  } else if (compareDate.getTime() === yesterday.getTime()) {
    return `Yesterday, ${timeStr}`;
  } else {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
    };
    const dateFormatted = date.toLocaleDateString("en-IN", options);
    return `${dateFormatted}, ${timeStr}`;
  }
}

function getCategoryIcon(categoryName: string | null): keyof typeof MaterialIcons.glyphMap {
  const name = (categoryName || "").toLowerCase();
  if (name.includes("food") || name.includes("dining") || name.includes("beverage") || name.includes("restaurant") || name.includes("starbucks")) {
    return "local-dining";
  }
  if (name.includes("shop") || name.includes("grocer") || name.includes("mart") || name.includes("amazon")) {
    return "shopping-bag";
  }
  if (name.includes("travel") || name.includes("ride") || name.includes("cab") || name.includes("transport") || name.includes("uber")) {
    return "directions-car";
  }
  if (name.includes("bill") || name.includes("recharge") || name.includes("utilit") || name.includes("broadband") || name.includes("airtel")) {
    return "receipt";
  }
  if (name.includes("home") || name.includes("rent") || name.includes("hous")) {
    return "home";
  }
  if (name.includes("health") || name.includes("medical") || name.includes("doctor")) {
    return "local-hospital";
  }
  if (name.includes("salary") || name.includes("income") || name.includes("credit")) {
    return "attach-money";
  }
  return "payment";
}

function renderAppBadge(upiApp: string | null) {
  if (!upiApp) return null;
  const app = upiApp.toLowerCase();
  let bgColor = "#673AB7";
  let text = "Pe";
  
  if (app.includes("phonepe")) {
    bgColor = "#5f259f";
    text = "Pe";
  } else if (app.includes("gpay") || app.includes("google")) {
    bgColor = "#1a73e8";
    text = "G";
  } else if (app.includes("paytm")) {
    bgColor = "#00baf2";
    text = "Pm";
  } else {
    bgColor = Colors.primary;
    text = upiApp.substring(0, 2);
  }

  return (
    <View style={[styles.miniAppBadge, { backgroundColor: bgColor }]}>
      <Text style={styles.miniAppBadgeText}>{text}</Text>
    </View>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function DashboardHomeScreen() {
  const router = useRouter();
  const [today, setToday] = useState<TodaySpend | null>(null);
  const [month, setMonth] = useState<CurrentMonthSpend | null>(null);
  const [upiManual, setUpiManual] = useState<UPIManualSpend | null>(null);
  const [upiApps, setUpiApps] = useState<UPIAppsBreakdown | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryBreakdown | null>(null);
  const [recentTxns, setRecentTxns] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter States
  const [filterType, setFilterType] = useState<string>("month");
  const [customStart, setCustomStart] = useState<string>("2026-06-01");
  const [customEnd, setCustomEnd] = useState<string>("2026-06-30");

  const [inputStart, setInputStart] = useState<string>("2026-06-01");
  const [inputEnd, setInputEnd] = useState<string>("2026-06-30");

  const loadData = useCallback(async (
    activeFilter = filterType,
    start = customStart,
    end = customEnd
  ) => {
    try {
      const passStart = activeFilter === "custom" ? start : undefined;
      const passEnd = activeFilter === "custom" ? end : undefined;

      const [todayRes, monthRes, upiRes, appsRes, catRes, txnsRes] = await Promise.all([
        fetchTodaySpend(),
        fetchCurrentMonthSpend(),
        fetchUPIManualSpend(activeFilter, passStart, passEnd),
        fetchUPIAppsBreakdown(activeFilter, passStart, passEnd),
        fetchCategoryBreakdown(activeFilter, passStart, passEnd),
        fetchTransactions({ limit: 5 }),
      ]);
      setToday(todayRes);
      setMonth(monthRes);
      setUpiManual(upiRes);
      setUpiApps(appsRes);
      setCategoryData(catRes);
      setRecentTxns(txnsRes.items);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterType, customStart, customEnd]);

  useFocusEffect(
    useCallback(() => {
      loadData(filterType, customStart, customEnd);
    }, [filterType, customStart, customEnd, loadData])
  );

  const handleFilterChange = (type: string) => {
    setFilterType(type);
    if (type !== "custom") {
      loadData(type);
    }
  };

  const handleApplyCustomDates = () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(inputStart) || !dateRegex.test(inputEnd)) {
      alert("Please enter dates in YYYY-MM-DD format");
      return;
    }
    setCustomStart(inputStart);
    setCustomEnd(inputEnd);
    loadData("custom", inputStart, inputEnd);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(filterType, customStart, customEnd);
  }, [loadData, filterType, customStart, customEnd]);

  // ─── Loading State ──────────────────────────────────────────────────

  if (loading) {
    return (
      <Container safe>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </Container>
    );
  }

  // ─── Computed Values ────────────────────────────────────────────────

  const todayAmount = today ? formatCurrency(today.total_amount) : "₹0";
  const todayPercent = today ? Math.abs(today.diff_percent) : 0;
  const todayIsHigher = today?.is_higher ?? false;

  const monthAmount = month ? formatCurrency(month.total_amount) : "₹0";
  const monthPercent = month ? Math.abs(month.diff_percent) : 0;
  const monthIsHigher = month?.is_higher ?? false;
  const lastMonthTotal = month ? formatCurrency(month.last_month_total) : "₹0";
  const monthProgress =
    month && parseFloat(month.last_month_total) > 0
      ? Math.min(
          (parseFloat(month.total_amount) / parseFloat(month.last_month_total)) * 100,
          100
        )
      : 0;

  const upiAmount = upiManual ? formatCurrency(upiManual.upi_spend) : "₹0";
  const manualAmount = upiManual ? formatCurrency(upiManual.manual_spend) : "₹0";

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <Container safe>
      {/* Header */}
      <AppHeader />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* ── Filter Selector ─────────────────────────────────────── */}
        <View style={styles.filterBar}>
          {(["day", "week", "month", "custom"] as const).map((type) => {
            const isActive = filterType === type;
            const label = type.charAt(0).toUpperCase() + type.slice(1);
            return (
              <TouchableOpacity
                key={type}
                activeOpacity={0.8}
                onPress={() => handleFilterChange(type)}
                style={[
                  styles.filterPill,
                  isActive && styles.filterPillActive,
                ]}
              >
                {type === "custom" && (
                  <MaterialIcons
                    name="date-range"
                    size={16}
                    color={isActive ? Colors.primary : Colors.onSurfaceVariant}
                    style={{ marginRight: 6 }}
                  />
                )}
                <Text
                  variant="button"
                  color={isActive ? Colors.primary : Colors.onSurfaceVariant}
                  style={styles.filterText}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Custom Date Input (conditionally visible) ───────────── */}
        {filterType === "custom" && (
          <View style={styles.customDateCard}>
            <View style={styles.dateInputRow}>
              <View style={{ flex: 1 }}>
                <Text variant="labelSm" color={Colors.onSurfaceVariant} style={{ marginBottom: 4 }}>
                  Start Date
                </Text>
                <Input
                  value={inputStart}
                  onChangeText={setInputStart}
                  placeholder="YYYY-MM-DD"
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
              <View style={{ width: Spacing.sm }} />
              <View style={{ flex: 1 }}>
                <Text variant="labelSm" color={Colors.onSurfaceVariant} style={{ marginBottom: 4 }}>
                  End Date
                </Text>
                <Input
                  value={inputEnd}
                  onChangeText={setInputEnd}
                  placeholder="YYYY-MM-DD"
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleApplyCustomDates}
              style={styles.applyButton}
            >
              <Text variant="button" color={Colors.onPrimary}>
                Apply Filter
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Today's Spend Card ──────────────────────────────────── */}
        <View style={styles.card}>
          <Text variant="headlineMd" color={Colors.onSurface}>
            Today's Spend
          </Text>
          <Text variant="labelSm" color={Colors.onSurfaceVariant} style={styles.cardSubtitle}>
            Total expenses for today
          </Text>

          <View style={styles.amountRow}>
            <Text style={styles.displayCurrency} numberOfLines={1}>
              {todayAmount}
            </Text>
            {todayPercent > 0 && (
              <View
                style={[
                  styles.badge,
                  todayIsHigher ? styles.badgeError : styles.badgeSuccess,
                ]}
              >
                <MaterialIcons
                  name={todayIsHigher ? "arrow-upward" : "arrow-downward"}
                  size={14}
                  color={todayIsHigher ? Colors.error : Colors.secondary}
                />
                <Text
                  variant="labelSm"
                  color={todayIsHigher ? Colors.error : Colors.secondary}
                >
                  {todayPercent}%
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── This Month Card ─────────────────────────────────────── */}
        <View style={styles.card}>
          <Text variant="headlineMd" color={Colors.onSurface}>
            This Month
          </Text>
          <Text variant="labelSm" color={Colors.onSurfaceVariant} style={styles.cardSubtitle}>
            Total expenses for current month
          </Text>

          <View style={styles.amountRow}>
            <Text style={styles.displayCurrency} numberOfLines={1}>
              {monthAmount}
            </Text>
            {monthPercent > 0 && (
              <View
                style={[
                  styles.badge,
                  monthIsHigher ? styles.badgeError : styles.badgeSuccess,
                ]}
              >
                <MaterialIcons
                  name={monthIsHigher ? "arrow-upward" : "arrow-downward"}
                  size={14}
                  color={monthIsHigher ? Colors.error : Colors.secondary}
                />
                <Text
                  variant="labelSm"
                  color={monthIsHigher ? Colors.error : Colors.secondary}
                >
                  {monthPercent}%
                </Text>
              </View>
            )}
          </View>

          {/* Progress vs last month */}
          <View style={styles.progressSection}>
            <View style={styles.progressLabels}>
              <Text variant="labelSm" color={Colors.onSurfaceVariant}>
                vs last month ({lastMonthTotal})
              </Text>
              <Text variant="labelSm" color={Colors.onSurfaceVariant}>
                {Math.round(monthProgress)}%
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${monthProgress}%` }]}
              />
            </View>
          </View>
        </View>

        {/* ── UPI Spend & Manual Spend Row ────────────────────────── */}
        <View style={styles.splitRow}>
          <View style={[styles.miniCard, { marginRight: Spacing.sm / 2 }]}>
            <Text variant="labelSm" color={Colors.onSurfaceVariant}>
              UPI Spend
            </Text>
            <Text variant="headlineMd" color={Colors.primary} style={styles.miniAmount}>
              {upiAmount}
            </Text>
          </View>
          <View style={[styles.miniCard, { marginLeft: Spacing.sm / 2 }]}>
            <Text variant="labelSm" color={Colors.onSurfaceVariant}>
              Manual
            </Text>
            <Text variant="headlineMd" color={Colors.primary} style={styles.miniAmount}>
              {manualAmount}
            </Text>
          </View>
        </View>

        {/* ── Spend by App Card ─────────────────────────────────── */}
        {upiApps && upiApps.items.length > 0 && (
          <View style={styles.card}>
            <Text variant="headlineMd" color={Colors.onSurface}>
              Spend by App
            </Text>

            <View style={styles.appList}>
              {upiApps.items.map((item) => {
                const config = getAppConfig(item.app);
                const isUnknown = item.app === "Unknown";
                return (
                  <View key={item.app} style={styles.appRow}>
                    {/* App Icon */}
                    <View style={[styles.appIcon, { backgroundColor: config.bg, borderWidth: config.border ? 1 : 0, borderColor: Colors.outlineVariant }]}>
                      {config.icon ? (
                        <MaterialIcons name={config.icon as any} size={18} color={config.textColor} />
                      ) : (
                        <Text style={[styles.appInitials, { color: config.textColor }]}>
                          {config.initials}
                        </Text>
                      )}
                    </View>

                    {/* App Info */}
                    <View style={styles.appInfo}>
                      <Text variant="button" color={Colors.onSurface}>
                        {item.app}
                      </Text>
                      <Text variant="labelSm" color={Colors.onSurfaceVariant}>
                        {isUnknown ? "Unlabeled transactions" : `${item.percentage}% of app spend`}
                      </Text>
                    </View>

                    {/* Amount + Action */}
                    <View style={styles.appAmountCol}>
                      <Text variant="button" color={Colors.onSurface}>
                        {formatCurrency(item.amount)}
                      </Text>
                      <TouchableOpacity activeOpacity={0.7}>
                        <Text variant="labelSm" color={Colors.primary} style={styles.appAction}>
                          {isUnknown ? "Label" : "Show"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Total Footer */}
            <View style={styles.appTotalRow}>
              <Text variant="bodyMd" color={Colors.onSurfaceVariant}>
                Total App Spend
              </Text>
              <Text variant="headlineMd" color={Colors.primary}>
                {formatCurrency(upiApps.total_spend)}
              </Text>
            </View>
          </View>
        )}

        {/* ── Category Breakdown Card ─────────────────────────────── */}
        {categoryData && categoryData.categories.length > 0 && (
          <View style={styles.card}>
            <Text variant="headlineMd" color={Colors.onSurface}>
              Category Breakdown
            </Text>

            {/* Donut Chart */}
            <View style={styles.chartContainer}>
              <DonutChart
                size={180}
                strokeWidth={14}
                segments={categoryData.categories.map((cat, i) => ({
                  percentage: cat.percentage,
                  color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                }))}
              >
                <Text variant="labelSm" color={Colors.onSurfaceVariant}>
                  Total
                </Text>
                <Text style={styles.chartCenterAmount}>
                  {formatCompact(categoryData.total_amount)}
                </Text>
              </DonutChart>
            </View>

            {/* Scrollable Legend */}
            <LegendScrollView
              style={styles.legendScroll}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              {categoryData.categories.map((cat, i) => (
                <View key={cat.category_name} style={styles.legendRow}>
                  <View style={styles.legendLeft}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] },
                      ]}
                    />
                    <Text variant="bodyLg" color={Colors.onSurface}>
                      {cat.category_name}
                    </Text>
                  </View>
                  <Text variant="button" color={Colors.onSurface}>
                    {formatCurrency(cat.amount)}
                  </Text>
                </View>
              ))}
            </LegendScrollView>
          </View>
        )}

        {/* ── Recent Transactions Card ───────────────────────────── */}
        {recentTxns && recentTxns.length > 0 && (
          <View style={styles.card}>
            <View style={styles.txnHeaderRow}>
              <Text variant="headlineMd" color={Colors.onSurface}>
                Recent Transactions
              </Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/dashboard/transactions")}>
                <Text variant="button" color={Colors.primary}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.txnList}>
              {recentTxns.map((txn) => {
                const iconName = getCategoryIcon(txn.category_name);
                const isDebit = txn.txn_type === "debit";
                return (
                  <View key={txn.id} style={styles.txnRow}>
                    {/* Left Icon Container */}
                    <View style={styles.txnIconContainer}>
                      <View style={styles.txnIconBg}>
                        <MaterialIcons name={iconName} size={20} color={Colors.onSurfaceVariant} />
                      </View>
                      {/* UPI App Mini Badge */}
                      {renderAppBadge(txn.upi_app)}
                    </View>

                    {/* Middle Info */}
                    <View style={styles.txnMiddle}>
                      <Text variant="button" color={Colors.onSurface} numberOfLines={1}>
                        {txn.merchant_clean || txn.merchant_raw || (txn.source === "manual" ? "Manual Spend" : `Transaction #${txn.id}`)}
                      </Text>
                      <Text variant="labelSm" color={Colors.onSurfaceVariant} style={styles.txnSubtitle}>
                        {txn.category_name || "Uncategorized"} • {formatTxnTime(txn.txn_timestamp)}
                      </Text>
                    </View>

                    {/* Right Amount */}
                    <View style={styles.txnRight}>
                      {isDebit && (
                        <Text variant="button" color={Colors.onSurface} style={styles.txnSign}>
                          -
                        </Text>
                      )}
                      <Text variant="button" color={isDebit ? Colors.onSurface : Colors.secondary}>
                        {formatCurrency(txn.amount)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.fab}
        onPress={() => router.push("/transaction/add-expense")}
      >
        <MaterialIcons name="add" size={28} color={Colors.onPrimary} />
      </TouchableOpacity>
    </Container>
  );
}

// ─── UPI App Branding ───────────────────────────────────────────────────────

const APP_COLORS: Record<string, { bg: string; textColor: string; initials: string; border?: boolean; icon?: string }> = {
  PhonePe:  { bg: "#673AB7", textColor: "#ffffff", initials: "Pe" },
  GPay:     { bg: "#ffffff", textColor: "#4285F4", initials: "G", border: true },
  Paytm:    { bg: "#273172", textColor: "#ffffff", initials: "Py" },
  Unknown:  { bg: Colors.surfaceVariant, textColor: Colors.onSurfaceVariant, initials: "?", icon: "help" },
};

function getAppConfig(appName: string) {
  return APP_COLORS[appName] ?? {
    bg: Colors.surfaceContainer,
    textColor: Colors.onSurfaceVariant,
    initials: appName.substring(0, 2),
  };
}

// ─── Category Chart Colors ──────────────────────────────────────────────────

const CATEGORY_COLORS = [
  "#004d40", // Forest Teal
  "#5fae78", // Mint Green
  "#ffb5a1", // Salmon
  "#3b6663", // Muted Teal
  "#e89f8c", // Peach
  "#bfc9c4", // Silver Sage
  "#673AB7", // Deep Purple
  "#4285F4", // Blue
  "#F4B400", // Amber
  "#0F9D58", // Green
];

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 28,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },

  // ── Cards ───────────────────────────────────────────────────────────
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Rounded.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.lg,
    shadowColor: "rgba(0,0,0,0.03)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  cardSubtitle: {
    marginTop: 4,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  displayCurrency: {
    fontFamily: "HankenGrotesk_700Bold",
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.64,
    color: Colors.primary,
  },

  // ── Badges ──────────────────────────────────────────────────────────
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Rounded.full,
  },
  badgeError: {
    backgroundColor: Colors.errorContainer,
  },
  badgeSuccess: {
    backgroundColor: Colors.secondaryContainer,
  },

  // ── Progress ────────────────────────────────────────────────────────
  progressSection: {
    marginTop: Spacing.md,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressTrack: {
    width: "100%",
    height: 6,
    borderRadius: Rounded.full,
    backgroundColor: Colors.surfaceVariant,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: Rounded.full,
    backgroundColor: Colors.secondary,
  },

  // ── Mini Cards (UPI / Manual) ───────────────────────────────────────
  splitRow: {
    flexDirection: "row",
  },
  miniCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Rounded.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    shadowColor: "rgba(0,0,0,0.03)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  miniAmount: {
    marginTop: 4,
  },

  // ── Spend by App ──────────────────────────────────────────────────────
  appList: {
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  appRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Rounded.default,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  appIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  appInitials: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    fontWeight: "700",
  },
  appInfo: {
    flex: 1,
  },
  appAmountCol: {
    alignItems: "flex-end",
  },
  appAction: {
    marginTop: 2,
  },
  appTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceVariant,
  },

  // ── Category Breakdown ─────────────────────────────────────────────────
  chartContainer: {
    alignItems: "center",
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  chartCenterAmount: {
    fontFamily: "HankenGrotesk_700Bold",
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.44,
    color: Colors.primary,
  },
  legendScroll: {
    maxHeight: 200,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
  },
  legendLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // ── Filters ───────────────────────────────────────────────────────────
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Rounded.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: "rgba(0,0,0,0.02)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: Spacing.xs,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: Rounded.full,
  },
  filterPillActive: {
    backgroundColor: Colors.secondaryContainer,
  },
  filterText: {
    fontWeight: "600",
  },
  customDateCard: {
    backgroundColor: Colors.surface,
    borderRadius: Rounded.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
    shadowColor: "rgba(0,0,0,0.03)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  dateInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  applyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
  },

  // ── Recent Transactions ──────────────────────────────────────────────
  txnHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  txnList: {
    gap: Spacing.md,
  },
  txnRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  txnIconContainer: {
    position: "relative",
    marginRight: Spacing.md,
  },
  txnIconBg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#f0eded", // Colors.surfaceContainer
    alignItems: "center",
    justifyContent: "center",
  },
  miniAppBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#ffffff",
  },
  miniAppBadgeText: {
    fontSize: 7,
    fontWeight: "700",
    color: "#ffffff",
    fontFamily: "Inter_600SemiBold",
  },
  txnMiddle: {
    flex: 1,
  },
  txnSubtitle: {
    marginTop: 2,
  },
  txnRight: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  txnSign: {
    marginBottom: 2,
    fontSize: 14,
    lineHeight: 14,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
