const EDIT_PASSWORD = "CSAI.clubss";
const STORAGE_KEY = "scheduleEntries";

const monthLabel = document.getElementById("monthLabel");
const calendarGrid = document.getElementById("calendarGrid");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

const overlay = document.getElementById("overlay");
const detailPanel = document.getElementById("detailPanel");
const panelDate = document.getElementById("panelDate");
const panelText = document.getElementById("panelText");
const panelEmpty = document.getElementById("panelEmpty");
const editBtn = document.getElementById("editBtn");
const deleteBtn = document.getElementById("deleteBtn");
const closePanel = document.getElementById("closePanel");

const editPanel = document.getElementById("editPanel");
const editDate = document.getElementById("editDate");
const editText = document.getElementById("editText");
const saveBtn = document.getElementById("saveBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const closeEditPanel = document.getElementById("closeEditPanel");

const today = new Date();
let viewYear = today.getFullYear();
let viewMonth = today.getMonth();
let selectedKey = null;

function loadEntries() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatLabel(year, month, day) {
  const d = new Date(year, month, day);
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function renderCalendar() {
  const entries = loadEntries();
  monthLabel.textContent = new Date(viewYear, viewMonth).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  calendarGrid.innerHTML = "";

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "day empty";
    calendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.className = "day";
    cell.textContent = day;

    const key = dateKey(viewYear, viewMonth, day);

    const isToday =
      viewYear === today.getFullYear() &&
      viewMonth === today.getMonth() &&
      day === today.getDate();
    if (isToday) cell.classList.add("today");

    if (entries[key]) {
      const dot = document.createElement("span");
      dot.className = "dot";
      cell.appendChild(dot);
    }

    cell.addEventListener("click", () => openDetail(key, viewYear, viewMonth, day));
    calendarGrid.appendChild(cell);
  }
}

function openDetail(key, year, month, day) {
  selectedKey = key;
  const entries = loadEntries();
  const text = entries[key];

  panelDate.textContent = formatLabel(year, month, day);

  if (text) {
    panelText.textContent = text;
    panelText.classList.remove("hidden");
    panelEmpty.classList.add("hidden");
    deleteBtn.classList.remove("hidden");
  } else {
    panelText.classList.add("hidden");
    panelEmpty.classList.remove("hidden");
    deleteBtn.classList.add("hidden");
  }

  overlay.classList.remove("hidden");
  detailPanel.classList.remove("hidden");
}

function closeAllPanels() {
  overlay.classList.add("hidden");
  detailPanel.classList.add("hidden");
  editPanel.classList.add("hidden");
}

function checkPassword() {
  const input = prompt("Enter password to make changes:");
  if (input === null) return false;
  if (input !== EDIT_PASSWORD) {
    alert("Incorrect password.");
    return false;
  }
  return true;
}

function openEdit() {
  if (!checkPassword()) return;

  const entries = loadEntries();
  editDate.textContent = panelDate.textContent;
  editText.value = entries[selectedKey] || "";

  detailPanel.classList.add("hidden");
  editPanel.classList.remove("hidden");
  editText.focus();
}

function saveEdit() {
  const entries = loadEntries();
  const value = editText.value.trim();

  if (value) {
    entries[selectedKey] = value;
  } else {
    delete entries[selectedKey];
  }

  saveEntries(entries);
  renderCalendar();
  closeAllPanels();
}

function deleteEntry() {
  if (!checkPassword()) return;
  const entries = loadEntries();
  delete entries[selectedKey];
  saveEntries(entries);
  renderCalendar();
  closeAllPanels();
}

prevMonthBtn.addEventListener("click", () => {
  viewMonth--;
  if (viewMonth < 0) {
    viewMonth = 11;
    viewYear--;
  }
  renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  viewMonth++;
  if (viewMonth > 11) {
    viewMonth = 0;
    viewYear++;
  }
  renderCalendar();
});

closePanel.addEventListener("click", closeAllPanels);
overlay.addEventListener("click", closeAllPanels);
closeEditPanel.addEventListener("click", () => {
  editPanel.classList.add("hidden");
  overlay.classList.add("hidden");
});
cancelEditBtn.addEventListener("click", () => {
  editPanel.classList.add("hidden");
  overlay.classList.add("hidden");
});

editBtn.addEventListener("click", openEdit);
deleteBtn.addEventListener("click", deleteEntry);
saveBtn.addEventListener("click", saveEdit);

renderCalendar();
