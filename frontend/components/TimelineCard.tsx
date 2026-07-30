import { Pressable, StyleSheet, Text, View } from "react-native";

import { CategoryBadge } from "@/components/CategoryBadge";
import { MedicalEvent } from "@/types/medicalEvent";

interface Props {
  event: MedicalEvent;
  onPress: (event: MedicalEvent) => void;
}

export function TimelineCard({ event, onPress }: Props) {
  const location = [event.medicalCenter, event.doctor].filter(Boolean).join(" | ");

  return (
    <Pressable
      style={[styles.card, event.redFlag && styles.cardRedFlag]}
      onPress={() => onPress(event)}
    >
      <View style={styles.headerRow}>
        <Text style={styles.date}>{event.date}</Text>
        <CategoryBadge type={event.type} redFlag={event.redFlag} />
      </View>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.summary} numberOfLines={3}>
        {event.clinicalSummary}
      </Text>
      {location ? <Text style={styles.location}>📍 {location}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#cbd5e1",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  cardRedFlag: { borderLeftColor: "#DC2626" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  date: { fontWeight: "700", fontSize: 13, color: "#0f172a" },
  title: { fontWeight: "700", fontSize: 15, marginBottom: 4, color: "#0f172a" },
  summary: { fontSize: 13, color: "#334155" },
  location: { fontSize: 12, color: "#64748b", fontStyle: "italic", marginTop: 6 },
});
