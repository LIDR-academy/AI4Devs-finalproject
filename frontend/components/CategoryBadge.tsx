import { StyleSheet, Text, View } from "react-native";

import { getCategoryColor, getCategoryLabel } from "@/components/categoryColors";

interface Props {
  type: string;
  redFlag?: boolean;
}

export function CategoryBadge({ type, redFlag = false }: Props) {
  const color = getCategoryColor(type);
  const label = getCategoryLabel(type, redFlag);

  return (
    <View style={[styles.badge, { backgroundColor: color.background }]}>
      <Text style={[styles.text, { color: color.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  text: { fontSize: 10, fontWeight: "700" },
});
