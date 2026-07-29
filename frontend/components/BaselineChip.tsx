import { StyleSheet, Text, View } from "react-native";

import { ClinicalBaseline } from "@/types/clinicalBaseline";

interface Props {
  item: ClinicalBaseline;
}

export function BaselineChip({ item }: Props) {
  const isMedication = item.type.toLowerCase().includes("tratamiento");

  return (
    <View style={[styles.chip, isMedication ? styles.medication : styles.condition]}>
      <Text style={[styles.text, isMedication ? styles.medicationText : styles.conditionText]}>
        {item.concept}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },
  condition: { backgroundColor: "#DBEAFE" },
  medication: { backgroundColor: "#DCFCE7" },
  text: { fontSize: 13, fontWeight: "600" },
  conditionText: { color: "#1E40AF" },
  medicationText: { color: "#166534" },
});
