import React, { useEffect, useRef } from "react";
import { Animated, DimensionValue, StyleSheet, View, ViewStyle } from "react-native";

interface SkeletonBoxProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonBox({ width = "100%", height = 16, borderRadius = 8, style }: SkeletonBoxProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const boxStyle: ViewStyle = {
    width,
    height,
    borderRadius,
    backgroundColor: "#20202B",
  };

  return (
    <Animated.View style={[boxStyle, style, { opacity }]} />
  );
}

export function DashboardSkeleton() {
  return (
    <View style={sk.root}>
      <View style={sk.statsRow}>
        <View style={sk.statCard}>
          <SkeletonBox width={80} height={12} borderRadius={6} />
          <SkeletonBox width={48} height={28} borderRadius={8} style={{ marginTop: 10 }} />
        </View>
        <View style={sk.statCard}>
          <SkeletonBox width={80} height={12} borderRadius={6} />
          <SkeletonBox width={48} height={28} borderRadius={8} style={{ marginTop: 10 }} />
        </View>
      </View>

      <View style={sk.card}>
        <View style={sk.cardRow}>
          <SkeletonBox width={44} height={44} borderRadius={12} />
          <View style={{ flex: 1, gap: 8 }}>
            <SkeletonBox width="60%" height={14} />
            <SkeletonBox width="40%" height={11} />
          </View>
        </View>
        <SkeletonBox width="100%" height={10} borderRadius={5} style={{ marginTop: 16 }} />
        <SkeletonBox width="70%" height={10} borderRadius={5} style={{ marginTop: 8 }} />
      </View>

      <View style={sk.card}>
        <View style={sk.cardRow}>
          <SkeletonBox width={44} height={44} borderRadius={12} />
          <View style={{ flex: 1, gap: 8 }}>
            <SkeletonBox width="70%" height={14} />
            <SkeletonBox width="45%" height={11} />
          </View>
        </View>
        <SkeletonBox width="100%" height={10} borderRadius={5} style={{ marginTop: 16 }} />
        <SkeletonBox width="55%" height={10} borderRadius={5} style={{ marginTop: 8 }} />
      </View>

      <View style={sk.card}>
        <View style={sk.cardRow}>
          <SkeletonBox width={44} height={44} borderRadius={12} />
          <View style={{ flex: 1, gap: 8 }}>
            <SkeletonBox width="50%" height={14} />
            <SkeletonBox width="35%" height={11} />
          </View>
        </View>
        <SkeletonBox width="100%" height={10} borderRadius={5} style={{ marginTop: 16 }} />
        <SkeletonBox width="80%" height={10} borderRadius={5} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

export function BotListSkeleton() {
  return (
    <View style={sk.root}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={sk.botCard}>
          <View style={sk.cardRow}>
            <SkeletonBox width={52} height={52} borderRadius={26} />
            <View style={{ flex: 1, gap: 10 }}>
              <SkeletonBox width="55%" height={14} />
              <SkeletonBox width="35%" height={11} />
            </View>
            <SkeletonBox width={36} height={36} borderRadius={18} />
          </View>
          <View style={sk.botActions}>
            <SkeletonBox width={90} height={34} borderRadius={12} />
            <SkeletonBox width={80} height={34} borderRadius={12} />
            <SkeletonBox width={38} height={34} borderRadius={12} />
          </View>
        </View>
      ))}
    </View>
  );
}

const sk = StyleSheet.create({
  root: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 14,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#13131D",
    borderWidth: 1,
    borderColor: "#20202B",
    borderRadius: 16,
    padding: 16,
  },
  card: {
    backgroundColor: "#13131D",
    borderWidth: 1,
    borderColor: "#20202B",
    borderRadius: 16,
    padding: 16,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  botCard: {
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 16,
    gap: 14,
  },
  botActions: {
    flexDirection: "row",
    gap: 8,
  },
});
