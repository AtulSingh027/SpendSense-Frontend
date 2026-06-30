import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Colors, Rounded } from "@/constants/theme";
import { type CategoryResponse } from "@/lib/category";
import { formatDateRangeText } from "./transaction-helpers";

interface TransactionFiltersProps {
  categories: CategoryResponse[];
  filteredItemsCount: number;

  dateFilter: string;
  setDateFilter: (val: string) => void;
  customStart: string;
  setCustomStart: (val: string) => void;
  customEnd: string;
  setCustomEnd: (val: string) => void;

  searchQuery: string;
  setSearchQuery: (val: string) => void;

  selectedCategory: CategoryResponse | null;
  setSelectedCategory: (val: CategoryResponse | null) => void;

  selectedSource: "manual" | "sms" | null;
  setSelectedSource: (val: "manual" | "sms" | null) => void;

  selectedApp: string | null;
  setSelectedApp: (val: string | null) => void;
}

export function TransactionFilters({
  categories,
  filteredItemsCount,
  dateFilter,
  setDateFilter,
  customStart,
  setCustomStart,
  customEnd,
  setCustomEnd,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedSource,
  setSelectedSource,
  selectedApp,
  setSelectedApp,
}: TransactionFiltersProps) {
  // Local state for UI toggles
  const [showDateSelector, setShowDateSelector] = useState(false);
  const [activeFilterType, setActiveFilterType] = useState<"category" | "source" | "app" | null>(null);
  const [inputStart, setInputStart] = useState(customStart);
  const [inputEnd, setInputEnd] = useState(customEnd);

  const handleApplyCustomDates = () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(inputStart) || !dateRegex.test(inputEnd)) {
      alert("Please enter dates in YYYY-MM-DD format");
      return;
    }
    setCustomStart(inputStart);
    setCustomEnd(inputEnd);
    setDateFilter("custom");
    setShowDateSelector(false);
  };

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSelectedSource(null);
    setSelectedApp(null);
    setDateFilter("month");
    setSearchQuery("");
    setActiveFilterType(null);
    setShowDateSelector(false);
  };

  return (
    <View>
      {/* Date selector trigger box */}
      <View style={styles.dateRangeBoxContainer}>
        <View style={styles.dateRangeBox}>
          <View style={styles.dateRangeLeft}>
            <MaterialIcons name="calendar-today" size={16} color={Colors.onSurfaceVariant} style={{ marginRight: 8 }} />
            <Text variant="bodyMd" color={Colors.onSurfaceVariant}>
              {formatDateRangeText(dateFilter, customStart, customEnd)}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowDateSelector(!showDateSelector)}
            style={styles.changeDateBtn}
          >
            <Text variant="button" color={Colors.primary} style={{ marginRight: 4 }}>
              Change
            </Text>
            <MaterialIcons name="expand-more" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Date selector dropdown card */}
      {showDateSelector && (
        <View style={styles.dateSelectorCard}>
          <View style={styles.datePillsRow}>
            {(["today", "week", "month", "custom"] as const).map((type) => {
              const isActive = dateFilter === type;
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => {
                    setDateFilter(type);
                    if (type !== "custom") {
                      setShowDateSelector(false);
                    }
                  }}
                  style={[styles.datePill, isActive && styles.datePillActive]}
                >
                  <Text style={[styles.datePillText, isActive && styles.datePillTextActive]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {dateFilter === "custom" && (
            <View style={styles.customDateFields}>
              <View style={styles.customDateInputs}>
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
                <View style={{ width: 12 }} />
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
                style={styles.dateApplyBtn}
              >
                <Text variant="button" color={Colors.onPrimary}>
                  Apply Dates
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Title & Search bar Container */}
      <View style={styles.titleAndSearchContainer}>
        <Text variant="headlineLg" color={Colors.onSurface} style={styles.screenTitle}>
          Transactions
        </Text>
        <View style={styles.searchInputWrapper}>
          <MaterialIcons name="search" size={20} color={Colors.outline} style={styles.searchIcon} />
          <TextInput
            placeholder="Search transactions..."
            placeholderTextColor={Colors.outlineVariant}
            style={[styles.searchInput, { outlineStyle: "none" } as any]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <MaterialIcons name="cancel" size={18} color={Colors.outline} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main filters bar */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {/* ALL CHIP */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleClearFilters}
            style={[
              styles.filterChip,
              !selectedCategory && !selectedSource && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                !selectedCategory && !selectedSource && styles.filterChipTextActive,
              ]}
            >
              All
            </Text>
            <View
              style={[
                styles.filterCountBadge,
                !selectedCategory && !selectedSource
                  ? styles.filterCountBadgeActive
                  : styles.filterCountBadgeInactive,
              ]}
            >
              <Text
                style={[
                  styles.filterCountText,
                  !selectedCategory && !selectedSource
                    ? styles.filterCountTextActive
                    : styles.filterCountTextInactive,
                ]}
              >
                {filteredItemsCount}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.dividerLine} />

          {/* CATEGORY CHIP */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveFilterType(activeFilterType === "category" ? null : "category")}
            style={[styles.filterChip, selectedCategory !== null && styles.filterChipHighlight]}
          >
            <Text style={[styles.filterChipText, selectedCategory !== null && styles.filterChipTextHighlight]}>
              {selectedCategory ? selectedCategory.name : "Category"}
            </Text>
            <MaterialIcons
              name="keyboard-arrow-down"
              size={16}
              color={selectedCategory ? Colors.onPrimary : Colors.onSurfaceVariant}
            />
          </TouchableOpacity>

          {/* SOURCE CHIP */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveFilterType(activeFilterType === "source" ? null : "source")}
            style={[styles.filterChip, selectedSource !== null && styles.filterChipHighlight]}
          >
            <Text style={[styles.filterChipText, selectedSource !== null && styles.filterChipTextHighlight]}>
              {selectedSource ? (selectedSource === "manual" ? "Manual" : "SMS/UPI") : "Source"}
            </Text>
            <MaterialIcons
              name="keyboard-arrow-down"
              size={16}
              color={selectedSource ? Colors.onPrimary : Colors.onSurfaceVariant}
            />
          </TouchableOpacity>



          <View style={styles.dividerLine} />

          {/* CLEAR ALL ACTIONS */}
          {(selectedCategory !== null || selectedSource !== null || searchQuery !== "") && (
            <TouchableOpacity onPress={handleClearFilters} style={styles.clearChip}>
              <Text style={styles.clearChipText}>Clear filters</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Sub-filter expansion selectors */}
      {activeFilterType && (
        <View style={styles.subFilterBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subFilterScroll}
          >
            {/* CATEGORIES PICKER */}
            {activeFilterType === "category" &&
              categories.map((cat) => {
                const isSelected = selectedCategory?.id === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCategory(isSelected ? null : cat)}
                    style={[styles.subFilterPill, isSelected && styles.subFilterPillActive]}
                  >
                    <Text
                      style={[styles.subFilterPillText, isSelected && styles.subFilterPillTextActive]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}

            {/* SOURCE PICKER */}
            {activeFilterType === "source" &&
              (["manual", "sms"] as const).map((src) => {
                const isSelected = selectedSource === src;
                const label = src === "manual" ? "Manual" : "SMS / UPI";
                return (
                  <TouchableOpacity
                    key={src}
                    onPress={() => setSelectedSource(isSelected ? null : src)}
                    style={[styles.subFilterPill, isSelected && styles.subFilterPillActive]}
                  >
                    <Text
                      style={[styles.subFilterPillText, isSelected && styles.subFilterPillTextActive]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}


          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dateRangeBoxContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  dateRangeBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateRangeLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  changeDateBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateSelectorCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  datePillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  datePill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Rounded.full,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surface,
  },
  datePillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  datePillText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  datePillTextActive: {
    color: Colors.onPrimary,
  },
  customDateFields: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant,
  },
  customDateInputs: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dateApplyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Rounded.full,
    paddingVertical: 12,
    alignItems: "center",
  },
  titleAndSearchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  screenTitle: {
    marginBottom: 16,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Rounded.full,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.onSurface,
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Rounded.full,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surface,
  },
  filterChipHighlight: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginRight: 4,
  },
  filterChipTextHighlight: {
    color: Colors.onPrimary,
  },
  filterChipTextActive: {
    color: Colors.onPrimary,
  },
  filterCountBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    marginLeft: 4,
  },
  filterCountBadgeInactive: {
    backgroundColor: Colors.surfaceContainer,
  },
  filterCountBadgeActive: {
    backgroundColor: Colors.onPrimary,
  },
  filterCountText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
  },
  filterCountTextInactive: {
    color: Colors.onSurfaceVariant,
  },
  filterCountTextActive: {
    color: Colors.primary,
  },
  dividerLine: {
    width: 1,
    height: 24,
    backgroundColor: Colors.outlineVariant,
    marginHorizontal: 4,
  },
  clearChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearChipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.primary,
  },
  subFilterBar: {
    marginBottom: 12,
  },
  subFilterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  subFilterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Rounded.full,
    backgroundColor: Colors.surfaceContainerLow,
  },
  subFilterPillActive: {
    backgroundColor: Colors.secondaryContainer,
  },
  subFilterPillText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  subFilterPillTextActive: {
    color: Colors.onSecondaryContainer,
  },
});
