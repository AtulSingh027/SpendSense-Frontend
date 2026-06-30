import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Colors } from "@/constants/theme";
import { type TransactionResponse } from "@/lib/transaction";
import {
  formatCurrency,
  getCategoryColor,
  getCategoryIcon,
  getUpiBadgeColors,
  getUpiBadgeText,
} from "./transaction-helpers";

interface TransactionItemProps {
  item: TransactionResponse;
  isLast: boolean;
}

export function TransactionItem({ item, isLast }: TransactionItemProps) {
  const catColor = getCategoryColor(item.category_name || "");
  const iconName = getCategoryIcon(item.category_name);
  const isDebit = item.txn_type === "debit";
  const amtColor = isDebit ? Colors.onSurface : Colors.secondary;
  const amtPrefix = isDebit ? "-" : "+";

  const dateObj = new Date(item.txn_timestamp);
  const timeStr = dateObj.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const titleText =
    item.merchant_clean ||
    item.merchant_raw ||
    item.category_name ||
    "Transaction";

  return (
    <View style={[styles.txnRow, !isLast && styles.txnRowBorder]}>
      <View style={styles.txnLeft}>
        {/* Icon Wrapper */}
        <View style={[styles.categoryCircle, { backgroundColor: catColor.bg }]}>
          <MaterialIcons name={iconName} size={20} color={catColor.text} />
          {/* Render UPI Mini Badge overlay */}
          {item.upi_app && (
            <View
              style={[
                styles.appBadge,
                { backgroundColor: getUpiBadgeColors(item.upi_app).bg },
              ]}
            >
              <Text
                style={[
                  styles.appBadgeText,
                  { color: getUpiBadgeColors(item.upi_app).text },
                ]}
              >
                {getUpiBadgeText(item.upi_app)}
              </Text>
            </View>
          )}
        </View>

        {/* Middle Text Details */}
        <View style={styles.txnTextContainer}>
          <Text variant="button" color={Colors.onSurface} numberOfLines={1} style={styles.txnTitle}>
            {titleText}
          </Text>
          <View style={styles.txnSubtitleRow}>
            <Text variant="labelSm" color={Colors.onSurfaceVariant}>
              {item.category_name || "Other"}
            </Text>
            <Text variant="labelSm" color={Colors.outline} style={{ marginHorizontal: 4 }}>
              •
            </Text>
            <Text variant="labelSm" color={Colors.outline}>
              {timeStr}
            </Text>
            {item.source === "manual" && (
              <>
                <Text variant="labelSm" color={Colors.outline} style={{ marginHorizontal: 4 }}>
                  •
                </Text>
                <View style={styles.manualChip}>
                  <Text variant="labelSm" color={Colors.outline} style={styles.manualChipText}>
                    Manual
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Right Amount details */}
      <View style={styles.txnRight}>
        <Text variant="button" color={amtColor} style={styles.txnAmountText}>
          {amtPrefix}
          {formatCurrency(item.amount)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  txnRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  txnRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  txnLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  appBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffffff",
  },
  appBadgeText: {
    fontSize: 7,
    fontFamily: "Inter_600SemiBold",
  },
  txnTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  txnTitle: {
    marginBottom: 4,
  },
  txnSubtitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  manualChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  manualChipText: {
    fontSize: 9,
  },
  txnRight: {
    alignItems: "flex-end",
  },
  txnAmountText: {
    fontFamily: "Inter_600SemiBold",
  },
});
