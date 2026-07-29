import { ScrollView, StyleSheet, Text, View } from "react-native";

import { BaselineChip } from "@/components/BaselineChip";
import { ClinicalBaseline } from "@/types/clinicalBaseline";

interface Props {
  baseline: ClinicalBaseline[];
}

export function BaselineHeader({ baseline }: Props) {
  if (baseline.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>
          Aún no tienes condiciones crónicas ni medicación registrada.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {baseline.map((item) => (
          <BaselineChip key={item.id} item={item} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  row: { flexDirection: "row", flexWrap: "wrap" },
  emptyText: { color: "#94a3b8", fontSize: 13, paddingBottom: 12 },
});
