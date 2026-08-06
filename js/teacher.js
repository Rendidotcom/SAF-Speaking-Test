/**
 * ==========================================
 * SAF Speaking Online Test
 * Teacher Dashboard
 * Stable Foundation v6.0
 * ==========================================
 * Frontend Sync
 * - Question.gs
 * - Student.gs
 * - Token.gs
 * - Result.gs
 * - Score.gs
 * ==========================================
 */

document.addEventListener("DOMContentLoaded", init);

/* =====================================================
   GLOBAL STATE
===================================================== */

const APP = {
    question: [],
    student: [],
    token: [],
    result: []
};

const STATE = {
    questionEdit: false,
    questionId: null,

    studentEdit: false,
    studentId: null,

    resultId: null
};

/* =====================================================
   INITIALIZE
===================================================== */

async function init() {

    checkSession();

    bindMenu();

    bindLogout();

    await refreshDashboard();

    loadDashboard();

}

/* =====================================================
   SESSION
===================================================== */

function checkSession() {

    const session = sessionStorage.getItem(CONFIG.SESSION_KEY);

    if (!session) {

        window.location.href = "login.html?role=teacher";
        return;

    }

    try {

        const user = JSON.parse(session);

        if (user.role !== "teacher") {

            logout();

        }

    } catch (err) {

        logout();

    }

}

function logout() {

    sessionStorage.removeItem(CONFIG.SESSION_KEY);

    sessionStorage.removeItem(CONFIG.TOKEN_KEY);

    window.location.href = "index.html";

}

function bindLogout() {

    document.querySelectorAll("a").forEach(link => {

        if (link.textContent.includes("Logout")) {

            link.onclick = function (e) {

                e.preventDefault();

                logout();

            };

        }

    });

}

/* =====================================================
   SIDEBAR
===================================================== */

function bindMenu() {

    document.querySelectorAll("[data-page]").forEach(menu => {

        menu.onclick = function (e) {

            e.preventDefault();

            switch (this.dataset.page) {

                case "dashboard":
                    loadDashboard();
                    break;

                case "question":
                    loadQuestionPage();
                    break;

                case "student":
                    loadStudentPage();
                    break;

                case "token":
                    loadTokenPage();
                    break;

                case "result":
                    loadResultPage();
                    break;

            }

        };

    });

}

/* =====================================================
   CONTENT
===================================================== */

function setContent(html) {

    document.getElementById("content").innerHTML = html;

}

/* =====================================================
   DASHBOARD
===================================================== */

async function refreshDashboard() {

    try {

        const q = await apiGetQuestion();

        if (q.success) {

            APP.question = q.data || [];

        }

        const s = await apiGetStudent();

        if (s.success) {

            APP.student = s.data || [];

        }

        const t = await apiGetToken();

        if (t.success) {

            APP.token = t.data || [];

        }

        const r = await apiGetResult();

        if (r.success) {

            APP.result = r.data || [];

        }

        updateDashboardCounter();

    }

    catch (err) {

        console.error(err);

    }

}

function updateDashboardCounter() {

    setCounter("totalQuestion", APP.question.length);

    setCounter("totalStudent", APP.student.length);

    setCounter("totalToken", APP.token.length);

    setCounter("totalResult", APP.result.length);

}

function setCounter(id, value) {

    const el = document.getElementById(id);

    if (el) {

        el.textContent = value;

    }

}

function loadDashboard() {

    setContent(`

        <h2>Dashboard</h2>

        <br>

        <p>

            Welcome to SAF Speaking Online Test Teacher Dashboard.

        </p>

        <br>

        <table width="100%" cellpadding="8" border="1">

            <tr>

                <th>Total Questions</th>
                <th>Total Students</th>
                <th>Total Token</th>
                <th>Total Results</th>

            </tr>

            <tr>

                <td>${APP.question.length}</td>
                <td>${APP.student.length}</td>
                <td>${APP.token.length}</td>
                <td>${APP.result.length}</td>

            </tr>

        </table>

    `);

}
/* =====================================================
   DASHBOARD
===================================================== */

async function refreshDashboard() {

    try {

        const [q, s, t, r] = await Promise.all([
            apiGetQuestion(),
            apiGetStudent(),
            apiGetToken(),
            apiGetResult()
        ]);

        APP.question = q.success ? (q.data || []) : [];
        APP.student = s.success ? (s.data || []) : [];
        APP.token    = t.success ? (t.data || []) : [];
        APP.result   = r.success ? (r.data || []) : [];

        updateQuestionCounter(APP.question.length);
        updateStudentCounter(APP.student.length);
        updateTokenCounter(APP.token.length);
        updateResultCounter(APP.result.length);

    } catch (err) {

        console.error(err);

    }

}

function loadDashboard() {

    refreshDashboard();

    setContent(`

        <h2>Dashboard</h2>

        <br>

        <p>

            Welcome to SAF Speaking Online Test Teacher Dashboard.

        </p>

        <br>

        <p>

            Use the left menu to manage Questions,
            Students, Exam Tokens and Results.

        </p>

    `);

}

/* =====================================================
   QUESTION PAGE
===================================================== */

function loadQuestionPage() {

    setContent(`

<h2>Speaking Question Database</h2>

<br>

<form id="questionForm">

<label>Title</label>

<input
id="title"
type="text"
required>

<br><br>

<label>Answer Key</label>

<textarea
id="answer"
rows="5"
required></textarea>

<br><br>

<label>Difficulty</label>

<select id="difficulty">

<option value="Easy">Easy</option>
<option value="Medium">Medium</option>
<option value="Hard">Hard</option>

</select>

<br><br>

<label>Duration (Second)</label>

<input
id="duration"
type="number"
value="30"
min="10"
required>

<br><br>

<button
id="btnSaveQuestion"
type="submit"
class="btn teacher">

Save Question

</button>

<button
type="button"
onclick="resetQuestionForm()">

Cancel

</button>

</form>

<br>

<input
id="searchQuestion"
type="text"
placeholder="Search question..."
onkeyup="filterQuestion()">

<br><br>

<div id="questionTable">

Loading...

</div>

`);

    document
        .getElementById("questionForm")
        .addEventListener("submit", saveQuestion);

    loadQuestions();

}

/* =====================================================
   SAVE QUESTION
===================================================== */

async function saveQuestion(e) {

    e.preventDefault();

    const data = {

        title: document.getElementById("title").value.trim(),

        answer: document.getElementById("answer").value.trim(),

        difficulty: document.getElementById("difficulty").value,

        duration: Number(
            document.getElementById("duration").value
        ),

        status: "Active",

        createdBy: "Teacher"

    };

    let res;

    if (editMode) {

        data.id = selectedQuestionId;

        res = await apiUpdateQuestion(data);

    } else {

        res = await apiInsertQuestion(data);

    }

    alert(res.message);

    if (!res.success) return;

    resetQuestionForm();

    await loadQuestions();

    await refreshDashboard();

}
/* =====================================================
   STUDENT PAGE
===================================================== */

function loadStudentPage() {

    setContent(`

<h2>Student Database</h2>

<br>

<form id="studentForm">

<label>NIS</label>

<input
id="nis"
required>

<br><br>

<label>Student Name</label>

<input
id="nama"
required>

<br><br>

<label>Class</label>

<input
id="kelas"
required>

<br><br>

<label>Username</label>

<input
id="username"
required>

<br><br>

<label>Password</label>

<input
id="password"
type="password"
required>

<br><br>

<button
id="btnSaveStudent"
type="submit"
class="btn teacher">

Save Student

</button>

<button
type="button"
onclick="resetStudentForm()">

Cancel

</button>

</form>

<br>

<input
id="searchStudent"
type="text"
placeholder="Search Student..."
onkeyup="filterStudent()">

<br><br>

<div id="studentTable">

Loading...

</div>

`);

    document
        .getElementById("studentForm")
        .addEventListener("submit", saveStudent);

    loadStudents();

}

/* =====================================================
   SAVE STUDENT
===================================================== */

async function saveStudent(e) {

    e.preventDefault();

    const data = {

        nis: document.getElementById("nis").value.trim(),

        nama: document.getElementById("nama").value.trim(),

        kelas: document.getElementById("kelas").value.trim(),

        username: document.getElementById("username").value.trim(),

        password: document.getElementById("password").value.trim(),

        status: "Active"

    };

    let res;

    if (STATE.studentEdit) {

        res = await apiUpdateStudent(data);

    } else {

        res = await apiInsertStudent(data);

    }

    alert(res.message);

    if (!res.success) return;

    resetStudentForm();

    await loadStudents();

    await refreshDashboard();

}

/* =====================================================
   LOAD STUDENT
===================================================== */

async function loadStudents() {

    const res = await apiGetStudent();

    const table = document.getElementById("studentTable");

    if (!res.success) {

        table.innerHTML =
            "<p style='color:red'>" +
            escapeHTML(res.message) +
            "</p>";

        return;

    }

    APP.student = res.data || [];

    updateStudentCounter(APP.student.length);

    if (APP.student.length === 0) {

        table.innerHTML = "<p>No student found.</p>";

        return;

    }

    let html = `

<table border="1" width="100%" cellpadding="8">

<thead>

<tr>

<th>No</th>

<th>NIS</th>

<th>Name</th>

<th>Class</th>

<th>Username</th>

<th>Status</th>

<th>Action</th>

</tr>

</thead>

<tbody>

`;

    APP.student.forEach((s, i) => {

        html += `

<tr>

<td>${i + 1}</td>

<td>${escapeHTML(s.nis)}</td>

<td>${escapeHTML(s.nama)}</td>

<td>${escapeHTML(s.kelas)}</td>

<td>${escapeHTML(s.username)}</td>

<td>${escapeHTML(s.status)}</td>

<td>

<button
class="btn edit"
onclick="editStudent('${s.nis}')">

Edit

</button>

<button
class="btn delete"
onclick="deleteStudent('${s.nis}')">

Delete

</button>

</td>

</tr>

`;

    });

    html += `

</tbody>

</table>

`;

    table.innerHTML = html;

}

/* =====================================================
   EDIT STUDENT
===================================================== */

function editStudent(nis) {

    const s = APP.student.find(item => item.nis === nis);

    if (!s) {

        alert("Student not found.");

        return;

    }

    STATE.studentEdit = true;

    STATE.studentId = nis;

    document.getElementById("nis").value = s.nis;

    document.getElementById("nama").value = s.nama;

    document.getElementById("kelas").value = s.kelas;

    document.getElementById("username").value = s.username;

    document.getElementById("password").value = s.password || "";

    document.getElementById("btnSaveStudent")
        .innerText = "Update Student";

}

/* =====================================================
   DELETE STUDENT
===================================================== */

async function deleteStudent(nis) {

    if (!confirm("Delete this student?")) {

        return;

    }

    const res = await apiDeleteStudent({

        nis: nis

    });

    alert(res.message);

    if (!res.success) return;

    if (STATE.studentId === nis) {

        resetStudentForm();

    }

    await loadStudents();

    await refreshDashboard();

}

/* =====================================================
   RESET STUDENT FORM
===================================================== */

function resetStudentForm() {

    STATE.studentEdit = false;

    STATE.studentId = null;

    const form = document.getElementById("studentForm");

    if (form) {

        form.reset();

    }

    const btn = document.getElementById("btnSaveStudent");

    if (btn) {

        btn.innerText = "Save Student";

    }

}

/* =====================================================
   SEARCH STUDENT
===================================================== */

function filterStudent() {

    const keyword = document
        .getElementById("searchStudent")
        .value
        .toLowerCase();

    document
        .querySelectorAll("#studentTable tbody tr")
        .forEach(row => {

            row.style.display =
                row.innerText.toLowerCase().includes(keyword)
                    ? ""
                    : "none";

        });

}
/* =====================================================
   TOKEN PAGE
===================================================== */

function loadTokenPage() {

    setContent(`

<h2>Exam Token</h2>

<br>

<form id="tokenForm">

<label>Class</label>

<input
id="tokenClass"
required>

<br><br>

<label>Expired (Minutes)</label>

<input
id="expired"
type="number"
value="30"
min="1"
required>

<br><br>

<label>Note</label>

<input
id="note">

<br><br>

<button
type="submit"
class="btn teacher">

Generate Token

</button>

</form>

<br>

<input
id="searchToken"
type="text"
placeholder="Search Token..."
onkeyup="filterToken()">

<br><br>

<div id="tokenTable">

Loading...

</div>

`);

    document
        .getElementById("tokenForm")
        .addEventListener("submit", generateExamToken);

    loadTokens();

}

/* =====================================================
   GENERATE TOKEN
===================================================== */

async function generateExamToken(e) {

    e.preventDefault();

    const data = {

        kelas: document.getElementById("tokenClass").value.trim(),

        expired: Number(
            document.getElementById("expired").value
        ),

        note: document.getElementById("note").value.trim(),

        createdBy: "Teacher"

    };

    const res = await apiCreateToken(data);

    alert(res.message);

    if (!res.success) return;

    document.getElementById("tokenForm").reset();

    document.getElementById("expired").value = 30;

    await loadTokens();

    await refreshDashboard();

}

/* =====================================================
   LOAD TOKEN
===================================================== */

async function loadTokens() {

    const res = await apiGetToken();

    const table = document.getElementById("tokenTable");

    if (!res.success) {

        table.innerHTML =
            "<p style='color:red'>" +
            escapeHTML(res.message) +
            "</p>";

        return;

    }

    APP.token = res.data || [];

    updateTokenCounter(APP.token.length);

    if (APP.token.length === 0) {

        table.innerHTML = "<p>No token found.</p>";

        return;

    }

    let html = `

<table border="1" width="100%" cellpadding="8">

<thead>

<tr>

<th>No</th>

<th>Token</th>

<th>Class</th>

<th>Status</th>

<th>Expired</th>

<th>Action</th>

</tr>

</thead>

<tbody>

`;

    APP.token.forEach((t, i) => {

        html += `

<tr>

<td>${i + 1}</td>

<td><b>${escapeHTML(t.token)}</b></td>

<td>${escapeHTML(t.kelas)}</td>

<td>${escapeHTML(t.status)}</td>

<td>${escapeHTML(t.expired)}</td>

<td>

<button
class="btn edit"
onclick="disableExamToken('${t.token}')">

Disable

</button>

<button
class="btn delete"
onclick="deleteExamToken('${t.token}')">

Delete

</button>

</td>

</tr>

`;

    });

    html += `

</tbody>

</table>

`;

    table.innerHTML = html;

}

/* =====================================================
   DISABLE TOKEN
===================================================== */

async function disableExamToken(token) {

    if (!confirm("Disable this token?")) {

        return;

    }

    const res = await apiDisableToken({

        token: token

    });

    alert(res.message);

    if (!res.success) return;

    await loadTokens();

    await refreshDashboard();

}

/* =====================================================
   DELETE TOKEN
===================================================== */

async function deleteExamToken(token) {

    if (!confirm("Delete this token?")) {

        return;

    }

    const res = await apiDeleteToken({

        token: token

    });

    alert(res.message);

    if (!res.success) return;

    await loadTokens();

    await refreshDashboard();

}

/* =====================================================
   SEARCH TOKEN
===================================================== */

function filterToken() {

    const keyword = document
        .getElementById("searchToken")
        .value
        .toLowerCase();

    document
        .querySelectorAll("#tokenTable tbody tr")
        .forEach(row => {

            row.style.display =
                row.innerText.toLowerCase().includes(keyword)
                    ? ""
                    : "none";

        });

}
/* =====================================================
   RESULT PAGE
===================================================== */

function loadResultPage() {

    setContent(`

<h2>Speaking Results</h2>

<br>

<input
id="searchResult"
type="text"
placeholder="Search Student..."
onkeyup="filterResult()">

<br><br>

<div id="resultTable">

Loading...

</div>

`);

    loadResults();

}

/* =====================================================
   LOAD RESULT
===================================================== */

async function loadResults() {

    const res = await apiGetResult();

    const table = document.getElementById("resultTable");

    if (!res.success) {

        table.innerHTML =
            "<p style='color:red'>" +
            escapeHTML(res.message) +
            "</p>";

        return;

    }

    APP.result = res.data || [];

    updateResultCounter(APP.result.length);

    if (APP.result.length === 0) {

        table.innerHTML = "<p>No result found.</p>";

        return;

    }

    let html = `

<table border="1" width="100%" cellpadding="8">

<thead>

<tr>

<th>No</th>

<th>NIS</th>

<th>Name</th>

<th>Question</th>

<th>Score</th>

<th>Feedback</th>

<th>Action</th>

</tr>

</thead>

<tbody>

`;

    APP.result.forEach((r, i) => {

        html += `

<tr>

<td>${i + 1}</td>

<td>${escapeHTML(r.nis)}</td>

<td>${escapeHTML(r.nama)}</td>

<td>${escapeHTML(r.question)}</td>

<td><b>${escapeHTML(r.score)}</b></td>

<td>${escapeHTML(r.feedback || "-")}</td>

<td>

<button
class="btn delete"
onclick="deleteResult('${r.id}')">

Delete

</button>

</td>

</tr>

`;

    });

    html += `

</tbody>

</table>

`;

    table.innerHTML = html;

}

/* =====================================================
   DELETE RESULT
===================================================== */

async function deleteResult(id) {

    if (!confirm("Delete this result?")) {

        return;

    }

    const res = await apiDeleteResult({

        id: id

    });

    alert(res.message);

    if (!res.success) return;

    await loadResults();

    await refreshDashboard();

}

/* =====================================================
   SEARCH RESULT
===================================================== */

function filterResult() {

    const keyword = document
        .getElementById("searchResult")
        .value
        .toLowerCase();

    document
        .querySelectorAll("#resultTable tbody tr")
        .forEach(row => {

            row.style.display =
                row.innerText.toLowerCase().includes(keyword)
                    ? ""
                    : "none";

        });

}

/* =====================================================
   COUNTERS
===================================================== */

function updateQuestionCounter(total) {

    const el = document.getElementById("totalQuestion");

    if (el) {

        el.textContent = total;

    }

}

function updateStudentCounter(total) {

    const el = document.getElementById("totalStudent");

    if (el) {

        el.textContent = total;

    }

}

function updateTokenCounter(total) {

    const el = document.getElementById("totalToken");

    if (el) {

        el.textContent = total;

    }

}

function updateResultCounter(total) {

    const el = document.getElementById("totalResult");

    if (el) {

        el.textContent = total;

    }

}

/* =====================================================
   COMMON HELPERS
===================================================== */

function escapeHTML(text) {

    return String(text || "")

        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

function formatDate(value) {

    if (!value) return "-";

    const d = new Date(value);

    if (isNaN(d)) return value;

    return d.toLocaleString();

}

/* =====================================================
   RESET QUESTION FORM
===================================================== */

function resetQuestionForm() {

    editMode = false;

    selectedQuestionId = null;

    const form = document.getElementById("questionForm");

    if (form) {

        form.reset();

    }

    const duration = document.getElementById("duration");

    if (duration) {

        duration.value = 30;

    }

    const btn = document.getElementById("btnSaveQuestion");

    if (btn) {

        btn.innerText = "Save Question";

    }

}

/* =====================================================
   SEARCH QUESTION
===================================================== */

function filterQuestion() {

    const keyword = document
        .getElementById("searchQuestion")
        .value
        .toLowerCase();

    document
        .querySelectorAll("#questionTable tbody tr")
        .forEach(row => {

            row.style.display =
                row.innerText.toLowerCase().includes(keyword)
                    ? ""
                    : "none";

        });

}

/* =====================================================
   END OF FILE
===================================================== */