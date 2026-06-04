import type { AuditEvent, AuthUser, PatientCase, PatientSummary } from "@dotplot/shared";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export type LoginResult = {
  token: string;
  user: AuthUser;
};

export async function api<T>(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("dotplot-token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

export function login(email: string, password: string) {
  return api<LoginResult>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export function getPatients() {
  return api<PatientSummary[]>("/patients");
}

export function getPatient(id: string) {
  return api<PatientCase>(`/patients/${id}`);
}

export function savePatient(id: string, patient: Omit<PatientSummary, "id" | "createdAt" | "updatedAt">) {
  return api<PatientSummary>(`/patients/${id}`, {
    method: "PUT",
    body: JSON.stringify(patient)
  });
}

export function generateReport(patientId: string) {
  return api<{ id: string; body: string; createdAt: string }>("/reports", {
    method: "POST",
    body: JSON.stringify({ patientId })
  });
}

export function saveWardObservation(patientId: string) {
  return api<{ ok: boolean; syncStatus: string }>(`/ward-observations/${patientId}`, {
    method: "POST",
    body: JSON.stringify({
      temperatureC: 36.8,
      pulseBpm: 78,
      bloodPressure: "124/78",
      medicationDose: "5 mg",
      allergyUpdate: "No change"
    })
  });
}

export function getAuditEvents() {
  return api<AuditEvent[]>("/audit-events");
}
