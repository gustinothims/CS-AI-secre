const EDIT_PASSWORD = "CSAI.clubss";
const STORAGE_KEY = "scheduleEntries";
const RING_CIRCUMFERENCE = 2 * Math.PI * 37;
const RECENT_LIMIT = 5;

const monthLabel = document.getElementById("monthLabel");
const calendarGrid = document.getElementById("calendarGrid");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

const heroCount = document.getElementById("heroCount");
const heroRing = document.getElementById("heroRing");
const heroPercent = document.getElementById("heroPercent");
const statTotal = document.getElementById("statTotal");
const statStreak = document.getElementById("statStreak");
const statLongest = document.getElementById("statLongest");

const recentList = document.getElementById("recentList");
const recentEmpty = document.getElementById("recentEmpty");
const fabAdd = document.getElementById("fabAdd");

const overlay = document.getElementById("overlay");
const detailPanel = document.getElementById("detailPanel");
const panelDate = document.getElementById("panelDate");
const panelText = document.getElementById("panelText");
const panelEmpty = document.getElementById("panelEmpty");
const editBtn = document.getElementById("editBtn");
const deleteBtn = document.getElementById("deleteBtn");
const closePanel = document.getElementById("closePanel");

const editPanel = document.getElementById("editPanel");
const editDateInput = document.getElementById("editDateInput");
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

function todayKey() {
  return dateKey(today.getFullYear(), today.getMonth(), today.getDate());
}

function formatLabel(key) {
  const d = new Date(`${key}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function formatShort(key) {
  const d = new Date(`${key}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function render() {
  const entries = loadEntries();
  renderCalendar(entries);
  renderStats(entries);
  renderRecent(entries);
}

function renderCalendar(entries) {
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

    cell.addEventListener("click", () => openDetail(key));
    calendarGrid.appendChild(cell);
  }
}

function daysElapsedInViewedMonth() {
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  if (viewYear === today.getFullYear() && viewMonth === today.getMonth()) {
    return today.getDate();
  }
  const viewedFirst = new Date(viewYear, viewMonth, 1);
  const todayFirst = new Date(today.getFullYear(), today.getMonth(), 1);
  return viewedFirst < todayFirst ? daysInMonth : 0;
}

function computeCurrentStreak(entries) {
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!entries[dateKey(cursor.getFullYear(), cursor.getMonth(), cursor.getDate())]) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (entries[dateKey(cursor.getFullYear(), cursor.getMonth(), cursor.getDate())]) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function computeLongestStreak(entries) {
  const keys = Object.keys(entries).sort();
  let longest = 0;
  let current = 0;
  let prevDate = null;

  for (const key of keys) {
    const d = new Date(`${key}T00:00:00`);
    if (prevDate && Math.round((d - prevDate) / 86400000) === 1) {
      current++;
    } else {
      current = 1;
    }
    longest = Math.max(longest, current);
    prevDate = d;
  }
  return longest;
}

function renderStats(entries) {
  const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
  const countThisMonth = Object.keys(entries).filter((k) => k.startsWith(monthPrefix)).length;
  const elapsed = daysElapsedInViewedMonth();
  const percent = elapsed > 0 ? Math.min(100, Math.round((countThisMonth / elapsed) * 100)) : 0;

  heroCount.textContent = countThisMonth;
  heroPercent.textContent = `${percent}%`;
  heroRing.style.strokeDashoffset = RING_CIRCUMFERENCE * (1 - percent / 100);

  statTotal.textContent = Object.keys(entries).length;
  statStreak.textContent = computeCurrentStreak(entries);
  statLongest.textContent = computeLongestStreak(entries);
}

function renderRecent(entries) {
  const keys = Object.keys(entries).sort().reverse().slice(0, RECENT_LIMIT);

  recentList.innerHTML = "";

  if (keys.length === 0) {
    recentEmpty.classList.remove("hidden");
    return;
  }
  recentEmpty.classList.add("hidden");

  for (const key of keys) {
    const item = document.createElement("div");
    item.className = "recent-item";

    const day = Number(key.slice(8, 10));

    item.innerHTML = `
      <div class="recent-badge">${day}</div>
      <div class="recent-info">
        <div class="recent-title">${formatShort(key)}</div>
        <div class="recent-desc"></div>
      </div>
      <span class="recent-chevron">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </span>
    `;
    item.querySelector(".recent-desc").textContent = entries[key];
    item.addEventListener("click", () => openDetail(key));
    recentList.appendChild(item);
  }
}

function openDetail(key) {
  selectedKey = key;
  const entries = loadEntries();
  const text = entries[key];

  panelDate.textContent = formatLabel(key);

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
  editDateInput.value = selectedKey;
  editText.value = entries[selectedKey] || "";

  detailPanel.classList.add("hidden");
  editPanel.classList.remove("hidden");
  editText.focus();
}

function openQuickAdd() {
  if (!checkPassword()) return;

  selectedKey = todayKey();
  editDateInput.value = selectedKey;
  editText.value = "";

  overlay.classList.remove("hidden");
  editPanel.classList.remove("hidden");
  editText.focus();
}

function saveEdit() {
  const newKey = editDateInput.value;
  if (!newKey) {
    alert("Please choose a date.");
    return;
  }

  const entries = loadEntries();
  const value = editText.value.trim();

  if (selectedKey && selectedKey !== newKey) {
    delete entries[selectedKey];
  }

  if (value) {
    entries[newKey] = value;
  } else {
    delete entries[newKey];
  }

  saveEntries(entries);
  render();
  closeAllPanels();
}

function deleteEntry() {
  if (!checkPassword()) return;
  const entries = loadEntries();
  delete entries[selectedKey];
  saveEntries(entries);
  render();
  closeAllPanels();
}

prevMonthBtn.addEventListener("click", () => {
  viewMonth--;
  if (viewMonth < 0) {
    viewMonth = 11;
    viewYear--;
  }
  render();
});

nextMonthBtn.addEventListener("click", () => {
  viewMonth++;
  if (viewMonth > 11) {
    viewMonth = 0;
    viewYear++;
  }
  render();
});

closePanel.addEventListener("click", closeAllPanels);
overlay.addEventListener("click", closeAllPanels);
closeEditPanel.addEventListener("click", closeAllPanels);
cancelEditBtn.addEventListener("click", closeAllPanels);

editBtn.addEventListener("click", openEdit);
deleteBtn.addEventListener("click", deleteEntry);
saveBtn.addEventListener("click", saveEdit);
fabAdd.addEventListener("click", openQuickAdd);

render();
