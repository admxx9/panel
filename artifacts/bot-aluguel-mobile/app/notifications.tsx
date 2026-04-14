import { useListNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from "@workspace/api-client-react";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TYPE_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
  info:    { icon: "info",         color: "#3B82F6", bg: "#3B82F615" },
  success: { icon: "check-circle", color: "#22C55E", bg: "#22C55E15" },
  warning: { icon: "alert-triangle", color: "#F59E0B", bg: "#F59E0B15" },
  error:   { icon: "alert-circle", color: "#EF4444", bg: "#EF444415" },
  bot:     { icon: "cpu",          color: "#7C3AED", bg: "#7C3AED15" },
  coins:   { icon: "dollar-sign",  color: "#8B5CF6", bg: "#8B5CF615" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { data: notifications, isLoading, refetch, isRefetching } = useListNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();

  const paddingTop = Platform.OS === "web" ? insets.top + 48 : insets.top + 12;
  const list = (notifications as any[] | undefined) ?? [];
  const unreadCount = list.filter((n: any) => !n.read).length;

  const handleMarkAllRead = () => {
    markAllRead.mutate(undefined, { onSuccess: () => refetch() });
  };

  const handleMarkRead = (id: string) => {
    markRead.mutate({ id }, { onSuccess: () => refetch() });
  };

  return (
    <View style={s.root}>
      <View style={[s.header, { paddingTop }]}>
        <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={20} color="#EBEBF2" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Notificações</Text>
          {unreadCount > 0 && (
            <Text style={s.headerSub}>{unreadCount} não lida{unreadCount > 1 ? "s" : ""}</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <Pressable onPress={handleMarkAllRead} style={s.markAllBtn} hitSlop={8}>
            <Feather name="check-circle" size={14} color="#7C3AED" />
            <Text style={s.markAllText}>Ler tudo</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6D28D9" />}
      >
        {isLoading ? (
          <View style={s.loader}><ActivityIndicator color="#6D28D9" size="large" /></View>
        ) : list.length === 0 ? (
          <View style={s.emptyWrap}>
            <View style={s.emptyIcon}>
              <Feather name="bell-off" size={32} color="#4B4C6B" />
            </View>
            <Text style={s.emptyTitle}>Nenhuma notificação</Text>
            <Text style={s.emptySub}>Você será notificado sobre atualizações dos seus bots e conta.</Text>
          </View>
        ) : (
          list.map((notif: any, i: number) => {
            const cfg = TYPE_ICONS[notif.type] ?? TYPE_ICONS.info;
            return (
              <Pressable
                key={notif.id}
                style={[s.notifRow, !notif.read && s.notifUnread, i < list.length - 1 && s.notifBorder]}
                onPress={() => handleMarkRead(notif.id)}
              >
                <View style={[s.notifIcon, { backgroundColor: cfg.bg }]}>
                  <Feather name={cfg.icon as any} size={18} color={cfg.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={s.notifTitleRow}>
                    <Text style={s.notifTitle} numberOfLines={1}>{notif.title}</Text>
                    <Text style={s.notifTime}>{timeAgo(notif.createdAt)}</Text>
                  </View>
                  <Text style={s.notifBody} numberOfLines={2}>{notif.body}</Text>
                </View>
                {!notif.read && <View style={s.unreadDot} />}
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0C0C11" },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#20202B40",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#13131D",
    borderWidth: 1,
    borderColor: "#20202B",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, color: "#EBEBF2", fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 12, color: "#8E8E9E", fontFamily: "Inter_400Regular", marginTop: 2 },

  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#7C3AED15",
    borderWidth: 1,
    borderColor: "#7C3AED30",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  markAllText: { fontSize: 12, color: "#A78BFA", fontFamily: "Inter_600SemiBold" },

  loader: { paddingVertical: 80, alignItems: "center" },

  emptyWrap: { alignItems: "center", paddingTop: 100, paddingHorizontal: 40, gap: 12 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#13131D",
    borderWidth: 1,
    borderColor: "#20202B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 18, color: "#EBEBF2", fontFamily: "Inter_700Bold" },
  emptySub: { fontSize: 14, color: "#8E8E9E", fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },

  notifRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  notifUnread: {
    backgroundColor: "#7C3AED08",
  },
  notifBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#20202B40",
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  notifTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notifTitle: { fontSize: 14, color: "#EBEBF2", fontFamily: "Inter_600SemiBold", flex: 1, marginRight: 8 },
  notifTime: { fontSize: 11, color: "#8E8E9E", fontFamily: "Inter_400Regular" },
  notifBody: { fontSize: 13, color: "#8E8E9E", fontFamily: "Inter_400Regular", lineHeight: 18 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#7C3AED",
    marginTop: 6,
  },
});
