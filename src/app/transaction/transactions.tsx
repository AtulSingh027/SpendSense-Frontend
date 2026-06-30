import { Container } from "@/components/ui/container";
import { Colors, Rounded } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Text } from "@/components/ui/text";

import { fetchTransactions, type TransactionResponse, type FetchTransactionsParams } from "@/lib/transaction";
import { fetchCategories, type CategoryResponse } from "@/lib/category";

import { AppHeader } from "@/components/ui/app-header";
import { TransactionFilters } from "./components/TransactionFilters";
import { TransactionSummary } from "./components/TransactionSummary";
import { TransactionItem } from "./components/TransactionItem";
import { getDateRangeBounds, groupTransactionsByDate } from "./components/transaction-helpers";

export default function TransactionsScreen() {
  const router = useRouter();

  // Data States
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Filters
  const [dateFilter, setDateFilter] = useState<string>("month");
  const [customStart, setCustomStart] = useState("2026-06-01");
  const [customEnd, setCustomEnd] = useState("2026-06-30");

  const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null);
  const [selectedSource, setSelectedSource] = useState<"manual" | "sms" | null>(null);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  // Load categories once on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetchCategories();
        setCategories(res);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    }
    loadCategories();
  }, []);

  // Fetch transactions from API
  const loadTransactions = useCallback(async () => {
    try {
      const bounds = getDateRangeBounds(dateFilter, customStart, customEnd);
      const params: FetchTransactionsParams = {
        from_date: bounds.from,
        to_date: bounds.to,
        category_id: selectedCategory?.id || undefined,
        source: selectedSource || undefined,
        upi_app: selectedApp || undefined,
        limit: 100, // Fetch up to 100 items for robust client-side search
      };
      const res = await fetchTransactions(params);
      setTransactions(res.items);
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateFilter, customStart, customEnd, selectedCategory, selectedSource, selectedApp]);

  // Focus effect for automatic reloads
  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTransactions();
  }, [loadTransactions]);

  // Client-side text filtering
  const filteredItems = transactions.filter((item) => {
    const matchSearch =
      searchQuery.trim() === "" ||
      (item.merchant_raw || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.merchant_clean || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  // Math totals
  const totalSpend = filteredItems.reduce((acc, item) => {
    if (item.txn_type === "debit") {
      return acc + parseFloat(item.amount);
    }
    return acc;
  }, 0);

  const groupedTxns = groupTransactionsByDate(filteredItems);

  return (
    <Container safe style={styles.container}>
      <AppHeader />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />
        }
      >
        <TransactionFilters
          categories={categories}
          filteredItemsCount={filteredItems.length}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          customStart={customStart}
          setCustomStart={setCustomStart}
          customEnd={customEnd}
          setCustomEnd={setCustomEnd}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedSource={selectedSource}
          setSelectedSource={setSelectedSource}
          selectedApp={selectedApp}
          setSelectedApp={setSelectedApp}
        />

        <TransactionSummary
          totalSpend={totalSpend}
          filteredCount={filteredItems.length}
          selectedCategory={selectedCategory}
          selectedSource={selectedSource}
          selectedApp={selectedApp}
        />

        {/* Scrollable Grouped Transactions List */}
        {loading && transactions.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="search-off" size={48} color={Colors.outlineVariant} />
            <Text variant="headlineMd" color={Colors.onSurface} align="center">
              No Transactions
            </Text>
            <Text variant="bodyMd" color={Colors.onSurfaceVariant} align="center">
              No transactions match the selected filters.
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {groupedTxns.map((group) => (
              <View key={group.title} style={styles.groupContainer}>
                {/* Group Header */}
                <Text variant="labelSm" color={Colors.outline} style={styles.groupHeader}>
                  {group.title.toUpperCase()}
                </Text>

                {/* Group Card Wrapper */}
                <View style={styles.groupCard}>
                  {group.data.map((item, idx) => (
                    <TransactionItem
                      key={item.id}
                      item={item}
                      isLast={idx === group.data.length - 1}
                    />
                  ))}
                </View>
              </View>
            ))}
            {/* Spacing for FAB */}
            <View style={{ height: 120 }} />
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.fab}
        onPress={() => router.push("/transaction/add-expense")}
      >
        <MaterialIcons name="add" size={28} color={Colors.onPrimary} />
      </TouchableOpacity>
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
    paddingTop: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  groupContainer: {
    marginBottom: 20,
  },
  groupHeader: {
    marginBottom: 8,
    marginLeft: 4,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
  },
  groupCard: {
    backgroundColor: Colors.surface,
    borderRadius: Rounded.xl,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
