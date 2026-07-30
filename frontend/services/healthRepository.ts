import { httpClient } from "@/services/httpClient";
import { ClinicalBaseline } from "@/types/clinicalBaseline";
import { MedicalEvent } from "@/types/medicalEvent";
import { Passport } from "@/types/passport";
import { Patient, PatientCreateInput } from "@/types/patient";

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapPatient(raw: any): Patient {
  return {
    id: raw.id,
    fullName: raw.full_name,
    sex: raw.sex,
    dateOfBirth: raw.date_of_birth,
    email: raw.email ?? null,
  };
}

function mapBaseline(raw: any): ClinicalBaseline {
  return {
    id: raw.id,
    type: raw.type,
    concept: raw.concept,
    startDate: raw.start_date ?? null,
    details: raw.details ?? null,
  };
}

function mapEvent(raw: any): MedicalEvent {
  return {
    id: raw.id,
    title: raw.title,
    date: raw.date,
    type: raw.type,
    clinicalSummary: raw.clinical_summary,
    originalNotes: raw.original_notes ?? null,
    severity: raw.severity,
    doctor: raw.doctor ?? null,
    medicalCenter: raw.medical_center ?? null,
    department: raw.department ?? null,
    redFlag: raw.red_flag,
    alertJustification: raw.alert_justification ?? null,
  };
}

function mapPassport(raw: any): Passport {
  return {
    patientId: raw.patient_id,
    baseline: raw.baseline.map(mapBaseline),
    timeline: raw.timeline.map(mapEvent),
  };
}

export async function createPatient(input: PatientCreateInput): Promise<Patient> {
  const response = await httpClient.post("/patients", {
    full_name: input.fullName,
    sex: input.sex,
    date_of_birth: input.dateOfBirth,
  });
  return mapPatient(response.data);
}

export async function getPatient(patientId: string): Promise<Patient> {
  const response = await httpClient.get(`/patients/${patientId}`);
  return mapPatient(response.data);
}

export async function getPassport(patientId: string): Promise<Passport> {
  const response = await httpClient.get(`/patients/${patientId}/passport`);
  return mapPassport(response.data);
}

export async function processVoice(
  patientId: string,
  audioUri: string,
  filename: string
): Promise<void> {
  const formData = new FormData();
  formData.append("file", {
    uri: audioUri,
    name: filename,
    type: "audio/m4a",
  } as unknown as Blob);

  await httpClient.post(`/patients/${patientId}/process-voice`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function processDocument(
  patientId: string,
  imageBase64: string
): Promise<void> {
  await httpClient.post(`/patients/${patientId}/process-document`, {
    image_base64: imageBase64,
  });
}
