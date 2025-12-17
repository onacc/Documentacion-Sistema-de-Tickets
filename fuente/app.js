const API_BASE = "http://localhost:3000/api";

const form = document.getElementById("ticketForm");
const btnEnviar = document.getElementById("btnEnviar");

const projectIdEl = document.getElementById("project_id");
const trackerIdEl = document.getElementById("tracker_id");
const priorityIdEl = document.getElementById("priority_id");
const subjectEl = document.getElementById("subject");
const descriptionEl = document.getElementById("description");

const msgEl = document.getElementById("msg");

function showMsg(text, type = "ok") {
  if (!msgEl) return;
  msgEl.style.display = "block";
  msgEl.className = `msg ${type}`;
  msgEl.textContent = text;
}

function hideMsg() {
  if (!msgEl) return;
  msgEl.style.display = "none";
  msgEl.textContent = "";
}

async function fetchProjects() {
  const res = await fetch(`${API_BASE}/projects`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  return data;
}

function fillProjectSelect(projectsData) {
  const projects = projectsData?.projects || [];
  const select = document.getElementById("project_id");
  if (!select) return;

  select.innerHTML = "";

  const opt0 = document.createElement("option");
  opt0.value = "";
  opt0.textContent = "Selecciona un proyecto";
  opt0.disabled = true;
  opt0.selected = true;
  select.appendChild(opt0);

  for (const p of projects) {
    const opt = document.createElement("option");
    opt.value = p.identifier;
    opt.textContent = p.name;
    select.appendChild(opt);
  }

}

async function loadProjects() {
  try {
    const data = await fetchProjects();
    fillProjectSelect(data);
  } catch (err) {
    showMsg(`No se pudieron cargar proyectos. ${err.message}`, "err");
    const select = document.getElementById("project_id");
    if (select) {
      select.innerHTML = `<option value="" disabled selected>Error cargando proyectos</option>`;
    }
  }
}

// Cargar proyectos al abrir la página
loadProjects();


async function createIssue(payload) {
  const res = await fetch(`${API_BASE}/issues`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const details = data?.details ? JSON.stringify(data.details) : (data?.error || "Error desconocido");
    throw new Error(`HTTP ${res.status}: ${details}`);
  }
  return data;
}

btnEnviar?.addEventListener("click", async () => {
  hideMsg();


  if (!subjectEl.value.trim()) {
    showMsg("El asunto es obligatorio.", "err");
    subjectEl.focus();
    return;
  }
  if (!trackerIdEl.value || !priorityIdEl.value) {
    showMsg("Selecciona un tipo para calcular tracker y prioridad.", "err");
    return;
  }

  const payload = {
    project_id: projectIdEl.value,                   // "proyecto-prueba" (identifier)
    tracker_id: Number(trackerIdEl.value),           // 1,2,3...
    priority_id: Number(priorityIdEl.value),         // 1..5
    subject: subjectEl.value.trim(),
    description: descriptionEl.value?.trim() || ""
  };

  try {
    btnEnviar.disabled = true;
    btnEnviar.style.cursor = "wait";

    const result = await createIssue(payload);

    const newId = result?.issue?.id;

    showMsg(newId ? `Ticket creado: #${newId}` : "Ticket creado correctamente.", "ok");

    form.reset();

    const tipoSelect = document.getElementById("tipo");
    if (tipoSelect) {
      tipoSelect.dispatchEvent(new Event("change"));
    }

  } catch (err) {
    showMsg(`No se pudo crear el ticket. ${err.message}`, "err");
  } finally {
    btnEnviar.disabled = false;
    btnEnviar.style.cursor = "";
  }
});
