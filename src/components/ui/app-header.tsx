import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { Colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import { getCurrentUserId } from "@/lib/auth";
import { fetchUserProfile } from "@/lib/user";
import { Text } from "./text";

export function AppHeader() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [initials, setInitials] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    async function loadUser() {
      try {
        const id = await getCurrentUserId();
        if (id && active) {
          setUserId(id);
          const profile = await fetchUserProfile(id);
          if (profile && active) {
            setImageUrl(profile.image_url);
            if (profile.full_name) {
              const parts = profile.full_name.trim().split(/\s+/);
              const init = parts.map(p => p[0]).join("").toUpperCase().substring(0, 2);
              setInitials(init || "?");
            } else {
              setInitials("U");
            }
          }
        }
      } catch (err) {
        console.error("Failed to load user info in AppHeader:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadUser();
    return () => {
      active = false;
    };
  }, []);

  const handlePressAvatar = () => {
    if (userId) {
      router.push(`/user/${userId}`);
    } else {
      getCurrentUserId().then(id => {
        if (id) {
          router.push(`/user/${id}`);
        }
      });
    }
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.avatarPlaceholder}
        activeOpacity={0.7}
        onPress={handlePressAvatar}
      >
        {loading ? (
          <ActivityIndicator size="small" color={Colors.onPrimary} />
        ) : imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.avatarImage} />
        ) : initials ? (
          <Text variant="button" color={Colors.onPrimary} style={styles.avatarText}>
            {initials}
          </Text>
        ) : (
          <MaterialIcons name="person" size={20} color={Colors.onPrimary} />
        )}
      </TouchableOpacity>
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/wordmark.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <MaterialIcons name="notifications-none" size={24} color={Colors.onSurfaceVariant} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "700",
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 28,
  },
});
