const STORAGE_KEY = "dotplot-patients-v1";
const AUDIT_KEY = "dotplot-audit-v1";

const seedPatients = [
  {
    id: "DTP-1007",
    nhs: "485 777 2102",
    name: "Maya Patel",
    age: 52,
    allergies: "Penicillin",
    medications: "Tamoxifen 20 mg daily",
    diagnosis: "Suspicious irregular hypoechoic lesion",
    birads: "BI-RADS 4B",
    scanId: "US-L-4421",
    lesion: {
      breast: "Left breast",
      quadrant: "Upper-outer quadrant",
      clock: "2 o'clock",
      distance: "4 cm from nipple",
      x: 107,
      y: 207,
      previewX: "43%",
      previewY: "45%"
    }
  },
  {
    id: "DTP-1012",
    nhs: "622 140 9348",
    name: "Lina Chen",
    age: 47,
    allergies: "None recorded",
    medications: "Amlodipine 5 mg daily",
    diagnosis: "Probably benign circumscribed mass",
    birads: "BI-RADS 3",
    scanId: "US-R-1088",
    lesion: {
      breast: "Right breast",
      quadrant: "Lower-inner quadrant",
      clock: "5 o'clock",
      distance: "2 cm from nipple",
      x: 209,
      y: 260,
      previewX: "55%",
      previewY: "52%"
    }
  },
  {
    id: "DTP-1020",
    nhs: "700 218 6124",
    name: "Ruth Williams",
    age: 61,
    allergies: "Latex",
    medications: "Letrozole 2.5 mg daily",
    diagnosis: "Highly suggestive malignant spiculated lesion",
    birads: "BI-RADS 5",
    scanId: "US-L-8894",
    lesion: {
      breast: "Left breast",
      quadrant: "Retroareolar",
      clock: "12 o'clock",
      distance: "1 cm from nipple",
      x: 133,
      y: 222,
      previewX: "49%",
      previewY: "43%"
    }
  }
];

let patients = load(STORAGE_KEY, seedPatients);
let audit = load(AUDIT_KEY, []);
let selectedId = patients[0]?.id;
let activeLesionId = selectedId;

const form = document.querySelector("#patientForm");
const wardForm = document.querySelector("#wardForm");
const patientList = document.querySelector("#patientList");
const lesionDots = document.querySelector("#lesionDots");
const lesionDetails = document.querySelector("#lesionDetails");
const preview = document.querySelector("#ultrasoundPreview");
const syncBadge = document.querySelector("#syncBadge");

function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  localStorage.setItem(AUDIT_KEY, JSON.stringify(audit.slice(0, 50)));
}

function currentPatient() {
  return patients.find((patient) => patient.id === selectedId) ?? patients[0];
}

function addAudit(action, patientId = selectedId) {
  audit.unshift({
    at: new Date().toLocaleString("en-GB"),
    role: document.querySelector("#roleSelect").value,
    action,
    patientId
  });
  persist();
  renderAudit();
}

function renderPatients() {
  const query = document.querySelector("#searchInput").value.toLowerCase();
  const filtered = patients.filter((patient) => {
    return [patient.name, patient.id, patient.birads, patient.scanId].join(" ").toLowerCase().includes(query);
  });
  patientList.innerHTML = filtered.map((patient) => `
    <button class="patient-card ${patient.id === selectedId ? "active" : ""}" type="button" data-id="${patient.id}">
      <strong>${patient.name}</strong>
      <span>${patient.id} | ${patient.birads}</span>
      <span>${patient.lesion.breast}, ${patient.lesion.clock}</span>
    </button>
  `).join("");
}

function fillForm(patient) {
  for (const [key, value] of Object.entries(patient)) {
    if (form.elements[key]) {
      form.elements[key].value = value;
    }
  }
}

function renderHeader(patient) {
  document.querySelector("#patientTitle").textContent = `${patient.name} | ${patient.id}`;
  document.querySelector("#patientSubtitle").textContent = `${patient.age} years | NHS ${patient.nhs} | Scan ${patient.scanId} | ${patient.birads}`;
  syncBadge.textContent = patient.scanId ? "PACS matched" : "PACS missing";
  syncBadge.classList.toggle("warning", !patient.scanId);
}

function renderLesions(patient) {
  lesionDots.innerHTML = patients.map((item) => `
    <g class="lesion-dot ${item.id === patient.id ? "active" : ""}" data-id="${item.id}" tabindex="0" role="button" aria-label="${item.name} lesion">
      <circle cx="${item.lesion.x}" cy="${item.lesion.y}" r="13"></circle>
      <text x="${item.lesion.x + 18}" y="${item.lesion.y + 5}">${item.birads.replace("BI-RADS ", "B")}</text>
    </g>
  `).join("");
  renderLesionDetails(patient);
}

function renderLesionDetails(patient) {
  activeLesionId = patient.id;
  preview.style.setProperty("--lesion-x", patient.lesion.previewX);
  preview.style.setProperty("--lesion-y", patient.lesion.previewY);
  lesionDetails.innerHTML = `
    <dt>Scan ID</dt><dd>${patient.scanId}</dd>
    <dt>Coordinate</dt><dd>${patient.lesion.breast}, ${patient.lesion.quadrant}</dd>
    <dt>Clock face</dt><dd>${patient.lesion.clock}, ${patient.lesion.distance}</dd>
    <dt>Diagnosis</dt><dd>${patient.diagnosis}</dd>
    <dt>Risk rating</dt><dd>${patient.birads}</dd>
  `;
  document.querySelectorAll(".lesion-dot").forEach((dot) => dot.classList.toggle("active", dot.dataset.id === patient.id));
}

function renderAudit() {
  document.querySelector("#auditLog").innerHTML = audit.length ? audit.map((entry) => `
    <div class="audit-row">
      <strong>${entry.at}</strong>
      <span>${entry.role}</span>
      <span>${entry.action} (${entry.patientId})</span>
    </div>
  `).join("") : "<p>No audit events yet.</p>";
}

function renderAll() {
  const patient = currentPatient();
  if (!patient) return;
  selectedId = patient.id;
  renderPatients();
  fillForm(patient);
  renderHeader(patient);
  renderLesions(patient);
  renderAudit();
}

function savePatient() {
  const data = Object.fromEntries(new FormData(form).entries());
  const patient = currentPatient();
  const updated = {
    ...patient,
    ...data,
    age: Number(data.age),
    scanId: patient.scanId || `US-${data.id.replace("DTP-", "")}`,
    lesion: patient.lesion
  };
  patients = patients.map((item) => item.id === patient.id ? updated : item);
  selectedId = updated.id;
  addAudit("Updated structured EMR fields", updated.id);
  renderAll();
}

function newPatient() {
  const nextNumber = 1000 + patients.length + 1;
  const patient = {
    id: `DTP-${nextNumber}`,
    nhs: "000 000 0000",
    name: "New patient",
    age: 45,
    allergies: "Unknown",
    medications: "None recorded",
    diagnosis: "Pending radiology review",
    birads: "BI-RADS 3",
    scanId: `US-NEW-${nextNumber}`,
    lesion: {
      breast: "Left breast",
      quadrant: "Upper-outer quadrant",
      clock: "2 o'clock",
      distance: "3 cm from nipple",
      x: 116,
      y: 205,
      previewX: "47%",
      previewY: "47%"
    }
  };
  patients.unshift(patient);
  selectedId = patient.id;
  addAudit("Created patient record", patient.id);
  renderAll();
}

function deletePatient() {
  if (patients.length <= 1) return;
  const patient = currentPatient();
  patients = patients.filter((item) => item.id !== patient.id);
  selectedId = patients[0].id;
  addAudit("Deleted patient record", patient.id);
  renderAll();
}

function saveWardNote() {
  const data = Object.fromEntries(new FormData(wardForm).entries());
  const doseLooksUnsafe = data.dose && !/^\d+(\.\d+)?\s?(mg|microgram|mcg|µg)$/i.test(data.dose.trim());
  const message = document.querySelector("#validationMessage");
  if (doseLooksUnsafe) {
    message.textContent = "Dose must include a recognised unit: mg, mcg, microgram, or µg.";
    return;
  }
  message.textContent = "Ward note saved locally and queued for sync.";
  addAudit("Saved ward observations");
}

function generateReport() {
  const patient = currentPatient();
  document.querySelector("#reportContent").innerHTML = `
    <p><strong>Patient:</strong> ${patient.name} (${patient.id})</p>
    <p><strong>NHS:</strong> ${patient.nhs} | <strong>Age:</strong> ${patient.age}</p>
    <p><strong>Allergies:</strong> ${patient.allergies}</p>
    <p><strong>Medications:</strong> ${patient.medications}</p>
    <p><strong>Matched ultrasound:</strong> ${patient.scanId}</p>
    <p><strong>Lesion coordinate:</strong> ${patient.lesion.breast}, ${patient.lesion.quadrant}, ${patient.lesion.clock}, ${patient.lesion.distance}</p>
    <p><strong>Diagnosis:</strong> ${patient.diagnosis}</p>
    <p><strong>Risk rating:</strong> ${patient.birads}</p>
    <p><strong>Generated:</strong> ${new Date().toLocaleString("en-GB")}</p>
  `;
  addAudit("Generated printable patient report");
  window.print();
}

patientList.addEventListener("click", (event) => {
  const card = event.target.closest(".patient-card");
  if (!card) return;
  selectedId = card.dataset.id;
  addAudit("Opened patient case", selectedId);
  renderAll();
});

lesionDots.addEventListener("mouseover", (event) => {
  const dot = event.target.closest(".lesion-dot");
  if (!dot) return;
  const patient = patients.find((item) => item.id === dot.dataset.id);
  if (patient) renderLesionDetails(patient);
});

lesionDots.addEventListener("click", (event) => {
  const dot = event.target.closest(".lesion-dot");
  if (!dot) return;
  selectedId = dot.dataset.id;
  addAudit("Opened scan from torso coordinate", selectedId);
  renderAll();
});

document.querySelector("#searchInput").addEventListener("input", renderPatients);
document.querySelector("#saveBtn").addEventListener("click", savePatient);
document.querySelector("#newPatientBtn").addEventListener("click", newPatient);
document.querySelector("#deleteBtn").addEventListener("click", deletePatient);
document.querySelector("#wardSaveBtn").addEventListener("click", saveWardNote);
document.querySelector("#reportBtn").addEventListener("click", generateReport);
document.querySelector("#roleSelect").addEventListener("change", () => addAudit("Changed active role"));

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    document.querySelector(`#${tab.dataset.tab}Tab`).classList.add("active");
  });
});

if (!audit.length) {
  addAudit("Started Dotplot pilot session");
}
renderAll();
