import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { CategoryBadge } from "@/components/CategoryBadge";
import { MedicalEvent } from "@/types/medicalEvent";

interface Props {
  event: MedicalEvent | null;
  onClose: () => void;
}

export function EventDetailModal({ event, onClose }: Props) {
  return (
    <Modal visible={event !== null} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {event && (
            <ScrollView contentContainerStyle={styles.content}>
              <View style={styles.headerRow}>
                <Text style={styles.date}>{event.date}</Text>
                <CategoryBadge type={event.type} redFlag={event.redFlag} />
              </View>
              <Text style={styles.title}>{event.title}</Text>
              <Text style={styles.sectionLabel}>Resumen clínico</Text>
              <Text style={styles.body}>{event.clinicalSummary}</Text>

              {event.originalNotes ? (
                <>
                  <Text style={styles.sectionLabel}>Notas originales</Text>
                  <Text style={styles.body}>{event.originalNotes}</Text>
                </>
              ) : null}

              <Text style={styles.sectionLabel}>Metadatos</Text>
              <Text style={styles.metaLine}>Severidad: {event.severity}</Text>
              {event.doctor ? <Text style={styles.metaLine}>Médico: {event.doctor}</Text> : null}
              {event.medicalCenter ? (
                <Text style={styles.metaLine}>Centro médico: {event.medicalCenter}</Text>
              ) : null}
              {event.department ? (
                <Text style={styles.metaLine}>Departamento: {event.department}</Text>
              ) : null}
            </ScrollView>
          )}
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    padding: 20,
  },
  content: { paddingBottom: 12 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  date: { fontWeight: "700", fontSize: 14, color: "#0f172a" },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: "#0f172a" },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: "#64748b", marginTop: 12, marginBottom: 4 },
  body: { fontSize: 14, color: "#334155", lineHeight: 20 },
  metaLine: { fontSize: 13, color: "#475569", marginBottom: 2 },
  closeButton: {
    marginTop: 16,
    backgroundColor: "#1d4ed8",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  closeButtonText: { color: "#fff", fontWeight: "700" },
});
