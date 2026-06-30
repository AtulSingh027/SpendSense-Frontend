declare module "@maniac-tech/react-native-expo-read-sms" {
  export function startReadSMS(
    callback: (status: string, sms: string, error: string) => void
  ): void;
  export function stopReadSMS(): void;
}
