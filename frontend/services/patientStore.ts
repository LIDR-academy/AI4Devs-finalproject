import AsyncStorage from "@react-native-async-storage/async-storage";

const PATIENT_ID_KEY = "aenea.patientId";

export async function getStoredPatientId(): Promise<string | null> {
  return AsyncStorage.getItem(PATIENT_ID_KEY);
}

export async function setStoredPatientId(patientId: string): Promise<void> {
  await AsyncStorage.setItem(PATIENT_ID_KEY, patientId);
}

export async function clearStoredPatientId(): Promise<void> {
  await AsyncStorage.removeItem(PATIENT_ID_KEY);
}
