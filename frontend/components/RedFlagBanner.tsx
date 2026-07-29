import { StyleSheet, Text, View } from "react-native";

import { MedicalEvent } from "@/types/medicalEvent";

interface Props {
  timeline: MedicalEvent[];
}

export function RedFlagBanner({ timeline }: Props) {
  const flaggedEvent = timeline.find((event) => event.redFlag);
  if (!flaggedEvent) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚠ ATENCIÓN MÉDICA DE URGENCIA</Text>
      <Text style={styles.body}>{flaggedEvent.alertJustification}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FEE2E2",
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
  },
  title: { color: "#991B1B", fontWeight: "700", marginBottom: 4, fontSize: 13 },
  body: { color: "#7f1d1d", fontSize: 12 },
});
