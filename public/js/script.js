/* ============================================
   STUDENT MANAGEMENT SYSTEM — script.js
   ============================================ */

'use strict';

// ============================================
// DUMMY DATA
// ============================================


// Dummy tests data (MCQ)
// API hook: Replace with → GET /api/tests?studentId={id}&status=upcoming
const TESTS_LIST = [
  { id: 1, name: 'Data Structures – Unit 2', course: 'Data Structures & Algorithms', questions: 10, duration: 15, date: 'Jun 16, 2025', status: 'upcoming' },
  { id: 2, name: 'Mathematics – Calculus', course: 'Mathematics III', questions: 10, duration: 15, date: 'Jun 18, 2025', status: 'upcoming' },
  { id: 3, name: 'Physics – Optics', course: 'Physics Lab', questions: 10, duration: 15, date: 'Jun 20, 2025', status: 'upcoming' }
];

// MCQ Questions
// API hook: Replace with → GET /api/tests/{testId}/questions
const MCQ_QUESTIONS = [
  { q: 'What is the time complexity of binary search on a sorted array?', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], answer: 1 },
  { q: 'Which data structure uses LIFO (Last In, First Out) order?', options: ['Queue', 'Stack', 'Linked List', 'Tree'], answer: 1 },
  { q: 'What is the height of a complete binary tree with n nodes?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], answer: 1 },
  { q: 'Which sorting algorithm has the best average-case complexity?', options: ['Bubble Sort', 'Selection Sort', 'Merge Sort', 'Insertion Sort'], answer: 2 },
  { q: 'In a hash table, what is the worst-case time for search with chaining?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], answer: 2 },
  { q: 'Which graph traversal uses a queue?', options: ['DFS', 'BFS', 'Dijkstra', 'Prim\'s'], answer: 1 },
  { q: 'What does AVL tree maintain?', options: ['Sorted order', 'Height balance', 'Max-heap property', 'Min-heap property'], answer: 1 },
  { q: 'Which data structure is best for implementing priority queues?', options: ['Array', 'Linked List', 'Heap', 'Stack'], answer: 2 },
  { q: 'What is the space complexity of merge sort?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], answer: 2 },
  { q: 'Which algorithm finds shortest path in a weighted graph?', options: ['BFS', 'DFS', 'Dijkstra', 'Kruskal'], answer: 2 }
];

// Dummy results data
// API hook: Replace with → GET /api/results?studentId={id}
const RESULTS_DATA = [
  { course: 'Data Structures', test: 'Unit 1 MCQ', marks: 85, total: 100, date: 'Jun 5, 2025' },
  { course: 'Mathematics III', test: 'Mid Semester', marks: 72, total: 100, date: 'Jun 2, 2025' },
  { course: 'Physics', test: 'Unit 1 MCQ', marks: 68, total: 100, date: 'May 28, 2025' },
  { course: 'DBMS', test: 'Intro Quiz', marks: 91, total: 100, date: 'May 22, 2025' },
  { course: 'Computer Networks', test: 'Chapter 1', marks: 78, total: 100, date: 'May 18, 2025' },
  { course: 'Operating Systems', test: 'Unit 1', marks: 63, total: 100, date: 'May 12, 2025' },
  { course: 'Data Structures', test: 'Unit 2 MCQ', marks: 88, total: 100, date: 'Apr 28, 2025' },
  { course: 'Mathematics III', test: 'Chapter 2', marks: 74, total: 100, date: 'Apr 20, 2025' }
];


// Teacher tests table
const TEACHER_TESTS_DATA = [
  { name: 'DS Unit 1 MCQ', course: 'Data Structures', questions: 10, duration: '15 min', attempts: 42, avg: '74%', status: 'Published' },
  { name: 'Math Calculus Test', course: 'Mathematics III', questions: 10, duration: '15 min', attempts: 0, avg: '—', status: 'Upcoming' },
  { name: 'DBMS Intro Quiz', course: 'DBMS', questions: 10, duration: '15 min', attempts: 58, avg: '81%', status: 'Completed' },
  { name: 'Networks Ch.1', course: 'Computer Networks', questions: 10, duration: '15 min', attempts: 35, avg: '68%', status: 'Published' },
  { name: 'OS Unit 1', course: 'Operating Systems', questions: 10, duration: '15 min', attempts: 0, avg: '—', status: 'Draft' }
];

// ============================================
// APP STATE
// ============================================

let forgotEmail = "";
let currentSection = 'dashboard';
let testState = {
  active: false,
  currentQ: 0,
  answers: {},
  timerInterval: null,
  timeLeft: 900 // 15 min in seconds
};

// ============================================
// INIT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  setHeaderDate();
  window.allCourses = [];
  loadCourses();
  renderResults(RESULTS_DATA);
  fetchStudents();
  renderTeacherTests(TEACHER_TESTS_DATA);
  renderTestsList();
  renderTeacherCourses(window.allCourses);
  closeDropdowns();

  document.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', () => clearFieldError(el.id));
    el.addEventListener('change', () => clearFieldError(el.id));
  });
});

function clearFieldError(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const group = input.closest('.form-group');
  const errorText = group?.querySelector('.field-error');

  if (group) group.classList.remove('error');
  if (errorText) errorText.textContent = '';
}

function showFieldError(inputId, message) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const group = input.closest('.form-group');
  const errorText = group?.querySelector('.field-error');

  if (group) group.classList.add('error');
  if (errorText) errorText.textContent = message;
}

function validateRequiredField(inputId, message) {
  const input = document.getElementById(inputId);
  if (!input) return false;

  if (!input.value.trim()) {
    showFieldError(inputId, message);
    return false;
  }

  clearFieldError(inputId);
  return true;
}

// ============================================
// LOGIN & AUTH
// ============================================

// API hook: POST /api/auth/login { email, password, role }
// Response: { token, user: { id, name, role, ... } }
// On success: store JWT → localStorage.setItem('token', response.token)
async function handleLogin() {

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  clearFieldError("email");
  clearFieldError("password");

  let isValid = true;
  if (!email) {
    showFieldError("email", "Email is required");
    isValid = false;
  }
  if (!password) {
    showFieldError("password", "Password is required");
    isValid = false;
  }

  if (!isValid) return;

  const btn = document.querySelector(".btn-login");

  btn.disabled = true;
  btn.innerHTML = "<span>Signing in...</span>";

  try {

    const response = await fetch("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();

    btn.disabled = false;

    btn.innerHTML = `
      <span>Sign In</span>
      <svg width="18" height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2">
      <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    `;

    if (!response.ok) {
      showToast(data.message);
      return;
    }

    applyRole(data.user);

    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");

    showToast("Login Successful");

    localStorage.setItem(
    "user",
    JSON.stringify(data.user)
);

  } catch (error) {
    btn.disabled = false;

btn.innerHTML = `
<span>Sign In</span>
<svg width="18" height="18" viewBox="0 0 24 24"
fill="none" stroke="currentColor" stroke-width="2">
<path d="M5 12h14M12 5l7 7-7 7"/>
</svg>
`;

    console.log(error);
    showToast("Server Error");

  }
}

function toggleTeacherCode() {

    const role = document.getElementById("registerRole").value;

    const teacherField =
        document.getElementById("teacherCodeGroup");

    if (role === "Teacher") {

        teacherField.classList.remove("hidden");

    }
    else {

        teacherField.classList.add("hidden");

        document.getElementById("teacherCode").value = "";

        clearFieldError("teacherCode");

    }

}

async function handleRegister() {

    const nameInput = document.getElementById("registerName");
    const emailInput = document.getElementById("registerEmail");
    const passwordInput = document.getElementById("registerPassword");
    const roleInput = document.getElementById("registerRole");
    const teacherCodeInput = document.getElementById("teacherCode");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const role = roleInput.value;
    const teacherCode = teacherCodeInput.value.trim();

    clearFieldError("registerName");
    clearFieldError("registerEmail");
    clearFieldError("registerPassword");
    clearFieldError("teacherCode");

    if (!name) {
        showFieldError("registerName", "Full name is required");
    }
    if (!email) {
        showFieldError("registerEmail", "Email is required");
    }
    if (!password) {
        showFieldError("registerPassword", "Password is required");
    }

    if (!name || !email || !password) {
        return;
    }
    if (role === "Teacher" && !teacherCode) {

    showFieldError(
        "teacherCode",
        "Teacher access code is required"
    );
        return;
    }

    try {

        const response =
            await fetch("/auth/register", {

                method: "POST",

                headers: {
                    "Content-Type":
                    "application/json"
                },

                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role,
                    teacherCode
                })

            });


        const data = await response.json();

        if (response.ok) {

            showToast(
                "Registration successful"
            );

            showLogin();

        }
        else {

            showToast(data.message);

        }

    }
    catch (error) {

        showToast("Server Error");

    }

}

function openCourseModal() {

  document.body.style.overflow = "hidden";

    const modal = document.getElementById("courseModal");
    if (!modal) return;

    selectedCourseId = null;
    setCourseFormMode("create");
    resetCourseForm();
    modal.classList.remove("hidden");

    const titleInput = document.getElementById("courseTitle");
    if (titleInput) titleInput.focus();

}

function addResourceRow(resource = {}) {

    const container = document.getElementById("resourcesContainer");

    const row = document.createElement("div");

    row.className = "resource-item";

    row.innerHTML = `

        <div class="course-form-grid">

            <div class="form-group">
                <label>Resource Title</label>

                <input
                    type="text"
                    class="resource-title"
                    placeholder="e.g. Striver Graph Playlist"
                    value="${resource.title || ""}">
            </div>

            <div class="form-group">
                <label>Resource Type</label>

                <select class="resource-type">

                    <option value="youtube"
                        ${resource.type=="youtube"?"selected":""}>
                        YouTube
                    </option>

                    <option value="documentation"
                        ${resource.type=="documentation"?"selected":""}>
                        Documentation
                    </option>

                    <option value="website"
                        ${resource.type=="website"?"selected":""}>
                        Website
                    </option>

                    <option value="drive"
                        ${resource.type=="drive"?"selected":""}>
                        Google Drive
                    </option>

                </select>

            </div>

            <div class="form-group full-width">

                <label>Resource Link</label>

                <input
                    type="text"
                    class="resource-url"
                    placeholder="https://..."
                    value="${resource.url || ""}">

            </div>

        </div>

        <div class="course-form-actions">

            <button
                type="button"
                class="btn-outline"
                onclick="removeResource(this)">

                Remove Resource

            </button>

        </div>

    `;

    container.appendChild(row);

}

function removeResource(button) {

    const resourceItem = button.closest(".resource-item");

    if (resourceItem) {
        resourceItem.remove();
    }

}
// API hook: DELETE /api/courses/{id}

let selectedCourseId = null;

function setCourseFormMode(mode, course = null) {

    const modalTitle = document.getElementById("courseModalTitle");
    const submitButton = document.getElementById("courseSubmitButton");

    if (mode === "edit" && course) {

        document.getElementById("courseTitle").value = course.title || "";
        document.getElementById("courseTeacher").value = course.teacher || "";
        document.getElementById("courseBranch").value = course.branch || "";
        document.getElementById("courseDescription").value = course.description || "";
       

        // Load Resources
        const container = document.getElementById("resourcesContainer");
        container.innerHTML = "";

        if (course.resources && course.resources.length > 0) {

            course.resources.forEach(resource => {

                addResourceRow(resource);

            });

        } else {

            addResourceRow();

        }

        if (modalTitle)
            modalTitle.textContent = "Edit Course";

        if (submitButton) {

            submitButton.textContent = "Update Course";
            submitButton.setAttribute("onclick", "updateCourse()");

        }

    } else {

        if (modalTitle)
            modalTitle.textContent = "Create New Course";

        if (submitButton) {

            submitButton.textContent = "Create Course";
            submitButton.setAttribute("onclick", "addCourse()");

        }

    }

}

function openEditCourse(id) {

    selectedCourseId = id;
    const course = window.allCourses?.find(c => c._id === id);

    if (!course) {
        showToast("Course not found");
        return;
    }

    setCourseFormMode("edit", course);
    document.getElementById("courseModal")?.classList.remove("hidden");

}


function closeCourseModal(event) {
document.body.style.overflow = "";
    const modal = document.getElementById("courseModal");
    if (!modal) return;

    if (event && event.target !== event.currentTarget) {
        return;
    }

    modal.classList.add("hidden");
    selectedCourseId = null;
    resetCourseForm();
    setCourseFormMode("create");

}

function resetCourseForm() {
    const title = document.getElementById("courseTitle");
    const teacher = document.getElementById("courseTeacher");
    const branch = document.getElementById("courseBranch");
    const description = document.getElementById("courseDescription");

    if (title) title.value = "";
    if (teacher) teacher.value = "";
    if (branch) branch.value = "";
    if (description) description.value = "";
}

async function addCourse() {

    const title = document.getElementById("courseTitle").value.trim();
    const teacher = document.getElementById("courseTeacher").value.trim();
    const branch = document.getElementById("courseBranch").value.trim();
    const description = document.getElementById("courseDescription").value.trim();

    if (!title || !teacher || !branch || !description) {
        showToast("Please fill in all course details");
        return;
    }

    try {

      const image = document.getElementById("courseImage").value;

      const resources = [];

document.querySelectorAll(".resource-item").forEach(item => {

    const title = item.querySelector(".resource-title").value.trim();
    const type = item.querySelector(".resource-type").value;
    const url = item.querySelector(".resource-url").value.trim();

    // Skip completely empty rows
    if (title && url) {
        resources.push({
            title,
            type,
            url
        });
    }

});

        const response =

            await fetch("/courses", {

                method: "POST",

                headers: {
                    "Content-Type":
                    "application/json"
                },

                body: JSON.stringify({

                    title,
                    teacher,
                    branch,
                    description,
                    image,
                    progress: 0,
                    resources

                    
                })

            });

        const data = await response.json();

        if (response.ok) {

            showToast("Course Added Successfully");
            resetCourseForm();
            closeCourseModal();
            await loadCourses();

        }
        else {

            showToast(data.message);

        }

    }
    catch (err) {

        console.log(err);

        showToast("Server Error");

    }

}


async function updateCourse() {

    if (!selectedCourseId) {
        showToast("No course selected");
        return;
    }

    const title = document.getElementById("courseTitle").value.trim();
    const teacher = document.getElementById("courseTeacher").value.trim();
    const branch = document.getElementById("courseBranch").value.trim();
    const description = document.getElementById("courseDescription").value.trim();
    const resources = [];

document.querySelectorAll(".resource-item").forEach(item => {

    const title = item.querySelector(".resource-title").value.trim();
    const type = item.querySelector(".resource-type").value;
    const url = item.querySelector(".resource-url").value.trim();

    if (title && url) {
        resources.push({
            title,
            type,
            url
        });
    }

});


    if (!title || !teacher || !branch || !description) {
        showToast("Please fill in all course details");
        return;
    }

    try {

        const response = await fetch(
            `/courses/${selectedCourseId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    title,
                    teacher,
                    branch,
                    description,
                    resources
                })
            }
        );

        const data = await response.json();

        if (response.ok) {

            showToast("Course Updated Successfully");
            resetCourseForm();
            closeCourseModal();
            await loadCourses();

        } else {

            showToast(data.message);

        }

    }
    catch (err) {

        console.log(err);

        showToast("Server Error");

    }

}

let courseToDeleteId = null;

function showDeleteCourseModal(id) {
    courseToDeleteId = id;
    const modal = document.getElementById('deleteCourseModal');
    const message = document.getElementById('deleteCourseMessage');
    if (modal) modal.classList.remove('hidden');
    if (message) message.textContent = 'This action cannot be undone.';
}

function hideDeleteCourseModal() {
    courseToDeleteId = null;
    document.getElementById('deleteCourseModal')?.classList.add('hidden');
}

async function confirmDeleteCourse() {
    if (!courseToDeleteId) return;

    try {
        const response = await fetch(`/courses/${courseToDeleteId}`, {
            method: "DELETE"
        });

        const data = await response.json();

        if (response.ok) {
            showToast("Course deleted successfully");
            hideDeleteCourseModal();
            await loadCourses();
        } else {
            showToast(data.message || "Failed to delete course");
        }
    } catch (err) {
        console.log(err);
        showToast("Server Error");
    }
}

function showLogin() {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    if (loginForm) loginForm.classList.remove("hidden");
    if (registerForm) registerForm.classList.add("hidden");

    document.querySelectorAll(".role-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.form === "login");
    });
}

function showRegister() {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    if (registerForm) registerForm.classList.remove("hidden");
    if (loginForm) loginForm.classList.add("hidden");

    document.querySelectorAll(".role-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.form === "register");
    });
}

function showForgotPassword() {

    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("registerForm").classList.add("hidden");
    document.getElementById("resetPasswordForm").classList.add("hidden");

    document.getElementById("forgotPasswordForm").classList.remove("hidden");

}

async function verifyEmail() {

    const email = document.getElementById("forgotEmail").value.trim();

    if (!email) {

        showToast("Please enter your email");

        return;

    }

    try {

        const response = await fetch("/auth/forgot-password", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email
            })

        });

        const data = await response.json();

        if (!response.ok) {

            showToast(data.message);

            return;

        }

        forgotEmail = email;

        document.getElementById("forgotPasswordForm").classList.add("hidden");
        document.getElementById("resetPasswordForm").classList.remove("hidden");

        showToast("Email verified");

    } catch (error) {

        console.log(error);

        showToast("Server Error");

    }

}

async function changePassword() {

    const password = document.getElementById("newPassword").value.trim();

    if (!password) {

        showToast("Enter a new password");

        return;

    }

    try {

        const response = await fetch("/auth/reset-password", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                email: forgotEmail,
                password

            })

        });

        const data = await response.json();

        if (!response.ok) {

            showToast(data.message);

            return;

        }

        showToast("Password changed successfully");

        document.getElementById("resetPasswordForm").classList.add("hidden");

        showLogin();

    } catch (error) {

        console.log(error);

        showToast("Server Error");

    }

}

function applyRole(user) {

  const initials = user.name
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase();

  document.getElementById("navAvatar").textContent = initials;

  document.getElementById("sidebarAvatar").textContent = initials;
  document.getElementById("sidebarName").textContent = user.name;
  document.getElementById("sidebarRole").textContent = user.role;

  document.getElementById("profileAvatar").textContent = initials;
  document.getElementById("profileName").textContent = user.name;
  document.getElementById("profileEmail").textContent = user.email;

  document.getElementById("studentNav")
    .classList.toggle("hidden", user.role !== "Student");

  document.getElementById("teacherNav")
    .classList.toggle("hidden", user.role !== "Teacher");

  if (user.role === "Student") {

    document.getElementById("studentGreetName").textContent =
      user.name.split(" ")[0];

    navigateTo("dashboard");

  }
  else {

    document.getElementById("teacherGreetName").textContent =
      user.name;

    navigateTo("teacherDashboard");

  }
}

function showLogoutModal() {
  document.getElementById('logoutModal')?.classList.remove('hidden');
}

function hideLogoutModal() {
  document.getElementById('logoutModal')?.classList.add('hidden');
}

function handleLogout() {
  showLogoutModal();
}

function performLogout() {
  hideLogoutModal();

  document.getElementById('app')?.classList.add('hidden');
  document.getElementById('loginPage')?.classList.remove('hidden');

  // Reset test state
  stopTimer();
  testState = { active: false, currentQ: 0, answers: {}, timerInterval: null, timeLeft: 900 };
  showSection('tests');
  document.getElementById('testList')?.classList.remove('hidden');
  document.getElementById('testInterface')?.classList.add('hidden');

  showToast('Signed out successfully');
}

// ============================================
// NAVIGATION
// ============================================

function navigateTo(section) {
  // Close dropdowns
  closeDropdowns();

  // Hide all sections
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

  // Show target section
  const target = document.getElementById(section);
  if (target) {
    target.classList.add('active');
    currentSection = section;
  }

  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.section === section);
  });

  // Close sidebar on mobile
  if (window.innerWidth <= 768) {
    closeSidebar();
  }
}

function showSection(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

// ============================================
// SIDEBAR
// ============================================

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const isOpen = sidebar.classList.contains('open');
  if (isOpen) {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  } else {
    sidebar.classList.add('open');
    overlay.classList.add('open');
  }
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}

// ============================================
// PASSWORD TOGGLE
// ============================================

function togglePassword() {
  const input = document.getElementById('password');
  const isText = input.type === 'text';
  input.type = isText ? 'password' : 'text';
  document.getElementById('eyeIcon').innerHTML = isText
    ? '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>'
    : '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>';
}

// ============================================
// THEME
// ============================================

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.body.classList.toggle('dark-mode', isDark);
  const toggleBtn = document.getElementById('themeToggleBtn');
  const mobileToggleBtn = document.getElementById('mobileThemeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  

  if (toggleBtn) {
    toggleBtn.setAttribute('aria-pressed', String(isDark));
  }

  if (mobileToggleBtn) {
    mobileToggleBtn.setAttribute('aria-pressed', String(isDark));
  }

  const darkIcon = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>';
  const lightIcon = '<path d="M12 3v2"/><path d="M12 19v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M3 12h2"/><path d="M19 12h2"/><path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/><circle cx="12" cy="12" r="4.5"/>';

  if (themeIcon) {
    themeIcon.innerHTML = isDark ? darkIcon : lightIcon;
  }

  

  localStorage.setItem('portalTheme', theme);
}

function toggleDarkMode() {
  const nextTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
  applyTheme(nextTheme);
}

const savedTheme = localStorage.getItem('portalTheme');
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

// ============================================
// DROPDOWNS
// ============================================

function toggleProfileMenu() {
  const pm = document.getElementById('profileMenu');
  pm.classList.toggle('hidden');
}

function closeDropdowns() {
  document.getElementById('profileMenu')?.classList.add('hidden');
}

document.addEventListener('click', e => {
  const profileWrap = document.querySelector('.profile-wrap');
  if (profileWrap && !profileWrap.contains(e.target)) {
    document.getElementById('profileMenu')?.classList.add('hidden');
  }
});

// ============================================
// SEARCH
// ============================================

function handleSearch(val) {
  // Global search — filter courses as a demo
  if (currentSection === 'courses') {
    filterCourses(val);
  }
}

// ============================================
// COURSES RENDER
// ============================================

async function loadCourses() {

    try {

        const response = await fetch("/courses");

        const courses = await response.json();

        window.allCourses = courses;

        // Teacher Dashboard - Active Courses
        document.getElementById("totalCourses").textContent =
            window.allCourses.length;
             // Student Dashboard
        document.getElementById("studentTotalCourses").textContent =
            window.allCourses.length;
          // Resources Count
document.getElementById("studentResources").textContent =
    window.allCourses.length * 3;

        renderCourses(window.allCourses);
        renderTeacherCourses(window.allCourses);

    } catch (error) {

        console.log(error);

        showToast("Failed to load courses");

    }

}

// API hook: GET /api/courses?studentId={id}&branch={branch}&semester={sem}
function normalizeCourseImage(image) {
  const defaultImage = '/images/full-stack.jpg';
  if (!image) return defaultImage;

  const normalized = image.trim();

  if (normalized.endsWith('dsa-cpp.png') || normalized.endsWith('/dsa-cpp.png')) {
    return '/images/dsa-cpp.png';
  }
  if (normalized.endsWith('dsa-java.jpg') || normalized.endsWith('/dsa-java.jpg')) {
    return '/images/dsa-java.jpg';
  }
  if (normalized.startsWith('/images/')) {
    return normalized;
  }
  return `/images/${normalized}`;
}

function renderCourses(courses) {
  const grid = document.getElementById('coursesGrid');
  if (!grid) return;
  grid.innerHTML = courses.map(c => `
    <div class="course-card" data-branch="${c.branch}" data-sem="${c.semester}">
      <div class="course-img" style="background:${c.color}">
        <img src="${normalizeCourseImage(c.image)}" alt="${c.title} cover" loading="lazy" />
      </div>
      <div class="course-body">
        <h4>${c.title}</h4>
        <p class="course-teacher">👤 ${c.teacher}</p>
        <p class="course-desc">${c.description}</p>
      </div>
      <div class="course-footer">
        <div class="course-progress-wrap">
          <div class="progress-bar"><div class="progress-fill" style="width:${c.progress}%"></div></div>
          <span>${c.progress}%</span>
        </div>
       <button class="view-btn" onclick="openResources('${c._id}')">View Resources</button>
      </div>
    </div>
  `).join('');
}

function renderTeacherCourses(courses) {
  const grid = document.getElementById('teacherCoursesGrid');
  if (!grid) return;

  const safeCourses = Array.isArray(courses) ? courses : [];

  if (safeCourses.length === 0) {
    grid.innerHTML = `
      <div class="card empty-state-card">
        <p>No courses available yet.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = safeCourses.map(c => `
    <div class="course-card">
      <div class="course-img" style="background:${c.color}">
        <img src="${normalizeCourseImage(c.image)}" alt="${c.title} cover" loading="lazy" />
      </div>
      <div class="course-body">
        <h4>${c.title}</h4>
        <p class="course-teacher">${c.teacher}</p>
        <p class="course-desc">${c.description}</p>
      </div>
      <div class="course-footer">
        <span class="badge blue">Active</span>
        <button class="view-btn" onclick="openEditCourse('${c._id}')">Edit Course</button>
        <button class="view-btn" onclick="showDeleteCourseModal('${c._id}')">Delete Course</button>
      </div>
    </div>
  `).join('');
}

function filterCourses(query) {
  const filtered = window.allCourses.filter(c =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.teacher.toLowerCase().includes(query.toLowerCase())
  );
  renderCourses(filtered);
}

function filterByBranch(branch) {
  const filtered = branch ? window.allCourses.filter(c => c.branch === branch) : window.allCourses;
  renderCourses(filtered);
}


 

// ============================================
// TESTS
// ============================================

function renderTestsList() {
  const grid = document.getElementById('testsGrid');
  if (!grid) return;
  grid.innerHTML = TESTS_LIST.map(t => `
    <div class="test-card">
      <div class="test-card-header">
        <div>
          <h4>${t.name}</h4>
          <p class="meta">${t.course}</p>
        </div>
        <span class="badge amber">Upcoming</span>
      </div>
      <div class="test-meta-row">
        <div class="test-meta-item"><span>Questions</span><span>${t.questions}</span></div>
        <div class="test-meta-item"><span>Duration</span><span>${t.duration} min</span></div>
        <div class="test-meta-item"><span>Date</span><span>${t.date}</span></div>
      </div>
      <button class="btn-primary" onclick="startTest(${t.id}, '${t.name}', ${t.duration})">Start Test →</button>
    </div>
  `).join('');
}

// API hook: POST /api/tests/{testId}/start — returns question set with token
function startTest(id, name, duration) {
  testState.currentQ = 0;
  testState.answers = {};
  testState.timeLeft = duration * 60;

  document.getElementById('testList').classList.add('hidden');
  document.getElementById('testInterface').classList.remove('hidden');
  document.getElementById('testTitle').textContent = name;
  document.getElementById('testSubInfo').textContent = `${MCQ_QUESTIONS.length} Questions · MCQ`;

  renderQuestionNav();
  renderQuestion(0);
  startTimer();
}

function renderQuestionNav() {
  const nav = document.getElementById('questionNav');
  nav.innerHTML = MCQ_QUESTIONS.map((_, i) => `
    <button class="q-nav-btn ${i === testState.currentQ ? 'active' : ''} ${testState.answers[i] !== undefined ? 'answered' : ''}"
      onclick="jumpToQuestion(${i})">${i + 1}</button>
  `).join('');
}

function renderQuestion(idx) {
  const q = MCQ_QUESTIONS[idx];
  document.getElementById('qNumber').textContent = `Question ${idx + 1} of ${MCQ_QUESTIONS.length}`;
  document.getElementById('qText').textContent = q.q;

  const letters = ['A', 'B', 'C', 'D'];
  document.getElementById('optionsList').innerHTML = q.options.map((opt, i) => `
    <button class="option-btn ${testState.answers[idx] === i ? 'selected' : ''}" onclick="selectOption(${idx}, ${i})">
      <span class="option-letter">${letters[i]}</span>
      <span>${opt}</span>
    </button>
  `).join('');

  // Update Next/Submit button
  const btn = document.getElementById('nextSubmitBtn');
  if (idx === MCQ_QUESTIONS.length - 1) {
    btn.textContent = 'Submit Test';
    btn.style.background = '#16a34a';
  } else {
    btn.textContent = 'Next →';
    btn.style.background = '';
  }
}

function selectOption(qIdx, optIdx) {
  testState.answers[qIdx] = optIdx;
  renderQuestion(qIdx);
  renderQuestionNav();
}

function jumpToQuestion(idx) {
  testState.currentQ = idx;
  renderQuestion(idx);
  renderQuestionNav();
}

function prevQuestion() {
  if (testState.currentQ > 0) {
    testState.currentQ--;
    renderQuestion(testState.currentQ);
    renderQuestionNav();
  }
}

function nextOrSubmit() {
  if (testState.currentQ === MCQ_QUESTIONS.length - 1) {
    submitTest();
  } else {
    testState.currentQ++;
    renderQuestion(testState.currentQ);
    renderQuestionNav();
  }
}

// ============================================
// TIMER
// ============================================

function startTimer() {
  stopTimer();
  updateTimerDisplay();
  testState.timerInterval = setInterval(() => {
    testState.timeLeft--;
    updateTimerDisplay();
    if (testState.timeLeft <= 0) {
      stopTimer();
      submitTest(true);
    }
    // Change color when < 3 min
    if (testState.timeLeft < 180) {
      document.querySelector('.timer-box').style.borderColor = '#ef4444';
      document.getElementById('timerDisplay').style.color = '#ef4444';
    }
  }, 1000);
}

function stopTimer() {
  if (testState.timerInterval) {
    clearInterval(testState.timerInterval);
    testState.timerInterval = null;
  }
}

function updateTimerDisplay() {
  const m = Math.floor(testState.timeLeft / 60).toString().padStart(2, '0');
  const s = (testState.timeLeft % 60).toString().padStart(2, '0');
  const display = document.getElementById('timerDisplay');
  if (display) display.textContent = `${m}:${s}`;
}

// ============================================
// SUBMIT TEST & RESULT MODAL
// ============================================

// API hook: POST /api/tests/{testId}/submit { answers: { 0: 2, 1: 1, ... } }
// Response: { score, correct, wrong, skipped, percentage }
function submitTest(timeout = false) {
  stopTimer();

  let correct = 0, wrong = 0, skipped = 0;

  MCQ_QUESTIONS.forEach((q, i) => {
    if (testState.answers[i] === undefined) {
      skipped++;
    } else if (testState.answers[i] === q.answer) {
      correct++;
    } else {
      wrong++;
    }
  });

  const total = MCQ_QUESTIONS.length;
  const pct = Math.round((correct / total) * 100);

  // Show result modal
  document.getElementById('modalIcon').textContent = pct >= 60 ? '🎉' : '📝';
  document.getElementById('modalTitle').textContent = timeout ? 'Time\'s Up!' : 'Test Submitted!';
  document.getElementById('modalSubtitle').textContent = `Here's how you performed`;
  document.getElementById('modalCorrect').textContent = correct;
  document.getElementById('modalWrong').textContent = wrong;
  document.getElementById('modalSkipped').textContent = skipped;
  document.getElementById('modalPct').textContent = `${pct}%`;

  // Animate ring
  setTimeout(() => {
    document.getElementById('scoreRingFill').setAttribute('stroke-dasharray', `${pct}, 100`);
    document.getElementById('scoreRingFill').style.stroke = pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';
  }, 100);

  document.getElementById('resultModal').classList.remove('hidden');
}

function closeResultModal() {
  document.getElementById('resultModal').classList.add('hidden');
  document.getElementById('testList').classList.remove('hidden');
  document.getElementById('testInterface').classList.add('hidden');
  testState = { active: false, currentQ: 0, answers: {}, timerInterval: null, timeLeft: 900 };
}

// ============================================
// RESULTS TABLE
// ============================================

// API hook: GET /api/results?studentId={id}&course={course}
function renderResults(data) {
  const body = document.getElementById('resultsBody');
  if (!body) return;

  body.innerHTML = data.map(r => {
    const pct = Math.round((r.marks / r.total) * 100);
    let grade, badgeClass;
    if (pct >= 90) { grade = 'A+'; badgeClass = 'green'; }
    else if (pct >= 80) { grade = 'A'; badgeClass = 'green'; }
    else if (pct >= 70) { grade = 'B'; badgeClass = 'blue'; }
    else if (pct >= 60) { grade = 'C'; badgeClass = 'amber'; }
    else { grade = 'F'; badgeClass = 'red'; }

    const status = pct >= 50 ? 'Pass' : 'Fail';
    const statusClass = pct >= 50 ? 'green' : 'red';

    return `<tr>
      <td>${r.course}</td>
      <td>${r.test}</td>
      <td class="score-val">${r.marks}</td>
      <td>${r.total}</td>
      <td><div class="progress-bar" style="width:80px"><div class="progress-fill" style="width:${pct}%"></div></div></td>
      <td><span class="badge ${statusClass}">${status}</span></td>
      <td>${r.date}</td>
    </tr>`;
  }).join('');
}

function filterResults(course) {
  // API hook: GET /api/results?studentId={id}&course={course}
  const filtered = course ? RESULTS_DATA.filter(r => r.course === course) : RESULTS_DATA;
  renderResults(filtered);
}

// ============================================
// STUDENTS TABLE (Teacher)
// ============================================

// API hook: GET /api/students?teacherId={id}&course={course}

async function fetchStudents() {

    try {

        const response = await fetch("/auth/students");

        const students = await response.json();

        // Save globally
        window.allStudents = students;

        // Students Page
        renderStudents(students);

        // Teacher Dashboard
        renderRecentStudents(students);

        document.getElementById("totalStudents").textContent =
            students.length;

    } catch (err) {

        console.log(err);

    }

}

function renderStudents(data) {
  const body = document.getElementById('studentsBody');
  if (!body) return;

  // Color classes for avatars
  const colorClasses = ['blue-av', 'green-av', 'amber-av', 'purple-av', 'red-av'];

  body.innerHTML = data.map((s, index) => {
    // Generate initials from name
    const initials = s.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    // Assign color based on index
    const color = colorClasses[index % colorClasses.length];

    // Format student ID
    const studentId = s._id || 'N/A';

    // Get branch (default to CSE if not set)
    const branch = s.branch || 'CSE';

    // Format average as percentage
    const avgScore = s.avg ? `${s.avg}%` : '—';

    // Status badge color
    const statusBadgeClass = s.status === 'Active' ? 'green' : (s.status === 'At Risk' ? 'amber' : 'gray');

    return `
      <tr>
        <td><div class="student-cell"><div class="mini-avatar ${color}">${initials}</div>${s.name}</div></td>
        <td>${studentId}</td>
        <td>${branch}</td>
        <td>${avgScore}</td>
        <td><span class="badge ${statusBadgeClass}">${s.status || 'Active'}</span></td>
      </tr>
    `;
  }).join('');
}

function renderRecentStudents(data) {

    const body = document.getElementById("recentStudentsBody");

    if (!body) return;

    const colorClasses = ['blue-av', 'green-av', 'amber-av', 'purple-av', 'red-av'];

    body.innerHTML = data
        .slice(0, 5)
        .map((s, index) => {

            const initials = s.name
                .split(" ")
                .map(word => word[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

            const color = colorClasses[index % colorClasses.length];

            const branch = s.branch || "CSE";

            const avgScore = s.avg ? `${s.avg}%` : "—";

            const statusBadgeClass =
                s.status === "At Risk" ? "amber" : "green";

            return `
                <tr>

                    <td>
                        <div class="student-cell">
                            <div class="mini-avatar ${color}">
                                ${initials}
                            </div>
                            ${s.name}
                        </div>
                    </td>

                    <td>${branch}</td>

                    <td>${avgScore}</td>

                    <td>
                        <span class="badge ${statusBadgeClass}">
                            ${s.status || "Active"}
                        </span>
                    </td>

                </tr>
            `;

        }).join("");

}

// ============================================
// TEACHER TESTS TABLE
// ============================================

function renderTeacherTests(data) {
  const body = document.getElementById('teacherTestsBody');
  if (!body) return;

  body.innerHTML = data.map(t => {
    const statusMap = { Published: 'blue', Upcoming: 'amber', Completed: 'green', Draft: '' };
    const badgeClass = statusMap[t.status] || 'amber';
    return `<tr>
      <td>${t.name}</td>
      <td>${t.course}</td>
      <td>${t.questions}</td>
      <td>${t.duration}</td>
      <td>${t.attempts}</td>
      <td>${t.avg}</td>
      <td><span class="badge ${badgeClass}">${t.status}</span></td>
    </tr>`;
  }).join('');
}

// ============================================
// PROFILE
// ============================================

function showEditProfile() {
  const card = document.getElementById('editProfileCard');
  card.classList.remove('hidden');
  card.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideEditProfile() {
  document.getElementById('editProfileCard').classList.add('hidden');
}

// API hook: PUT /api/profile/{userId} { name, email, phone, ... }
// Headers: { Authorization: Bearer {JWT} }
  async function saveProfile() {

    const user =
        JSON.parse(localStorage.getItem("user"));

    const nameInput = document.getElementById("editName");
    const emailInput = document.getElementById("editEmail");
    const phoneInput = document.getElementById("editPhone");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();

    clearFieldError("editName");
    clearFieldError("editEmail");
    clearFieldError("editPhone");

    if (!name) {
        showFieldError("editName", "Full name is required");
    }
    if (!email) {
        showFieldError("editEmail", "Email is required");
    }
    if (!phone) {
        showFieldError("editPhone", "Phone is required");
    }

    if (!name || !email || !phone) {
        return;
    }

    try {

        const response = await fetch(

            `/auth/${user._id}`,

            {
                method: "PUT",

                headers: {
                    "Content-Type":
                    "application/json"
                },

                body: JSON.stringify({
                    name,
                    email
                })

            }

        );

        const data = await response.json();

        if (!response.ok) {

            showToast(data.message);
            return;

        }

        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

        document.getElementById("profileName").textContent =
            data.user.name;

        document.getElementById("profileEmail").textContent =
            data.user.email;

        hideEditProfile();

        showToast(
            "Profile updated successfully"
        );

    } catch (error) {

        showToast("Server Error");

    }

}


// ============================================
// UTILITIES
// ============================================

function setHeaderDate() {
  const el = document.getElementById('headerDate');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

let toastTimeout;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => t.classList.add('hidden'), 3000);  // Hide after 3 seconds
}

document.getElementById('confirmLogoutBtn')?.addEventListener('click', performLogout);
document.getElementById('cancelLogoutBtn')?.addEventListener('click', hideLogoutModal);
document.getElementById('logoutModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'logoutModal') {
    hideLogoutModal();
  }
});

document.getElementById('confirmDeleteCourseBtn')?.addEventListener('click', confirmDeleteCourse);
document.getElementById('cancelDeleteCourseBtn')?.addEventListener('click', hideDeleteCourseModal);
document.getElementById('deleteCourseModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'deleteCourseModal') {
    hideDeleteCourseModal();
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  // Escape: close modals/dropdowns
  if (e.key === 'Escape') {
    closeDropdowns();
    document.getElementById('resultModal')?.classList.add('hidden');
    closeSidebar();
  }
  // Ctrl/Cmd + K: focus search
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    document.getElementById('globalSearch')?.focus();
  }
});

// Handle window resize
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    closeSidebar();
  }
});

function openResources(courseId) {

    document.body.style.overflow = "hidden";

    const course = window.allCourses.find(c => c._id === courseId);

    if (!course) {
        showToast("Course not found");
        return;
    }

    const list = document.getElementById("resourceList");

    if (!course.resources || course.resources.length === 0) {

        list.innerHTML = `
            <p style="text-align:center;color:var(--text-muted);">
                No resources available.
            </p>
        `;

    } else {

        list.innerHTML = course.resources.map(resource => `
            <div class="resource-card">

                <div class="resource-info">
                    <h4>${resource.title}</h4>
                    <p class="resource-type">
    ${
        resource.type === "youtube"
            ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="#FF0000">
                   <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.4.6A3 3 0 0 0 .5 6.2 31.7 31.7 0 0 0 0 12a31.7 31.7 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.7 31.7 0 0 0 24 12a31.7 31.7 0 0 0-.5-5.8z"/>
                   <path d="M10 15.5V8.5L16 12z" fill="white"/>
               </svg>`
        : resource.type === "documentation"
            ? `📄`
        : resource.type === "website"
            ? `🌐`
        : `📁`
    }
</p>
                </div>

                <a href="${resource.url}"
                   target="_blank"
                   class="view-btn">

                    Open

                </a>

            </div>
        `).join("");

    }

    const modal = document.getElementById("resourceModal");

    if (!modal) return;

    modal.classList.remove("hidden");

}

function closeResourceModal(event) {

    document.body.style.overflow = "";

    const modal = document.getElementById("resourceModal");

    if (!modal) return;

    if (event && event.target !== event.currentTarget) {
        return;
    }

    modal.classList.add("hidden");

}