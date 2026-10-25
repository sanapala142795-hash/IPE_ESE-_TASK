
"use strict";

const STORAGE_KEY = "studentAttendanceManager_v1";

const demoStudents = [
  {
    id: "demo-101",
    name: "Aanya Patel",
    roll: "101",
    status: "Present",
    presentDays: 18,
    totalDays: 20
  },
  {
    id: "demo-102",
    name: "Rohan Shah",
    roll: "102",
    status: "Absent",
    presentDays: 15,
    totalDays: 20
  },
  {
    id: "demo-103",
    name: "Diya Mehta",
    roll: "103",
    status: "Present",
    presentDays: 19,
    totalDays: 20
  },
  {
    id: "demo-104",
    name: "Arjun Joshi",
    roll: "104",
    status: "Present",
    presentDays: 17,
    totalDays: 20
  }
];

const form = document.getElementById("studentForm");
const nameInput = document.getElementById("studentName");
const rollInput = document.getElementById("rollNumber");
const attendanceInput = document.getElementById("attendance");
const messageBox = document.getElementById("message");
const tableBody = document.getElementById("studentTable");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const emptyState = document.getElementById("emptyState");

let students = loadStudents();
let messageTimer;

function loadStudents() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const data = JSON.parse(saved);

      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (error) {
    console.error("Unable to load saved data:", error);
  }

  return demoStudents.map(student => ({ ...student }));
}

function saveStudents() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  } catch (error) {
    console.error("Unable to save data:", error);
    showMessage(
      "Could not save data in browser storage.",
      "error"
    );
  }
}

function showMessage(text, type) {
  clearTimeout(messageTimer);

  messageBox.textContent = text;
  messageBox.className = "message show " + type;

  messageTimer = setTimeout(() => {
    messageBox.className = "message";
    messageBox.textContent = "";
  }, 4000);
}

function getPercentage(student) {
  if (!student.totalDays) {
    return 0;
  }

  return Math.round(
    (student.presentDays / student.totalDays) * 100
  );
}

function renderStats() {
  const total = students.length;

  const present = students.filter(
    student => student.status === "Present"
  ).length;

  const absent = students.filter(
    student => student.status === "Absent"
  ).length;

  const average = total
    ? Math.round(
        students.reduce(
          (sum, student) => sum + getPercentage(student),
          0
        ) / total
      )
    : 0;

  document.getElementById("totalCount").textContent = total;
  document.getElementById("presentCount").textContent = present;
  document.getElementById("absentCount").textContent = absent;
  document.getElementById("averageCount").textContent = average + "%";
}

function createCell() {
  return document.createElement("td");
}

function renderTable() {
  const search = searchInput.value.trim().toLowerCase();
  const filter = statusFilter.value;

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(search) ||
      student.roll.toLowerCase().includes(search);

    const matchesStatus =
      filter === "All" || student.status === filter;

    return matchesSearch && matchesStatus;
  });

  tableBody.replaceChildren();

  filteredStudents.forEach(student => {
    const row = document.createElement("tr");

    const studentCell = createCell();

    const name = document.createElement("div");
    name.className = "student-name";
    name.textContent = student.name;

    const roll = document.createElement("div");
    roll.className = "roll-number";
    roll.textContent = "Roll No. " + student.roll;

    studentCell.append(name, roll);

    const statusCell = createCell();
    const badge = document.createElement("span");

    badge.className =
      "status " +
      (student.status === "Present" ? "present" : "absent");

    badge.textContent = student.status;
    statusCell.appendChild(badge);

    const percentCell = createCell();
    const percentage = getPercentage(student);

    const percentText = document.createElement("strong");
    percentText.textContent = percentage + "%";

    const progress = document.createElement("div");
    progress.className = "progress";

    const bar = document.createElement("div");
    bar.className = "progress-bar";
    bar.style.width = percentage + "%";

    progress.appendChild(bar);
    percentCell.append(percentText, progress);

    const actionCell = createCell();
    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      deleteStudent(student.id);
    });

    actionCell.appendChild(deleteButton);

    row.append(
      studentCell,
      statusCell,
      percentCell,
      actionCell
    );

    tableBody.appendChild(row);
  });

  emptyState.hidden = filteredStudents.length > 0;

  document.querySelector(".table-wrapper table").style.display =
    filteredStudents.length > 0 ? "table" : "none";

  document.getElementById("recordSummary").textContent =
    "Showing " + filteredStudents.length +
    " of " + students.length + " students";
}

function render() {
  renderStats();
  renderTable();
}

function addStudent(event) {
  event.preventDefault();

  const name = nameInput.value.trim().replace(/\s+/g, " ");
  const roll = rollInput.value.trim();
  const status = attendanceInput.value;

  if (!name || !roll) {
    showMessage(
      "Please enter both student name and roll number.",
      "error"
    );
    return;
  }

  if (students.some(
    student => student.roll.toLowerCase() === roll.toLowerCase()
  )) {
    showMessage(
      "This roll number already exists. Enter a unique roll number.",
      "error"
    );
    return;
  }

  students.unshift({
    id: window.crypto && crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now()) + Math.random().toString(16).slice(2),
    name: name,
    roll: roll,
    status: status,
    presentDays: status === "Present" ? 1 : 0,
    totalDays: 1
  });

  saveStudents();
  render();

  form.reset();
  nameInput.focus();

  showMessage(
    "Student " + name + " added successfully!",
    "success"
  );
}

function deleteStudent(id) {
  const student = students.find(item => item.id === id);

  if (!student) {
    return;
  }

  const confirmed = confirm(
    "Delete " + student.name + " (Roll No. " + student.roll + ")?"
  );

  if (!confirmed) {
    return;
  }

  students = students.filter(item => item.id !== id);

  saveStudents();
  render();

  showMessage("Student record deleted successfully.", "success");
}

function clearForm() {
  form.reset();
  nameInput.value = "";
  rollInput.value = "";
  attendanceInput.value = "Present";
  nameInput.focus();

  showMessage("Form cleared.", "success");
}

function resetDemoData() {
  const confirmed = confirm(
    "Reset all records to the original demo data? " +
    "Your current records will be replaced."
  );

  if (!confirmed) {
    return;
  }

  students = demoStudents.map(student => ({ ...student }));

  searchInput.value = "";
  statusFilter.value = "All";

  saveStudents();
  render();

  showMessage("Demo data restored successfully.", "success");
}

function exportCSV() {
  const rows = [
    [
      "Student Name",
      "Roll Number",
      "Today's Status",
      "Present Days",
      "Total Days",
      "Attendance Percentage"
    ],
    ...students.map(student => [
      student.name,
      student.roll,
      student.status,
      student.presentDays,
      student.totalDays,
      getPercentage(student) + "%"
    ])
  ];

  const csv = rows.map(row =>
    row.map(value =>
      '"' + String(value).replace(/"/g, '""') + '"'
    ).join(",")
  ).join("\r\n");

  const blob = new Blob(
    ["\uFEFF" + csv],
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "student-attendance-records.csv";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);

  showMessage("CSV file exported successfully.", "success");
}

form.addEventListener("submit", addStudent);

document.getElementById("clearBtn").addEventListener(
  "click",
  clearForm
);

document.getElementById("resetBtn").addEventListener(
  "click",
  resetDemoData
);

document.getElementById("exportBtn").addEventListener(
  "click",
  exportCSV
);

searchInput.addEventListener("input", renderTable);
statusFilter.addEventListener("change", renderTable);

render();
