import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, ClipboardList, FileText, LogOut, ShieldCheck } from "lucide-react";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import type { AuthUser, LesionAnnotation, PatientCase } from "@dotplot/shared";
import { generateReport, getAuditEvents, getPatient, getPatients, login, savePatient, saveWardObservation } from "./lib/api";
import { TorsoMap } from "./components/TorsoMap";
import "./styles.css";

const queryClient = new QueryClient();

function LoginScreen({ onLogin }: { onLogin: (user: AuthUser) => void }) {
  const [email, setEmail] = useState("radiologist@dotplot.test");
  const [password, setPassword] = useState("Dotplot123!");
  const mutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: ({ token, user }) => {
      localStorage.setItem("dotplot-token", token);
      onLogin(user);
    }
  });

  return (
    <main className="login-screen">
      <section className="login-panel">
        <span className="brand-mark">D</span>
        <h1>Dotplot</h1>
        <p>Synthetic PACS-EMR clinical workspace for breast-cancer case review.</p>
        <label>Email<input value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        <button type="button" onClick={() => mutation.mutate()}>Sign in</button>
        {mutation.error ? <p className="error">{mutation.error.message}</p> : null}
      </section>
    </main>
  );
}

function CaseWorkspace({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>();
  const [activeTab, setActiveTab] = useState<"overview" | "ward" | "audit">("overview");
  const queryClient = useQueryClient();
  const patients = useQuery({ queryKey: ["patients"], queryFn: getPatients });
  const selectedId = selectedPatientId ?? patients.data?.[0]?.id;
  const patient = useQuery({
    queryKey: ["patient", selectedId],
    queryFn: () => getPatient(selectedId ?? ""),
    enabled: Boolean(selectedId)
  });
  const audit = useQuery({ queryKey: ["audit"], queryFn: getAuditEvents, enabled: user.role === "IT_ADMIN" });
  const [activeLesion, setActiveLesion] = useState<LesionAnnotation>();

  const visibleLesion = activeLesion ?? patient.data?.lesionAnnotations[0];
  const canEdit = user.role === "RADIOLOGIST" || user.role === "IT_ADMIN";
  const canReport = user.role === "RADIOLOGIST";
  const canSaveWard = user.role === "NURSE";

  const updatePatient = useMutation({
    mutationFn: (caseData: PatientCase) => savePatient(caseData.id, {
      patientCode: caseData.patientCode,
      nhsNumber: caseData.nhsNumber,
      name: caseData.name,
      age: caseData.age,
      allergies: caseData.allergies,
      medications: caseData.medications,
      diagnosis: caseData.diagnosis,
      birads: caseData.birads
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["patients"] })
  });

  const reportMutation = useMutation({
    mutationFn: () => generateReport(selectedId ?? "")
  });
  const wardMutation = useMutation({
    mutationFn: () => saveWardObservation(selectedId ?? "")
  });

  const caseMeta = useMemo(() => {
    if (!patient.data) return "";
    return `${patient.data.age} years | NHS ${patient.data.nhsNumber} | ${patient.data.birads}`;
  }, [patient.data]);

  if (!selectedId || !patient.data) {
    return <p className="loading">Loading clinical workspace...</p>;
  }

  return (
    <main className="app-shell">
      <aside className="patient-rail">
        <div className="brand-row">
          <span className="brand-mark">D</span>
          <div><strong>Dotplot</strong><span>{user.role.replace("_", " ")}</span></div>
        </div>
        {patients.data?.map((item) => (
          <button
            className={`patient-card ${item.id === selectedId ? "active" : ""}`}
            key={item.id}
            type="button"
            onClick={() => {
              setSelectedPatientId(item.id);
              setActiveLesion(undefined);
            }}
          >
            <strong>{item.name}</strong>
            <span>{item.patientCode} | {item.birads}</span>
          </button>
        ))}
      </aside>
      <section className="workspace">
        <header className="topbar">
          <div>
            <h1>{patient.data.name}</h1>
            <p>{caseMeta}</p>
          </div>
          <div className="actions">
            <button type="button" onClick={() => setActiveTab("overview")}><Activity size={17} /> Overview</button>
            <button type="button" onClick={() => setActiveTab("ward")}><ClipboardList size={17} /> Ward</button>
            <button type="button" onClick={() => setActiveTab("audit")}><ShieldCheck size={17} /> Audit</button>
            <button type="button" onClick={onLogout}><LogOut size={17} /> Logout</button>
          </div>
        </header>

        {activeTab === "overview" ? (
          <section className="case-grid">
            <section className="panel">
              <h2>Structured EMR</h2>
              <div className="field-grid">
                <span>Allergies<strong>{patient.data.allergies}</strong></span>
                <span>Medications<strong>{patient.data.medications}</strong></span>
                <span>Diagnosis<strong>{patient.data.diagnosis}</strong></span>
                <span>Matched scan<strong>{patient.data.imagingStudies[0]?.scanCode ?? "No scan"}</strong></span>
              </div>
              <div className="actions">
                <button type="button" disabled={!canEdit} onClick={() => updatePatient.mutate(patient.data)}>Save EMR</button>
                <button type="button" disabled={!canReport} onClick={() => reportMutation.mutate()}><FileText size={17} /> Generate report</button>
              </div>
              {reportMutation.data ? <pre className="report-preview">{reportMutation.data.body}</pre> : null}
            </section>
            <section className="panel">
              <h2>Torso lesion map</h2>
              <div className="torso-layout">
                <TorsoMap
                  lesions={patient.data.lesionAnnotations}
                  activeId={visibleLesion?.id}
                  onSelect={setActiveLesion}
                />
                <div className="scan-preview">
                  <div className="ultrasound" style={{ "--x": `${visibleLesion?.previewX ?? 50}%`, "--y": `${visibleLesion?.previewY ?? 50}%` } as CSSProperties}>
                    <div className="scan-lesion" />
                  </div>
                  <dl>
                    <dt>Coordinate</dt><dd>{visibleLesion?.breast} {visibleLesion?.quadrant}</dd>
                    <dt>Clock face</dt><dd>{visibleLesion?.clockFace}, {visibleLesion?.distanceFromNipple}</dd>
                    <dt>Risk</dt><dd>{visibleLesion?.birads}</dd>
                  </dl>
                </div>
              </div>
            </section>
          </section>
        ) : null}

        {activeTab === "ward" ? (
          <section className="panel narrow">
            <h2>Two-tap ward note</h2>
            <p>Server validation rejects unsafe medication units and stores a sync-ready audit event.</p>
            <button type="button" disabled={!canSaveWard} onClick={() => wardMutation.mutate()}>Save validated ward observation</button>
            {wardMutation.data ? <p className="success">Saved: {wardMutation.data.syncStatus}</p> : null}
            {!canSaveWard ? <p className="error">Only nurse users can save ward observations.</p> : null}
          </section>
        ) : null}

        {activeTab === "audit" ? (
          <section className="panel narrow">
            <h2>Server-side audit trail</h2>
            {user.role !== "IT_ADMIN" ? <p className="error">Only IT admins can view audit events.</p> : null}
            {audit.data?.map((event) => (
              <div className="audit-row" key={event.id}>
                <strong>{new Date(event.createdAt).toLocaleString()}</strong>
                <span>{event.role}</span>
                <span>{event.action}</span>
              </div>
            ))}
          </section>
        ) : null}
      </section>
    </main>
  );
}

function AppInner() {
  const [user, setUser] = useState<AuthUser | null>(null);
  if (!user) return <LoginScreen onLogin={setUser} />;
  return <CaseWorkspace user={user} onLogout={() => {
    localStorage.removeItem("dotplot-token");
    setUser(null);
  }} />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
