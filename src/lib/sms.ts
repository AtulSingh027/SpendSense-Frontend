import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "./api";

let SmsAndroid: any;
if (Platform.OS === "android") {
  try {
    const mod = require("react-native-get-sms-android");
    SmsAndroid = mod.default || mod;
  } catch (e) {
    console.warn("react-native-get-sms-android failed to load:", e);
  }
}

export interface IngestSMSItem {
  sender_id: string;
  raw_text: string;
  received_at: string;
}

const TRANSACTIONAL_KEYWORDS = [
  "spent",
  "debited",
  "withdrawn",
  "payment",
  "sent to",
  "transfer",
  "txn",
  "upi",
  "credited",
  "received",
  "deposited",
  "remitted",
  "paytm",
  "gpay",
  "phonepe",
  "amazonpay",
  "a/c",
  "acct",
  "account",
  "bank",
  "card",
  "charge",
];

const LAST_SYNC_KEY = "spendsense:last_sms_sync_ts";
const FIRST_SYNC_LOOKBACK_DAYS = 30; // first-ever sync pulls last 30 days, not all-time

export async function getLastSyncTimestamp(): Promise<number> {
  const stored = await AsyncStorage.getItem(LAST_SYNC_KEY);
  if (stored) return parseInt(stored, 10);
  return Date.now() - FIRST_SYNC_LOOKBACK_DAYS * 24 * 60 * 60 * 1000;
}

export async function setLastSyncTimestamp(ts: number): Promise<void> {
  await AsyncStorage.setItem(LAST_SYNC_KEY, ts.toString());
}

export function isPersonalSender(sender: string): boolean {
  // Alphanumeric headers of financial/company SMS (e.g. VM-HDFCBK) do not look like standard mobile numbers.
  // Standard mobile phone numbers contain only digits (optionally starting with +) and are usually >= 10 digits long.
  const cleanSender = sender.replace(/[\s-+]/g, "");
  if (/^\d+$/.test(cleanSender) && cleanSender.length >= 10) {
    return true;
  }
  return false;
}

export function isTransactionalSMS(sender: string, body: string): boolean {
  if (isPersonalSender(sender)) return false;

  const lowerBody = body.toLowerCase();

  // 1. Check if the message contains an amount pattern (e.g. Rs 500, Rs. 1,000, INR 150.50)
  const hasAmount = /(?:Rs\.?|INR)\s?([\d,]+\.?\d*)/i.test(body);
  if (!hasAmount) return false;

  // 2. Check if the message contains transaction indicators matching backend parsers
  // These include: debited, credited, debit, credit, Dr, Cr, spent, withdrawn
  const hasTxnIndicator = /(debited|credited|debit|credit|\bdr\b|\bcr\b|spent|withdrawn)/i.test(lowerBody);
  
  return hasTxnIndicator;
}

export async function fetchAndSyncSMS(maxCount: number = 300): Promise<{
  total_received: number;
  processed: number;
  parsed_count: number;
  failed_count: number;
  duplicate_count: number;
} | null> {
  if ((Platform.OS !== "android" && Platform.OS !== "web") || !SmsAndroid) {
    console.log("SMS sync is only supported on Android devices.");
    return null;
  }

  const sinceTs = await getLastSyncTimestamp();

  const filter = {
    box: "inbox",
    maxCount,
    minDate: sinceTs,
  };

  return new Promise((resolve, reject) => {
    SmsAndroid.list(
      JSON.stringify(filter),
      (fail: string) => {
        console.error("Failed to fetch SMS inbox:", fail);
        reject(new Error(fail));
      },
      async (count: number, smsListStr: string) => {
        try {
          const smsList = JSON.parse(smsListStr) as Array<{
            _id: string;
            address: string;
            body: string;
            date: number; // Unix timestamp in ms
          }>;

          const transactionalSMSList: IngestSMSItem[] = [];

          for (const sms of smsList) {
            const sender = sms.address || "";
            const body = sms.body || "";

            if (isTransactionalSMS(sender, body)) {
              const received_at = new Date(sms.date).toISOString();
              transactionalSMSList.push({
                sender_id: sender,
                raw_text: body,
                received_at,
              });
            }
          }

          console.log(
            `Found ${transactionalSMSList.length} transactional SMS messages out of ${smsList.length} total.`
          );

          if (transactionalSMSList.length === 0) {
            resolve({
              total_received: 0,
              processed: 0,
              parsed_count: 0,
              failed_count: 0,
              duplicate_count: 0,
            });
            return;
          }

          const { data } = await apiClient.post("/sms/ingest/bulk", {
            sms_list: transactionalSMSList,
          });

          // Advance timestamp to the newest SMS actually included in this batch + 1ms
          const smsDates = smsList.map((sms) => sms.date);
          if (smsDates.length > 0) {
            const maxDate = Math.max(...smsDates);
            await setLastSyncTimestamp(maxDate + 1);
          }

          resolve(data);
        } catch (err) {
          console.error("Error processing/syncing SMS list:", err);
          reject(err);
        }
      }
    );
  });
}
