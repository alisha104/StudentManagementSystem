
/* ==========================================
   STUDENTHUB - STUDENT MANAGEMENT SYSTEM
   JavaScript functionality
========================================== */

// 1. Select HTML elements using the DOM
const studentForm = document.getElementById("studentForm");
const studentName = document.getElementById("studentName");
const studentEmail = document.getElementById("studentEmail");
const studentGrade = document.getElementById("studentGrade");
const studentAge = document.getElementById("studentAge");

const studentTableBody = document.getElementById("studentTableBody");
const totalStudents = document.getElementById("totalStudents");
const activeStudents = document.getElementById("activeStudents");
const gradeGroups = document.getElementById("gradeGroups");

const searchInput = document.getElementById("searchInput");
const gradeFilter = document.getElementById("gradeFilter");
const sortButton = document.getElementById("sortButton");
const recordCount = document.getElementById("recordCount");
const displaySummary = document.getElementById("displaySummary");
const emptyState = document.getElementById("emptyState");

const formTitle = document.getElementById("formTitle");
const formMessage = document.getElementById("formMessage");
const saveStudentButton = document.getElementById("saveStudentButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const addStudentButton = document.getElementById("addStudentButton");
const resetFormButton = document.getElementById("resetFormButton");
const clearFiltersButton = document.getElementById("clearFiltersButton");
const toast = document.getElementById("toast");

// 2. Application data: an array of student objects
const STORAGE_KEY = "studentHubRecords";

let students = loadStudents();
let editingStudentId = null;
let sortAscending = true;
let toastTimer;

// 3. Load saved records from localStorage
function loadStudents() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);

        if (!savedData) {
            return [];
        }

        const parsedData = JSON.parse(savedData);

        if (!Array.isArray(parsedData)) {
            return [];
        }

        // Accept only records with the required fields.
        return parsedData.filter((student) =>
            student &&
            typeof student.id === "string" &&
            typeof student.name === "string" &&
            typeof student.email === "string" &&
            typeof student.grade === "string" &&
            Number.isInteger(student.age)
        );
    } catch (error) {
        console.error("Could not load student records:", error);
        return [];
    }
}

// 4. Save records in the browser
function saveStudents() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
        return true;
    } catch (error) {
        console.error("Could not save student records:", error);
        showToast("Unable to save data. Check browser storage.");
        return false;
    }
}

// 5. Display a temporary notification
function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// 6. Display a message beside the form
function showFormMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = "form-message " + type;
}

// 7. Create safe HTML elements using textContent
function createCell(content, className) {
    const cell = document.createElement("td");
    cell.textContent = content;

    if (className) {
        cell.className = className;
    }

    return cell;
}

// 8. Create a student table row dynamically
function createStudentRow(student) {
    const row = document.createElement("tr");

    // Student name and initials
    const studentCell = document.createElement("td");
    const studentInfo = document.createElement("div");
    studentInfo.className = "student-cell";

    const avatar = document.createElement("div");
    avatar.className = "student-avatar";

    const initials = student.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");

    avatar.textContent = initials || "?";

    const name = document.createElement("span");
    name.className = "student-name";
    name.textContent = student.name;

    studentInfo.append(avatar, name);
    studentCell.appendChild(studentInfo);
    row.appendChild(studentCell);

    // Email
    const emailCell = createCell(student.email, "student-email");
    row.appendChild(emailCell);

    // Grade badge
    const gradeCell = document.createElement("td");
    const gradeBadge = document.createElement("span");
    gradeBadge.className = "grade-badge";
    gradeBadge.textContent = student.grade;
    gradeCell.appendChild(gradeBadge);
    row.appendChild(gradeCell);

    // Age
    row.appendChild(createCell(String(student.age)));

    // Edit and delete buttons
    const actionCell = document.createElement("td");
    const actionContainer = document.createElement("div");
    actionContainer.className = "action-buttons";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "action-button edit-button";
    editButton.textContent = "Edit";
    editButton.setAttribute("aria-label", "Edit " + student.name);

    editButton.addEventListener("click", () => {
        editStudent(student.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "action-button delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", "Delete " + student.name);

    deleteButton.addEventListener("click", () => {
        deleteStudent(student.id);
    });

    actionContainer.append(editButton, deleteButton);
    actionCell.appendChild(actionContainer);
    row.appendChild(actionCell);

    return row;
}

// 9. Search, filter, and sort student records
function getVisibleStudents() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedGrade = gradeFilter.value;

    let filteredStudents = students.filter((student) => {
        const matchesSearch =
            student.name.toLowerCase().includes(searchTerm) ||
            student.email.toLowerCase().includes(searchTerm);

        const matchesGrade =
            selectedGrade === "all" ||
            student.grade === selectedGrade;

        return matchesSearch && matchesGrade;
    });

    // Array method: sort()
    filteredStudents = [...filteredStudents].sort((a, b) => {
        const comparison = a.name.localeCompare(b.name);
        return sortAscending ? comparison : -comparison;
    });

    return filteredStudents;
}

// 10. Update the table and dashboard dynamically
function renderStudents() {
    const visibleStudents = getVisibleStudents();

    // Remove previous rows before rendering the latest results
    studentTableBody.replaceChildren();

    // Loop through the filtered array
    visibleStudents.forEach((student) => {
        const row = createStudentRow(student);
        studentTableBody.appendChild(row);
    });

    // Update dashboard counters
    totalStudents.textContent = students.length;
    activeStudents.textContent = students.length;

    // Array methods: map() and Set
    const uniqueGrades = new Set(
        students.map((student) => student.grade)
    );

    gradeGroups.textContent = uniqueGrades.size;

    // Update record information
    recordCount.textContent =
        `${visibleStudents.length} of ${students.length} records`;

    displaySummary.textContent =
        `Showing ${visibleStudents.length} student` +
        (visibleStudents.length === 1 ? "" : "s");

    // Show empty state when no records match
    emptyState.classList.toggle(
        "hidden",
        visibleStudents.length > 0
    );
}

// 11. Reset the form and exit edit mode
function resetStudentForm() {
    studentForm.reset();
    editingStudentId = null;

    formTitle.textContent = "Register a Student";
    saveStudentButton.textContent = "Save Student";
    cancelEditButton.classList.add("hidden");

    formMessage.textContent = "";
    formMessage.className = "form-message";
}

// 12. Add a new student or update an existing student
studentForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Trim spaces from text inputs
    const name = studentName.value.trim();
    const email = studentEmail.value.trim().toLowerCase();
    const grade = studentGrade.value;
    const age = Number(studentAge.value);

    // Conditional statements: validate the input
    if (name.length < 2) {
        showFormMessage(
            "Please enter a name with at least 2 characters.",
            "error"
        );
        studentName.focus();
        return;
    }

    if (!studentEmail.validity.valid || !email) {
        showFormMessage(
            "Please enter a valid email address.",
            "error"
        );
        studentEmail.focus();
        return;
    }

    if (!grade) {
        showFormMessage("Please select a grade.", "error");
        studentGrade.focus();
        return;
    }

    if (!Number.isInteger(age) || age < 3 || age > 25) {
        showFormMessage(
            "Age must be a whole number between 3 and 25.",
            "error"
        );
        studentAge.focus();
        return;
    }

    // Prevent duplicate email addresses
    const duplicateEmail = students.some((student) =>
        student.email.toLowerCase() === email &&
        student.id !== editingStudentId
    );

    if (duplicateEmail) {
        showFormMessage(
            "This email is already registered.",
            "error"
        );
        studentEmail.focus();
        return;
    }

    // Store data as a JavaScript object
    const studentData = {
        name: name,
        email: email,
        grade: grade,
        age: age
    };

    if (editingStudentId !== null) {
        // Update an existing object using findIndex()
        const studentIndex = students.findIndex(
            (student) => student.id === editingStudentId
        );

        if (studentIndex === -1) {
            resetStudentForm();
            renderStudents();
            showToast("Student record was not found.");
            return;
        }

        const previousStudent = students[studentIndex];

        students[studentIndex] = {
            ...previousStudent,
            ...studentData
        };

        if (!saveStudents()) {
            students[studentIndex] = previousStudent;
            return;
        }

        renderStudents();
        resetStudentForm();
        showToast("Student record updated successfully.");
    } else {
        // Create a unique ID for the new student
        const newStudent = {
            id: createStudentId(),
            ...studentData
        };

        students.push(newStudent);

        if (!saveStudents()) {
            students = students.filter(
                (student) => student.id !== newStudent.id
            );
            return;
        }

        renderStudents();
        resetStudentForm();
        showToast("Student added successfully.");
    }
});

// Generate an ID without relying on a library
function createStudentId() {
    let id;

    do {
        id = "student-" +
            Date.now().toString(36) + "-" +
            Math.random().toString(36).slice(2, 10);
    } while (students.some((student) => student.id === id));

    return id;
}

// 13. Load a record into the form for editing
function editStudent(id) {
    const student = students.find(
        (record) => record.id === id
    );

    if (!student) {
        showToast("Student record was not found.");
        return;
    }

    editingStudentId = id;

    studentName.value = student.name;
    studentEmail.value = student.email;
    studentGrade.value = student.grade;
    studentAge.value = student.age;

    formTitle.textContent = "Edit Student Details";
    saveStudentButton.textContent = "Update Student";
    cancelEditButton.classList.remove("hidden");

    formMessage.textContent = "";
    formMessage.className = "form-message";

    document.getElementById("studentFormSection").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    studentName.focus({ preventScroll: true });
}

// 14. Delete a student record
function deleteStudent(id) {
    const student = students.find(
        (record) => record.id === id
    );

    if (!student) {
        showToast("Student record was not found.");
        return;
    }

    // Ask for confirmation before deleting
    const confirmed = window.confirm(
        `Are you sure you want to delete ${student.name}'s record?`
    );

    if (!confirmed) {
        return;
    }

    const previousStudents = students;
    students = students.filter(
        (record) => record.id !== id
    );

    if (!saveStudents()) {
        students = previousStudents;
        return;
    }

    if (editingStudentId === id) {
        resetStudentForm();
    }

    renderStudents();
    showToast("Student record deleted successfully.");
}

// 15. Search event
searchInput.addEventListener("input", renderStudents);

// 16. Grade filter event
gradeFilter.addEventListener("change", renderStudents);

// 17. Toggle alphabetical sorting
sortButton.addEventListener("click", function () {
    sortAscending = !sortAscending;

    sortButton.textContent = sortAscending
        ? "Sort A–Z ↑"
        : "Sort Z–A ↓";

    renderStudents();
});

// 18. Open the registration form
addStudentButton.addEventListener("click", function () {
    resetStudentForm();

    document.getElementById("studentFormSection").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    studentName.focus({ preventScroll: true });
});

// 19. Cancel editing
cancelEditButton.addEventListener("click", function () {
    resetStudentForm();
    showToast("Editing cancelled.");
});

// 20. Clear form and exit edit mode
resetStudentButtonHandler();

function resetStudentButtonHandler() {
    studentForm.addEventListener("reset", function () {
        editingStudentId = null;

        formTitle.textContent = "Register a Student";
        saveStudentButton.textContent = "Save Student";
        cancelEditButton.classList.add("hidden");

        formMessage.textContent = "";
        formMessage.className = "form-message";
    });
}

// 21. Clear search and grade filters
clearFiltersButton.addEventListener("click", function () {
    searchInput.value = "";
    gradeFilter.value = "all";

    sortAscending = true;
    sortButton.textContent = "Sort A–Z ↑";

    renderStudents();
    showToast("Search and filters cleared.");
});

// 22. Render saved records when the page opens
renderStudents();
