const EDIT_PASSWORD = "CSAI.clubss";
const STORAGE_KEY = "scheduleEntries";
const NEWS_KEY = "scheduleNews";

/* Elements: shell */
const todayLabel = document.getElementById("todayLabel");
const scheduleView = document.getElementById("scheduleView");
const newsView = document.getElementById("newsView");
const tabSchedule = document.getElementById("tabSchedule");
const tabNews = document.getElementById("tabNews");
const fabAdd = document.getElementById("fabAdd");
const overlay = document.getElementById("overlay");

/* Elements: calendar */
const monthLabel = document.getElementById("monthLabel");
const monthLabelText = document.getElementById("monthLabelText");
const jumpDot = document.getElementById("jumpDot");
const calendarGrid = document.getElementById("calendarGrid");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

/* Elements: schedule panels */
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

/* Elements: news */
const newsList = document.getElementById("newsList");
const newsCount = document.getElementById("newsCount");
const newsEmpty = document.getElementById("newsEmpty");

const newsDetailPanel = document.getElementById("newsDetailPanel");
const newsPanelTitle = document.getElementById("newsPanelTitle");
const newsPanelDate = document.getElementById("newsPanelDate");
const newsPanelBody = document.getElementById("newsPanelBody");
const newsEditBtn = document.getElementById("newsEditBtn");
const newsDeleteBtn = document.getElementById("newsDeleteBtn");
const closeNewsPanel = document.getElementById("closeNewsPanel");

const newsEditPanel = document.getElementById("newsEditPanel");
const newsEditHeading = document.getElementById("newsEditHeading");
const newsTitleInput = document.getElementById("newsTitleInput");
const newsBodyInput = document.getElementById("newsBodyInput");
const newsSaveBtn = document.getElementById("newsSaveBtn");
const newsCancelBtn = document.getElementById("newsCancelBtn");
const closeNewsEditPanel = document.getElementById("closeNewsEditPanel");

const today = new Date();
let viewYear = today.getFullYear();
let viewMonth = today.getMonth();
let selectedKey = null;
let activeTab = "schedule";
let editingNewsId = null;

/* ---------- storage ---------- */

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

function loadNews() {
  try {
    return JSON.parse(localStorage.getItem(NEWS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveNews(posts) {
  localStorage.setItem(NEWS_KEY, JSON.stringify(posts));
}

/* ---------- helpers ---------- */

function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatLabel(year, month, day) {
  const d = new Date(year, month, day);
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
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

function closeAllPanels() {
  overlay.classList.add("hidden");
  detailPanel.classList.add("hidden");
  editPanel.classList.add("hidden");
  newsDetailPanel.classList.add("hidden");
  newsEditPanel.classList.add("hidden");
}

/* ---------- tabs ---------- */

function setTab(tab) {
  activeTab = tab;
  scheduleView.classList.toggle("hidden", tab !== "schedule");
  newsView.classList.toggle("hidden", tab !== "news");
  tabSchedule.classList.toggle("is-active", tab === "schedule");
  tabNews.classList.toggle("is-active", tab === "news");
}

tabSchedule.addEventListener("click", () => setTab("schedule"));
tabNews.addEventListener("click", () => setTab("news"));

/* ---------- calendar ---------- */

function renderCalendar() {
  const entries = loadEntries();
  monthLabelText.textContent = new Date(viewYear, viewMonth).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
  jumpDot.classList.toggle("hidden", isCurrentMonth);

  calendarGrid.innerHTML = "";

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - firstDay + 1;
    const cell = document.createElement("div");

    if (dayNum < 1) {
      cell.className = "day muted";
      cell.textContent = prevMonthDays + dayNum;
    } else if (dayNum > daysInMonth) {
      cell.className = "day muted";
      cell.textContent = dayNum - daysInMonth;
    } else {
      cell.className = "day";
      cell.textContent = dayNum;

      const key = dateKey(viewYear, viewMonth, dayNum);
      const isToday = isCurrentMonth && dayNum === today.getDate();
      if (isToday) cell.classList.add("today");

      if (entries[key]) {
        const dot = document.createElement("span");
        dot.className = "dot";
        cell.appendChild(dot);
      }

      cell.addEventListener("click", () => openDetail(key, viewYear, viewMonth, dayNum));
    }

    calendarGrid.appendChild(cell);
  }

  calendarGrid.classList.remove("anim");
  void calendarGrid.offsetWidth;
  calendarGrid.classList.add("anim");
}

function jumpToToday() {
  viewYear = today.getFullYear();
  viewMonth = today.getMonth();
  renderCalendar();
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

function openEdit() {
  if (!checkPassword()) return;

  const entries = loadEntries();
  editDate.textContent = panelDate.textContent;
  editText.value = entries[selectedKey] || "";

  detailPanel.classList.add("hidden");
  editPanel.classList.remove("hidden");
  editText.focus();
}

function openQuickAddSchedule() {
  if (!checkPassword()) return;

  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();
  selectedKey = dateKey(y, m, d);

  const entries = loadEntries();
  editDate.textContent = formatLabel(y, m, d);
  editText.value = entries[selectedKey] || "";

  overlay.classList.remove("hidden");
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

monthLabel.addEventListener("click", jumpToToday);

closePanel.addEventListener("click", closeAllPanels);
overlay.addEventListener("click", closeAllPanels);
closeEditPanel.addEventListener("click", closeAllPanels);
cancelEditBtn.addEventListener("click", closeAllPanels);

editBtn.addEventListener("click", openEdit);
deleteBtn.addEventListener("click", deleteEntry);
saveBtn.addEventListener("click", saveEdit);

/* ---------- news ---------- */

function formatPostDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function renderNews() {
  const posts = loadNews();
  newsList.innerHTML = "";
  newsCount.textContent = `${posts.length} post${posts.length === 1 ? "" : "s"}`;

  if (posts.length === 0) {
    newsEmpty.classList.remove("hidden");
    return;
  }
  newsEmpty.classList.add("hidden");

  posts.forEach((post, index) => {
    const item = document.createElement("div");
    item.className = "news-item";
    if (index === posts.length - 1) item.classList.add("last");
    item.innerHTML = `
      <div class="news-item-text">
        <div class="news-item-title"></div>
        <div class="news-item-date">${formatPostDate(post.createdAt)}</div>
        <div class="news-item-preview"></div>
      </div>
      <svg class="news-item-chevron" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
    `;
    item.querySelector(".news-item-title").textContent = post.title;
    item.querySelector(".news-item-preview").textContent = post.body;
    item.addEventListener("click", () => openNewsDetail(post.id));
    newsList.appendChild(item);
  });
}

function openNewsDetail(id) {
  const posts = loadNews();
  const post = posts.find((p) => p.id === id);
  if (!post) return;

  editingNewsId = id;
  newsPanelTitle.textContent = post.title;
  newsPanelDate.textContent = formatPostDate(post.createdAt);
  newsPanelBody.textContent = post.body;

  overlay.classList.remove("hidden");
  newsDetailPanel.classList.remove("hidden");
}

function openNewsEdit() {
  if (!checkPassword()) return;

  const posts = loadNews();
  const post = posts.find((p) => p.id === editingNewsId);

  newsEditHeading.textContent = "Edit post";
  newsTitleInput.value = post ? post.title : "";
  newsBodyInput.value = post ? post.body : "";

  newsDetailPanel.classList.add("hidden");
  newsEditPanel.classList.remove("hidden");
  newsTitleInput.focus();
}

function openNewsAdd() {
  if (!checkPassword()) return;

  editingNewsId = null;
  newsEditHeading.textContent = "Post news";
  newsTitleInput.value = "";
  newsBodyInput.value = "";

  overlay.classList.remove("hidden");
  newsEditPanel.classList.remove("hidden");
  newsTitleInput.focus();
}

function saveNewsPost() {
  const title = newsTitleInput.value.trim();
  const body = newsBodyInput.value.trim();
  if (!title || !body) {
    alert("Please add a title and a description.");
    return;
  }

  const posts = loadNews();

  if (editingNewsId) {
    const post = posts.find((p) => p.id === editingNewsId);
    if (post) {
      post.title = title;
      post.body = body;
    }
  } else {
    posts.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      body,
      createdAt: new Date().toISOString(),
    });
  }

  saveNews(posts);
  renderNews();
  closeAllPanels();
}

function deleteNewsPost() {
  if (!checkPassword()) return;
  const posts = loadNews().filter((p) => p.id !== editingNewsId);
  saveNews(posts);
  renderNews();
  closeAllPanels();
}

closeNewsPanel.addEventListener("click", closeAllPanels);
closeNewsEditPanel.addEventListener("click", closeAllPanels);
newsCancelBtn.addEventListener("click", closeAllPanels);
newsEditBtn.addEventListener("click", openNewsEdit);
newsDeleteBtn.addEventListener("click", deleteNewsPost);
newsSaveBtn.addEventListener("click", saveNewsPost);

/* ---------- fab (context-aware add) ---------- */

fabAdd.addEventListener("click", () => {
  if (activeTab === "schedule") {
    openQuickAddSchedule();
  } else {
    openNewsAdd();
  }
});

/* ---------- init ---------- */

todayLabel.textContent = today.toLocaleDateString(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
});

renderCalendar();
renderNews();
