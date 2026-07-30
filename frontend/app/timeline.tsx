import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BaselineHeader } from "@/components/BaselineHeader";
import { EventDetailModal } from "@/components/EventDetailModal";
import { FloatingMicButton } from "@/components/FloatingMicButton";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { RedFlagBanner } from "@/components/RedFlagBanner";
import { TimelineCard } from "@/components/TimelineCard";
import { UploadDocumentButton } from "@/components/UploadDocumentButton";
import {
  getPassport,
  getPatient,
  processDocument,
  processVoice,
} from "@/services/healthRepository";
import { exportPassportPdf } from "@/services/pdfExportService";
import { getStoredPatientId } from "@/services/patientStore";
import { MedicalEvent } from "@/types/medicalEvent";
import { Passport } from "@/types/passport";
import { Patient } from "@/types/patient";

export default function Timeline() {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [passport, setPassport] = useState<Passport | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<MedicalEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>();

  const loadPassport = useCallback(async () => {
    const patientId = await getStoredPatientId();
    if (!patientId) {
      router.replace("/onboarding");
      return;
    }

    try {
      const [patientData, passportData] = await Promise.all([
        getPatient(patientId),
        getPassport(patientId),
      ]);
      setPatient(patientData);
      setPassport(passportData);
    } catch {
      Alert.alert("Error", "No se pudo cargar tu pasaporte médico.");
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      loadPassport();
    }, [loadPassport])
  );

  async function handleVoiceRecorded(uri: string) {
    if (!patient) return;
    setLoadingMessage("Transcribiendo y estructurando tu nota de voz...");
    setLoading(true);
    try {
      await processVoice(patient.id, uri, "nota.m4a");
      await loadPassport();
    } catch {
      Alert.alert("Error", "No se pudo procesar la nota de voz.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDocumentCaptured(imageBase64: string) {
    if (!patient) return;
    setLoadingMessage("Analizando el documento...");
    setLoading(true);
    try {
      await processDocument(patient.id, imageBase64);
      await loadPassport();
    } catch {
      Alert.alert("Error", "No se pudo procesar el documento.");
    } finally {
      setLoading(false);
    }
  }

  async function handleExportPdf() {
    if (!patient || !passport) return;
    setLoadingMessage("Generando pasaporte PDF...");
    setLoading(true);
    try {
      await exportPassportPdf(patient, passport);
    } catch {
      Alert.alert("Error", "No se pudo generar el PDF.");
    } finally {
      setLoading(false);
    }
  }

  if (!passport) {
    return <LoadingOverlay visible message="Cargando tu historial..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topBar}>
        <Text style={styles.greeting}>Hola, {patient?.fullName.split(" ")[0]}</Text>
        <Pressable style={styles.exportButton} onPress={handleExportPdf}>
          <Text style={styles.exportButtonText}>Exportar Pasaporte</Text>
        </Pressable>
      </View>

      <BaselineHeader baseline={passport.baseline} />
      <RedFlagBanner timeline={passport.timeline} />

      <FlatList
        data={passport.timeline}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <TimelineCard event={item} onPress={setSelectedEvent} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Aún no hay episodios. Dicta tu primera nota de voz para empezar.
          </Text>
        }
      />

      <FloatingMicButton onRecorded={handleVoiceRecorded} disabled={loading} />
      <UploadDocumentButton onCaptured={handleDocumentCaptured} disabled={loading} />
      <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      <LoadingOverlay visible={loading} message={loadingMessage} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  greeting: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  exportButton: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exportButtonText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  list: { paddingBottom: 100, paddingTop: 8 },
  emptyText: {
    textAlign: "center",
    color: "#94a3b8",
    marginTop: 48,
    paddingHorizontal: 32,
  },
});
