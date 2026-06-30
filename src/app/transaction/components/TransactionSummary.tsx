import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Colors } from "@/constants/theme";
import { formatCurrency } from "./transaction-helpers";
import { type CategoryResponse } from "@/lib/category";

interface TransactionSummaryProps {
  totalSpend: number;
  filteredCount: number;
  selectedCategory: CategoryResponse | null;
  selectedSource: "manual" | "sms" | null;
  selectedApp: string | null;
}

export function TransactionSummary({
  totalSpend,
  filteredCount,
  selectedCategory,
  selectedSource,
  selectedApp,
}: TransactionSummaryProps) {
  const getFilterSummaryString = () => {
    const parts: string[] = [];
    if (selectedCategory) parts.push(selectedCategory.name);
    if (selectedSource) parts.push(selectedSource === "manual" ? "Manual" : "SMS/UPI");
    if (selectedApp) parts.push(selectedApp);
    if (parts.length === 0) return "SHOWING ALL";
    return parts.join(" • ").toUpperCase();
  };

  return (
    <View style={styles.summaryBanner}>
      <View style={styles.summaryLeft}>
        <View style={styles.summaryCol}>
          <Text style={styles.summaryLabel}>FILTERED TOTAL</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(totalSpend)}</Text>
        </View>
        <View style={styles.summaryColDivider} />
        <View style={styles.summaryCol}>
          <Text style={styles.summaryLabel}>FILTERED COUNT</Text>
          <Text style={styles.summaryAmount}>
            {filteredCount} <Text style={styles.summaryCountSub}>Txns</Text>
          </Text>
        </View>
      </View>

      <View style={styles.summaryRight}>
        <MaterialIcons name="filter-list" size={14} color={Colors.onSecondaryContainer} />
        <Text style={styles.summaryFilterIndicator}>{getFilterSummaryString()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryBanner: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: "#F0FAF7",
    borderWidth: 1,
    borderColor: "#D2EBE4",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryCol: {
    justifyContent: "center",
  },
  summaryColDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.onSecondaryContainer,
    opacity: 0.2,
    marginHorizontal: 16,
  },
  summaryLabel: {
    fontFamily: "JetBrainsMono_500Medium",
    fontSize: 10,
    color: Colors.onSecondaryContainer,
    opacity: 0.8,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryAmount: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: Colors.onSecondaryContainer,
  },
  summaryCountSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    opacity: 0.8,
  },
  summaryRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryFilterIndicator: {
    fontFamily: "JetBrainsMono_500Medium",
    fontSize: 9,
    color: Colors.onSecondaryContainer,
    marginLeft: 4,
  },
});
