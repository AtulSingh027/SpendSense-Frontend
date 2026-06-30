import { MaterialIcons } from "@expo/vector-icons";
import { type TransactionResponse } from "@/lib/transaction";

export function formatCurrency(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "₹0";
  return "₹" + num.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export function getFormattedDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function getDateRangeBounds(type: string, start?: string, end?: string) {
  const now = new Date();
  if (type === "today") {
    const todayStr = getFormattedDate(now);
    return { from: todayStr, to: todayStr };
  } else if (type === "week") {
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    return { from: getFormattedDate(weekAgo), to: getFormattedDate(now) };
  } else if (type === "month") {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: getFormattedDate(startOfMonth), to: getFormattedDate(now) };
  } else if (type === "custom" && start && end) {
    return { from: start, to: end };
  }
  return { from: undefined, to: undefined };
}

export function formatDateRangeText(type: string, start?: string, end?: string) {
  if (type === "today") return "Today";
  if (type === "week") return "This Week";
  if (type === "month") return "This Month";
  if (type === "custom" && start && end) {
    const formatDate = (str: string) => {
      const d = new Date(str);
      if (isNaN(d.getTime())) return str;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };
    return `${formatDate(start)} - ${formatDate(end)}`;
  }
  return "All Time";
}

export function getCategoryColor(name: string) {
  const normalized = name.toLowerCase();
  if (normalized.includes("food") || normalized.includes("dining") || normalized.includes("beverage")) {
    return { bg: "#bbe8e4", text: "#00342b" }; // Teal
  }
  if (normalized.includes("travel") || normalized.includes("ride") || normalized.includes("cab") || normalized.includes("uber")) {
    return { bg: "#f3e8ff", text: "#6b21a8" }; // Purple
  }
  if (normalized.includes("shop") || normalized.includes("amazon") || normalized.includes("grocer")) {
    return { bg: "#e0f2fe", text: "#0369a1" }; // Sky Blue
  }
  if (normalized.includes("bill") || normalized.includes("utilit") || normalized.includes("recharge")) {
    return { bg: "#fff3e0", text: "#e65100" }; // Orange
  }
  if (normalized.includes("salary") || normalized.includes("income") || normalized.includes("credit")) {
    return { bg: "#e8f5e9", text: "#2e7d32" }; // Green
  }
  return { bg: "#f0eded", text: "#3f4945" }; // Grey
}

export function getCategoryIcon(categoryName: string | null): keyof typeof MaterialIcons.glyphMap {
  const name = (categoryName || "").toLowerCase();
  if (name.includes("food") || name.includes("dining") || name.includes("beverage") || name.includes("starbucks")) {
    return "restaurant";
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
    return "payments";
  }
  return "payment";
}

export function getUpiBadgeText(app: string | null) {
  if (!app) return "";
  const norm = app.toLowerCase();
  if (norm.includes("gpay") || norm.includes("google")) return "G";
  if (norm.includes("phonepe")) return "P";
  if (norm.includes("paytm")) return "T";
  return "U";
}

export function getUpiBadgeColors(app: string | null) {
  if (!app) return { bg: "transparent", text: "transparent" };
  const norm = app.toLowerCase();
  if (norm.includes("gpay") || norm.includes("google")) {
    return { bg: "#e8f0fe", text: "#1967d2" };
  }
  if (norm.includes("phonepe")) {
    return { bg: "#f3e8ff", text: "#6b21a8" };
  }
  if (norm.includes("paytm")) {
    return { bg: "#e0f2fe", text: "#0369a1" };
  }
  return { bg: "#e5e2e1", text: "#3f4945" };
}

export interface GroupedTransactions {
  title: string;
  data: TransactionResponse[];
}

export function groupTransactionsByDate(items: TransactionResponse[]): GroupedTransactions[] {
  const todayList: TransactionResponse[] = [];
  const yesterdayList: TransactionResponse[] = [];
  const thisWeekList: TransactionResponse[] = [];
  const olderList: TransactionResponse[] = [];

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfToday.getDate() - 1);
  const startOfThisWeek = new Date(startOfToday);
  startOfThisWeek.setDate(startOfToday.getDate() - 7);

  items.forEach((item) => {
    const d = new Date(item.txn_timestamp);
    if (d >= startOfToday) {
      todayList.push(item);
    } else if (d >= startOfYesterday) {
      yesterdayList.push(item);
    } else if (d >= startOfThisWeek) {
      thisWeekList.push(item);
    } else {
      olderList.push(item);
    }
  });

  const groups: GroupedTransactions[] = [];
  if (todayList.length > 0) {
    groups.push({
      title: `Today, ${startOfToday.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      data: todayList,
    });
  }
  if (yesterdayList.length > 0) {
    groups.push({
      title: `Yesterday, ${startOfYesterday.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      data: yesterdayList,
    });
  }
  if (thisWeekList.length > 0) {
    groups.push({
      title: "This Week",
      data: thisWeekList,
    });
  }
  if (olderList.length > 0) {
    groups.push({
      title: "Older",
      data: olderList,
    });
  }

  return groups;
}
