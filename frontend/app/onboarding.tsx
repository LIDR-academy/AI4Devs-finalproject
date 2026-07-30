import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { createPatient } from "@/services/healthRepository";
import { setStoredPatientId } from "@/services/patientStore";
import { Sex } from "@/types/patient";

const SEX_OPTIONS: Sex[] = ["Hombre", "Mujer", "Otro"];

function formatDateForApi(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateForDisplay(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${date.getFullYear()}`;
}

export default function Onboarding() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [sex, setSex] = useState<Sex | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = fullName.trim().length > 0 && sex !== null && dateOfBirth !== null;

  async function handleSubmit() {
    if (!canSubmit || !sex || !dateOfBirth) return;

    setSubmitting(true);
    try {
      const patient = await createPatient({
        fullName: fullName.trim(),
        sex,
        dateOfBirth: formatDateForApi(dateOfBirth),
      });
      await setStoredPatientId(patient.id);
      router.replace("/timeline");
    } catch {
      Alert.alert("Error", "No se pudo crear tu perfil. Comprueba tu conexión e inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>¿Quién eres?</Text>
      <Text style={styles.subtitle}>
        Necesitamos unos datos básicos antes de empezar a construir tu pasaporte médico.
      </Text>

      <Text style={styles.label}>Nombre completo</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre y apellidos"
        value={fullName}
        onChangeText={setFullName}
      />

      <Text style={styles.label}>Sexo</Text>
      <View style={styles.sexRow}>
        {SEX_OPTIONS.map((option) => (
          <Pressable
            key={option}
            style={[styles.sexOption, sex === option && styles.sexOptionSelected]}
            onPress={() => setSex(option)}
          >
            <Text style={[styles.sexOptionText, sex === option && styles.sexOptionTextSelected]}>
              {option}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Fecha de nacimiento</Text>
      <Pressable style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text style={dateOfBirth ? styles.dateText : styles.datePlaceholder}>
          {dateOfBirth ? formatDateForDisplay(dateOfBirth) : "dd/mm/aaaa"}
        </Text>
      </Pressable>
      {showDatePicker && (
        <DateTimePicker
          value={dateOfBirth ?? new Date(1990, 0, 1)}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={new Date()}
          onChange={(_event, selectedDate) => {
            setShowDatePicker(Platform.OS === "ios");
            if (selectedDate) setDateOfBirth(selectedDate);
          }}
        />
      )}

      <Pressable
        style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit || submitting}
      >
        <Text style={styles.submitButtonText}>{submitting ? "Guardando..." : "Continuar →"}</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 24, justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "700", color: "#0f172a", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#64748b", marginBottom: 32 },
  label: { fontSize: 13, fontWeight: "600", color: "#334155", marginBottom: 6, marginTop: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0f172a",
  },
  dateText: { fontSize: 15, color: "#0f172a" },
  datePlaceholder: { fontSize: 15, color: "#94a3b8" },
  sexRow: { flexDirection: "row", gap: 8 },
  sexOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  sexOptionSelected: { backgroundColor: "#1d4ed8", borderColor: "#1d4ed8" },
  sexOptionText: { fontSize: 14, color: "#334155" },
  sexOptionTextSelected: { color: "#fff", fontWeight: "700" },
  submitButton: {
    marginTop: 36,
    backgroundColor: "#1d4ed8",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitButtonDisabled: { backgroundColor: "#93c5fd" },
  submitButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
