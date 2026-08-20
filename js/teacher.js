/**
 * ==========================================================
 * SAF Speaking Online Test
 * Teacher Dashboard
 *
 * File:
 * js/teacher.js
 *
 * ==========================================================
 * STABLE FOUNDATION
 * ==========================================================
 *
 * Version:
 * teacher.js v7.3 Final Clean
 *
 * BASELINE:
 * v7.2 Stable Foundation
 *
 * ==========================================================
 * CHANGE CONTROL
 * ==========================================================
 *
 * NO backend change
 * NO API contract change
 * NO QuestionId change
 * NO Token logic change
 * NO Score logic change
 * NO Result structure change
 *
 * ==========================================================
 * v7.3 FEATURES PRESERVED
 * ==========================================================
 *
 * - Teacher Dashboard
 * - Question Management
 * - Student Management
 * - Exam Token Management
 * - Speaking Results
 * - Result Checkbox
 * - Select All
 * - Delete Selected
 * - Delete All
 * - Reports Page
 * - Class Filter
 * - Report Summary
 * - Export Excel
 *
 * ==========================================================
 * ARCHITECTURE
 * ==========================================================
 *
 * Teacher dashboard business logic only.
 *
 * This file:
 *
 * - DOES NOT call GAS directly.
 * - DOES NOT depend on exam.js.
 * - Uses existing API helper functions.
 * - Preserves existing frontend/backend contracts.
 *
 * ==========================================================
 * GLOBAL STATE
 * ==========================================================
 *
 * APP.question
 * APP.student
 * APP.token
 * APP.result
 *
 * ==========================================================
 * RESULT API COMPATIBILITY
 * ==========================================================
 *
 * Supported:
 *
 * 1.
 * {
 *     success: true,
 *     data: [...]
 * }
 *
 * 2.
 * {
 *     0: {...},
 *     1: {...},
 *     2: {...},
 *     success: true,
 *     message: "Success"
 * }
 *
 * ==========================================================
 */


/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    init
);


/* ==========================================================
   GLOBAL STATE
========================================================== */

const APP = {

    question: [],

    student: [],

    token: [],

    result: []

};


/* ==========================================================
   PAGE STATE
========================================================== */

const STATE = {

    questionEdit: false,

    questionId: null,

    studentEdit: false,

    studentId: null,

    resultId: null,

    reportClass: ""

};


/* ==========================================================
   INITIALIZE
========================================================== */

async function init() {

    checkSession();

    bindMenu();

    bindLogout();

    await refreshDashboard();

    loadDashboard();

}


/* ==========================================================
   SESSION
========================================================== */

function checkSession() {

    const session =
        sessionStorage.getItem(
            CONFIG.SESSION_KEY
        );


    if (!session) {

        window.location.href =
            "login.html?role=teacher";

        return;

    }


    try {

        const user =
            JSON.parse(session);


        if (
            !user ||
            user.role !== "teacher"
        ) {

            logout();

        }

    }

    catch (err) {

        console.error(
            "SESSION ERROR:",
            err
        );

        logout();

    }

}


/* ==========================================================
   LOGOUT
========================================================== */

function logout() {

    sessionStorage.removeItem(
        CONFIG.SESSION_KEY
    );


    sessionStorage.removeItem(
        CONFIG.TOKEN_KEY
    );


    window.location.href =
        "index.html";

}


/* ==========================================================
   LOGOUT BINDING
========================================================== */

function bindLogout() {

    document
        .querySelectorAll("a")
        .forEach(link => {

            if (
                link.textContent
                    .trim()
                    .includes("Logout")
            ) {

                link.onclick =
                    function (e) {

                        e.preventDefault();

                        logout();

                    };

            }

        });

}


/* ==========================================================
   SIDEBAR MENU
========================================================== */

function bindMenu() {

    document
        .querySelectorAll("[data-page]")
        .forEach(menu => {

            menu.onclick =
                function (e) {

                    e.preventDefault();


                    const page =
                        this.dataset.page;


                    switch (page) {

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


                        case "report":

                        case "reports":

                            loadReportsPage();

                            break;

                    }

                };

        });

}


/* ==========================================================
   CONTENT
========================================================== */

function setContent(html) {

    const content =
        document.getElementById(
            "content"
        );


    if (!content) {

        console.error(
            "Teacher dashboard: #content not found."
        );

        return;

    }


    content.innerHTML =
        html;

}


/* ==========================================================
   API ARRAY NORMALIZER
========================================================== */

function normalizeApiArray(value) {

    if (Array.isArray(value)) {

        return value;

    }


    if (
        value &&
        typeof value === "object"
    ) {

        return Object.keys(value)

            .filter(
                key =>
                    /^\d+$/.test(key)
            )

            .sort(
                (a, b) =>
                    Number(a) -
                    Number(b)
            )

            .map(
                key =>
                    value[key]
            );

    }


    return [];

}


/* ==========================================================
   DASHBOARD DATA
========================================================== */

async function refreshDashboard() {

    try {

        const [
            questionResult,
            studentResult,
            tokenResult,
            resultResult
        ] = await Promise.all([

            apiGetQuestion(),

            apiGetStudent(),

            apiGetToken(),

            apiGetResult()

        ]);


        APP.question =
            questionResult &&
            questionResult.success === true

                ? normalizeApiArray(
                    questionResult.data
                )

                : [];


        APP.student =
            studentResult &&
            studentResult.success === true

                ? normalizeApiArray(
                    studentResult.data
                )

                : [];


        APP.token =
            tokenResult &&
            tokenResult.success === true

                ? normalizeApiArray(
                    tokenResult.data
                )

                : [];


        APP.result =
            resultResult &&
            resultResult.success === true

                ? normalizeApiArray(
                    resultResult.data ??
                    resultResult
                )

                : [];


        updateDashboardCounters();

    }

    catch (err) {

        console.error(
            "REFRESH DASHBOARD ERROR:",
            err
        );

    }

}


/* ==========================================================
   DASHBOARD COUNTERS
========================================================== */

function updateDashboardCounters() {

    updateQuestionCounter(
        APP.question.length
    );


    updateStudentCounter(
        APP.student.length
    );


    updateTokenCounter(
        APP.token.length
    );


    updateResultCounter(
        APP.result.length
    );

}


/* ==========================================================
   DASHBOARD PAGE
========================================================== */

function loadDashboard() {

    setContent(`

        <h2>
            Dashboard
        </h2>

        <br>

        <p>
            Welcome to SAF Speaking Online Test
            Teacher Dashboard.
        </p>

        <br>

        <p>
            Use the left menu to manage
            Questions, Students, Exam Tokens,
            Results and Reports.
        </p>

        <br>

        <table
            width="100%"
            cellpadding="8"
            border="1"
        >

            <tr>

                <th>
                    Total Questions
                </th>

                <th>
                    Total Students
                </th>

                <th>
                    Total Token
                </th>

                <th>
                    Total Results
                </th>

            </tr>

            <tr>

                <td
                    id="dashboardQuestionCount"
                >
                    ${APP.question.length}
                </td>

                <td
                    id="dashboardStudentCount"
                >
                    ${APP.student.length}
                </td>

                <td
                    id="dashboardTokenCount"
                >
                    ${APP.token.length}
                </td>

                <td
                    id="dashboardResultCount"
                >
                    ${APP.result.length}
                </td>

            </tr>

        </table>

    `);

}


/* ==========================================================
   QUESTION PAGE
========================================================== */

function loadQuestionPage() {

    STATE.questionEdit =
        false;

    STATE.questionId =
        null;


    setContent(`

        <h2>
            Speaking Question Database
        </h2>

        <br>

        <form id="questionForm">

            <label>
                Title
            </label>

            <input
                id="title"
                type="text"
                required
            >

            <br><br>

            <label>
                Answer Key
            </label>

            <textarea
                id="answer"
                rows="5"
                required
            ></textarea>

            <br><br>

            <label>
                Difficulty
            </label>

            <select
                id="difficulty"
            >

                <option value="Easy">
                    Easy
                </option>

                <option value="Medium">
                    Medium
                </option>

                <option value="Hard">
                    Hard
                </option>

            </select>

            <br><br>

            <label>
                Duration (Second)
            </label>

            <input
                id="duration"
                type="number"
                value="30"
                min="10"
                required
            >

            <br><br>

            <button
                id="btnSaveQuestion"
                type="submit"
                class="btn teacher"
            >

                Save Question

            </button>

            <button
                type="button"
                onclick="resetQuestionForm()"
            >

                Cancel

            </button>

        </form>

        <br>

        <input
            id="searchQuestion"
            type="text"
            placeholder="Search question..."
            onkeyup="filterQuestion()"
        >

        <br><br>

        <div id="questionTable">

            Loading...

        </div>

    `);


    const form =
        document.getElementById(
            "questionForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            saveQuestion
        );

    }


    loadQuestions();

}


/* ==========================================================
   LOAD QUESTIONS
========================================================== */

async function loadQuestions() {

    const table =
        document.getElementById(
            "questionTable"
        );


    if (!table) {

        return;

    }


    table.innerHTML =
        "<p>Loading questions...</p>";


    try {

        const res =
            await apiGetQuestion();


        console.log(
            "GET QUESTION RESPONSE:",
            res
        );


        if (
            !res ||
            res.success !== true
        ) {

            APP.question = [];


            table.innerHTML =
                "<p style='color:red'>" +
                escapeHTML(
                    res &&
                    res.message
                        ? res.message
                        : "Failed to load questions."
                ) +
                "</p>";


            updateQuestionCounter(0);

            return;

        }


        APP.question =
            normalizeApiArray(
                res.data
            );


        updateQuestionCounter(
            APP.question.length
        );


        if (
            APP.question.length === 0
        ) {

            table.innerHTML =
                "<p>No question found.</p>";

            return;

        }


        renderQuestions();

    }

    catch (err) {

        console.error(
            "LOAD QUESTIONS ERROR:",
            err
        );


        APP.question = [];


        table.innerHTML =
            "<p style='color:red'>" +
            escapeHTML(
                err.message ||
                "Unable to load questions."
            ) +
            "</p>";


        updateQuestionCounter(0);

    }

}


/* ==========================================================
   RENDER QUESTIONS
========================================================== */

function renderQuestions() {

    const table =
        document.getElementById(
            "questionTable"
        );


    if (!table) {

        return;

    }


    if (
        !Array.isArray(APP.question) ||
        APP.question.length === 0
    ) {

        table.innerHTML =
            "<p>No question found.</p>";

        return;

    }


    let html = `

        <div
            style="
                overflow-x:auto;
            "
        >

        <table
            border="1"
            width="100%"
            cellpadding="8"
            cellspacing="0"
        >

            <thead>

                <tr>

                    <th>No</th>

                    <th>Title</th>

                    <th>Answer Key</th>

                    <th>Difficulty</th>

                    <th>Duration</th>

                    <th>Status</th>

                    <th>Action</th>

                </tr>

            </thead>

            <tbody>

    `;


    APP.question.forEach(
        (q, index) => {

            html += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${escapeHTML(q.title)}
                    </td>

                    <td>
                        ${escapeHTML(q.answer)}
                    </td>

                    <td>
                        ${escapeHTML(q.difficulty)}
                    </td>

                    <td>
                        ${escapeHTML(q.duration)}
                        seconds
                    </td>

                    <td>
                        ${escapeHTML(q.status)}
                    </td>

                    <td>

                        <button
                            type="button"
                            class="btn edit"
                            onclick="editQuestion('${escapeAttribute(q.id)}')"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="btn delete"
                            onclick="deleteQuestion('${escapeAttribute(q.id)}')"
                        >
                            Delete
                        </button>

                    </td>

                </tr>

            `;

        }
    );


    html += `

            </tbody>

        </table>

        </div>

    `;


    table.innerHTML =
        html;

}


/* ==========================================================
   SAVE QUESTION
========================================================== */

async function saveQuestion(e) {

    e.preventDefault();


    const titleElement =
        document.getElementById("title");

    const answerElement =
        document.getElementById("answer");

    const difficultyElement =
        document.getElementById("difficulty");

    const durationElement =
        document.getElementById("duration");


    if (
        !titleElement ||
        !answerElement ||
        !difficultyElement ||
        !durationElement
    ) {

        alert(
            "Question form is not available."
        );

        return;

    }


    const data = {

        title:
            titleElement.value.trim(),

        answer:
            answerElement.value.trim(),

        difficulty:
            difficultyElement.value,

        duration:
            Number(
                durationElement.value
            ),

        status:
            "ACTIVE",

        createdBy:
            "Teacher"

    };


    if (!data.title) {

        alert("Title wajib diisi.");

        return;

    }


    if (!data.answer) {

        alert("Answer Key wajib diisi.");

        return;

    }


    if (
        !data.duration ||
        data.duration <= 0
    ) {

        alert(
            "Duration tidak valid."
        );

        return;

    }


    let res;


    try {

        if (
            STATE.questionEdit === true &&
            STATE.questionId
        ) {

            data.id =
                STATE.questionId;


            res =
                await apiUpdateQuestion(
                    data
                );

        }

        else {

            res =
                await apiInsertQuestion(
                    data
                );

        }


        console.log(
            "QUESTION SAVE RESPONSE:",
            res
        );


        if (!res) {

            alert(
                "No response from API."
            );

            return;

        }


        alert(
            res.message ||
            (
                STATE.questionEdit
                    ? "Question updated."
                    : "Question created."
            )
        );


        if (
            res.success !== true
        ) {

            return;

        }


        resetQuestionForm();

        await loadQuestions();

        await refreshDashboard();

    }

    catch (err) {

        console.error(
            "SAVE QUESTION ERROR:",
            err
        );


        alert(
            err.message ||
            "Unable to save question."
        );

    }

}


/* ==========================================================
   EDIT QUESTION
========================================================== */

function editQuestion(id) {

    const question =
        APP.question.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!question) {

        alert(
            "Question not found."
        );

        return;

    }


    STATE.questionEdit =
        true;

    STATE.questionId =
        question.id;


    const title =
        document.getElementById("title");

    const answer =
        document.getElementById("answer");

    const difficulty =
        document.getElementById("difficulty");

    const duration =
        document.getElementById("duration");


    if (title) {

        title.value =
            question.title || "";

    }


    if (answer) {

        answer.value =
            question.answer || "";

    }


    if (difficulty) {

        difficulty.value =
            question.difficulty ||
            "Easy";

    }


    if (duration) {

        duration.value =
            question.duration ||
            30;

    }


    const button =
        document.getElementById(
            "btnSaveQuestion"
        );


    if (button) {

        button.innerText =
            "Update Question";

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* ==========================================================
   DELETE QUESTION
========================================================== */

async function deleteQuestion(id) {

    if (!id) {

        alert(
            "Question ID is required."
        );

        return;

    }


    if (
        !confirm(
            "Delete this question?"
        )
    ) {

        return;

    }


    try {

        const res =
            await apiDeleteQuestion({

                id: id

            });


        console.log(
            "DELETE QUESTION RESPONSE:",
            res
        );


        alert(
            res &&
            res.message
                ? res.message
                : "Question deleted."
        );


        if (
            !res ||
            res.success !== true
        ) {

            return;

        }


        if (
            String(
                STATE.questionId
            ) ===
            String(id)
        ) {

            resetQuestionForm();

        }


        await loadQuestions();

        await refreshDashboard();

    }

    catch (err) {

        console.error(
            "DELETE QUESTION ERROR:",
            err
        );


        alert(
            err.message ||
            "Unable to delete question."
        );

    }

}


/* ==========================================================
   RESET QUESTION FORM
========================================================== */

function resetQuestionForm() {

    STATE.questionEdit =
        false;

    STATE.questionId =
        null;


    const form =
        document.getElementById(
            "questionForm"
        );


    if (form) {

        form.reset();

    }


    const duration =
        document.getElementById(
            "duration"
        );


    if (duration) {

        duration.value =
            30;

    }


    const button =
        document.getElementById(
            "btnSaveQuestion"
        );


    if (button) {

        button.innerText =
            "Save Question";

    }

}


/* ==========================================================
   SEARCH QUESTION
========================================================== */

function filterQuestion() {

    const input =
        document.getElementById(
            "searchQuestion"
        );


    if (!input) {

        return;

    }


    const keyword =
        input.value
            .toLowerCase()
            .trim();


    document
        .querySelectorAll(
            "#questionTable tbody tr"
        )
        .forEach(row => {

            row.style.display =
                row.innerText
                    .toLowerCase()
                    .includes(keyword)
                        ? ""
                        : "none";

        });

}


/* ==========================================================
   STUDENT PAGE
========================================================== */

function loadStudentPage() {

    STATE.studentEdit =
        false;

    STATE.studentId =
        null;


    setContent(`

        <h2>
            Student Database
        </h2>

        <br>

        <form id="studentForm">

            <label>
                NIS
            </label>

            <input
                id="nis"
                required
            >

            <br><br>

            <label>
                Student Name
            </label>

            <input
                id="nama"
                required
            >

            <br><br>

            <label>
                Class
            </label>

            <input
                id="kelas"
                required
            >

            <br><br>

            <label>
                Username
            </label>

            <input
                id="username"
                required
            >

            <br><br>

            <label>
                Password
            </label>

            <input
                id="password"
                type="password"
                required
            >

            <br><br>

            <button
                id="btnSaveStudent"
                type="submit"
                class="btn teacher"
            >

                Save Student

            </button>

            <button
                type="button"
                onclick="resetStudentForm()"
            >

                Cancel

            </button>

        </form>

        <br>

        <input
            id="searchStudent"
            type="text"
            placeholder="Search Student..."
            onkeyup="filterStudent()"
        >

        <br><br>

        <div id="studentTable">

            Loading...

        </div>

    `);


    const form =
        document.getElementById(
            "studentForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            saveStudent
        );

    }


    loadStudents();

}


/* ==========================================================
   SAVE STUDENT
========================================================== */

async function saveStudent(e) {

    e.preventDefault();


    const nisElement =
        document.getElementById("nis");

    const namaElement =
        document.getElementById("nama");

    const kelasElement =
        document.getElementById("kelas");

    const usernameElement =
        document.getElementById("username");

    const passwordElement =
        document.getElementById("password");


    if (
        !nisElement ||
        !namaElement ||
        !kelasElement ||
        !usernameElement ||
        !passwordElement
    ) {

        alert(
            "Student form is not available."
        );

        return;

    }


    const data = {

        nis:
            nisElement.value.trim(),

        nama:
            namaElement.value.trim(),

        kelas:
            kelasElement.value.trim(),

        username:
            usernameElement.value.trim(),

        password:
            passwordElement.value.trim(),

        status:
            "Active"

    };


    if (
        STATE.studentEdit &&
        STATE.studentId
    ) {

        data.id =
            STATE.studentId;

    }


    let res;


    try {

        if (
            STATE.studentEdit
        ) {

            res =
                await apiUpdateStudent(
                    data
                );

        }

        else {

            res =
                await apiInsertStudent(
                    data
                );

        }


        alert(
            res &&
            res.message
                ? res.message
                : "Student saved."
        );


        if (
            !res ||
            res.success !== true
        ) {

            return;

        }


        resetStudentForm();

        await loadStudents();

        await refreshDashboard();

    }

    catch (err) {

        console.error(
            "SAVE STUDENT ERROR:",
            err
        );


        alert(
            err.message ||
            "Unable to save student."
        );

    }

}


/* ==========================================================
   LOAD STUDENTS
========================================================== */

async function loadStudents() {

    const table =
        document.getElementById(
            "studentTable"
        );


    if (!table) {

        return;

    }


    table.innerHTML =
        "<p>Loading students...</p>";


    try {

        const res =
            await apiGetStudent();


        if (
            !res ||
            res.success !== true
        ) {

            table.innerHTML =
                "<p style='color:red'>" +
                escapeHTML(
                    res &&
                    res.message
                        ? res.message
                        : "Failed to load students."
                ) +
                "</p>";

            return;

        }


        APP.student =
            normalizeApiArray(
                res.data
            );


        updateStudentCounter(
            APP.student.length
        );


        if (
            APP.student.length === 0
        ) {

            table.innerHTML =
                "<p>No student found.</p>";

            return;

        }


        let html = `

            <div
                style="
                    overflow-x:auto;
                "
            >

            <table
                border="1"
                width="100%"
                cellpadding="8"
                cellspacing="0"
            >

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


        APP.student.forEach(
            (s, i) => {

                const studentId =
                    s.id ??
                    s.nis;


                html += `

                    <tr>

                        <td>
                            ${i + 1}
                        </td>

                        <td>
                            ${escapeHTML(s.nis)}
                        </td>

                        <td>
                            ${escapeHTML(s.nama)}
                        </td>

                        <td>
                            ${escapeHTML(s.kelas)}
                        </td>

                        <td>
                            ${escapeHTML(s.username)}
                        </td>

                        <td>
                            ${escapeHTML(s.status)}
                        </td>

                        <td>

                            <button
                                type="button"
                                class="btn edit"
                                onclick="editStudent('${escapeAttribute(studentId)}')"
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                class="btn delete"
                                onclick="deleteStudent('${escapeAttribute(studentId)}')"
                            >
                                Delete
                            </button>

                        </td>

                    </tr>

                `;

            }
        );


        html += `

                </tbody>

            </table>

            </div>

        `;


        table.innerHTML =
            html;

    }

    catch (err) {

        console.error(
            "LOAD STUDENTS ERROR:",
            err
        );


        table.innerHTML =
            "<p style='color:red'>" +
            escapeHTML(
                err.message ||
                "Unable to load students."
            ) +
            "</p>";

    }

}


/* ==========================================================
   EDIT STUDENT
========================================================== */

function editStudent(id) {

    const student =
        APP.student.find(
            item =>
                String(
                    item.id ??
                    item.nis
                ) ===
                String(id)
        );


    if (!student) {

        alert(
            "Student not found."
        );

        return;

    }


    STATE.studentEdit =
        true;

    STATE.studentId =
        student.id ??
        student.nis;


    const nis =
        document.getElementById("nis");

    const nama =
        document.getElementById("nama");

    const kelas =
        document.getElementById("kelas");

    const username =
        document.getElementById("username");

    const password =
        document.getElementById("password");


    if (nis) {

        nis.value =
            student.nis || "";

    }


    if (nama) {

        nama.value =
            student.nama || "";

    }


    if (kelas) {

        kelas.value =
            student.kelas || "";

    }


    if (username) {

        username.value =
            student.username || "";

    }


    if (password) {

        password.value =
            student.password || "";

    }


    const button =
        document.getElementById(
            "btnSaveStudent"
        );


    if (button) {

        button.innerText =
            "Update Student";

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* ==========================================================
   DELETE STUDENT
========================================================== */

async function deleteStudent(id) {

    if (!id) {

        alert(
            "Student ID is required."
        );

        return;

    }


    if (
        !confirm(
            "Delete this student?"
        )
    ) {

        return;

    }


    try {

        const res =
            await apiDeleteStudent({

                id: id,

                nis: id

            });


        alert(
            res &&
            res.message
                ? res.message
                : "Student deleted."
        );


        if (
            !res ||
            res.success !== true
        ) {

            return;

        }


        if (
            String(
                STATE.studentId
            ) ===
            String(id)
        ) {

            resetStudentForm();

        }


        await loadStudents();

        await refreshDashboard();

    }

    catch (err) {

        console.error(
            "DELETE STUDENT ERROR:",
            err
        );


        alert(
            err.message ||
            "Unable to delete student."
        );

    }

}


/* ==========================================================
   RESET STUDENT FORM
========================================================== */

function resetStudentForm() {

    STATE.studentEdit =
        false;

    STATE.studentId =
        null;


    const form =
        document.getElementById(
            "studentForm"
        );


    if (form) {

        form.reset();

    }


    const button =
        document.getElementById(
            "btnSaveStudent"
        );


    if (button) {

        button.innerText =
            "Save Student";

    }

}


/* ==========================================================
   SEARCH STUDENT
========================================================== */

function filterStudent() {

    const input =
        document.getElementById(
            "searchStudent"
        );


    if (!input) {

        return;

    }


    const keyword =
        input.value
            .toLowerCase()
            .trim();


    document
        .querySelectorAll(
            "#studentTable tbody tr"
        )
        .forEach(row => {

            row.style.display =
                row.innerText
                    .toLowerCase()
                    .includes(keyword)
                        ? ""
                        : "none";

        });

}


/* ==========================================================
   TOKEN PAGE
========================================================== */

function loadTokenPage() {

    setContent(`

        <h2>
            Exam Token
        </h2>

        <br>

        <form id="tokenForm">

            <label>
                Class
            </label>

            <input
                id="tokenClass"
                required
            >

            <br><br>

            <label>
                Expired (Minutes)
            </label>

            <input
                id="expired"
                type="number"
                value="30"
                min="1"
                required
            >

            <br><br>

            <label>
                Note
            </label>

            <input
                id="note"
            >

            <br><br>

            <button
                type="submit"
                class="btn teacher"
            >

                Generate Token

            </button>

        </form>

        <br>

        <input
            id="searchToken"
            type="text"
            placeholder="Search Token..."
            onkeyup="filterToken()"
        >

        <br><br>

        <div id="tokenTable">

            Loading...

        </div>

    `);


    const form =
        document.getElementById(
            "tokenForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            createExamToken
        );

    }


    loadTokens();

}


/* ==========================================================
   CREATE TOKEN
========================================================== */

async function createExamToken(e) {

    e.preventDefault();


    const classElement =
        document.getElementById(
            "tokenClass"
        );

    const expiredElement =
        document.getElementById(
            "expired"
        );

    const noteElement =
        document.getElementById(
            "note"
        );


    if (
        !classElement ||
        !expiredElement ||
        !noteElement
    ) {

        alert(
            "Token form is not available."
        );

        return;

    }


    const data = {

        kelas:
            classElement.value.trim(),

        expired:
            Number(
                expiredElement.value
            ),

        note:
            noteElement.value.trim(),

        createdBy:
            "Teacher"

    };


    if (!data.kelas) {

        alert(
            "Class wajib diisi."
        );

        return;

    }


    if (
        !data.expired ||
        data.expired <= 0
    ) {

        alert(
            "Expired minutes tidak valid."
        );

        return;

    }


    try {

        console.log(
            "CREATE TOKEN REQUEST:",
            data
        );


        const res =
            await apiCreateToken(
                data
            );


        console.log(
            "CREATE TOKEN RESPONSE:",
            res
        );


        alert(
            res &&
            res.message
                ? res.message
                : "Token created."
        );


        if (
            !res ||
            res.success !== true
        ) {

            return;

        }


        const form =
            document.getElementById(
                "tokenForm"
            );


        if (form) {

            form.reset();

        }


        if (expiredElement) {

            expiredElement.value =
                30;

        }


        await loadTokens();

        await refreshDashboard();

    }

    catch (err) {

        console.error(
            "CREATE TOKEN ERROR:",
            err
        );


        alert(
            err.message ||
            "Unable to create token."
        );

    }

}


/* ==========================================================
   LOAD TOKENS
========================================================== */

async function loadTokens() {

    const table =
        document.getElementById(
            "tokenTable"
        );


    if (!table) {

        return;

    }


    table.innerHTML =
        "<p>Loading tokens...</p>";


    try {

        const res =
            await apiGetToken();


        if (
            !res ||
            res.success !== true
        ) {

            table.innerHTML =
                "<p style='color:red'>" +
                escapeHTML(
                    res &&
                    res.message
                        ? res.message
                        : "Failed to load tokens."
                ) +
                "</p>";

            return;

        }


        APP.token =
            normalizeApiArray(
                res.data
            );


        updateTokenCounter(
            APP.token.length
        );


        if (
            APP.token.length === 0
        ) {

            table.innerHTML =
                "<p>No token found.</p>";

            return;

        }


        let html = `

            <div
                style="
                    overflow-x:auto;
                "
            >

            <table
                border="1"
                width="100%"
                cellpadding="8"
                cellspacing="0"
            >

                <thead>

                    <tr>

                        <th>No</th>

                        <th>Token</th>

                        <th>Class</th>

                        <th>Status</th>

                        <th>Expired</th>

                        <th>Created</th>

                        <th>Action</th>

                    </tr>

                </thead>

                <tbody>

        `;


        APP.token.forEach(
            (t, i) => {

                const status =
                    String(
                        t.status || ""
                    )
                    .toUpperCase();


                const disableButton =
                    status === "ACTIVE"

                        ? `

                            <button
                                type="button"
                                class="btn edit"
                                onclick="disableExamToken('${escapeAttribute(t.token)}')"
                            >
                                Disable
                            </button>

                          `

                        : "";


                html += `

                    <tr>

                        <td>
                            ${i + 1}
                        </td>

                        <td>
                            <b>
                                ${escapeHTML(
                                    t.token
                                )}
                            </b>
                        </td>

                        <td>
                            ${escapeHTML(
                                t.kelas
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                t.status
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                t.expired
                            )}
                            minutes
                        </td>

                        <td>
                            ${formatDate(
                                t.createdAt
                            )}
                        </td>

                        <td>

                            ${disableButton}

                            <button
                                type="button"
                                class="btn delete"
                                onclick="deleteExamToken('${escapeAttribute(t.token)}')"
                            >
                                Delete
                            </button>

                        </td>

                    </tr>

                `;

            }
        );


        html += `

                </tbody>

            </table>

            </div>

        `;


        table.innerHTML =
            html;

    }

    catch (err) {

        console.error(
            "LOAD TOKENS ERROR:",
            err
        );


        table.innerHTML =
            "<p style='color:red'>" +
            escapeHTML(
                err.message ||
                "Unable to load tokens."
            ) +
            "</p>";

    }

}


/* ==========================================================
   DISABLE TOKEN
========================================================== */

async function disableExamToken(token) {

    if (!token) {

        alert(
            "Token is required."
        );

        return;

    }


    if (
        !confirm(
            "Disable this token?"
        )
    ) {

        return;

    }


    try {

        const res =
            await apiDisableToken({

                token: token

            });


        console.log(
            "DISABLE TOKEN RESPONSE:",
            res
        );


        alert(
            res &&
            res.message
                ? res.message
                : "Token disabled."
        );


        if (
            !res ||
            res.success !== true
        ) {

            return;

        }


        await loadTokens();

        await refreshDashboard();

    }

    catch (err) {

        console.error(
            "DISABLE TOKEN ERROR:",
            err
        );


        alert(
            err.message ||
            "Unable to disable token."
        );

    }

}


/* ==========================================================
   DELETE TOKEN
========================================================== */

async function deleteExamToken(token) {

    if (!token) {

        alert(
            "Token is required."
        );

        return;

    }


    if (
        !confirm(
            "Delete this token?"
        )
    ) {

        return;

    }


    try {

        const res =
            await apiDeleteToken({

                token: token

            });


        console.log(
            "DELETE TOKEN RESPONSE:",
            res
        );


        alert(
            res &&
            res.message
                ? res.message
                : "Token deleted."
        );


        if (
            !res ||
            res.success !== true
        ) {

            return;

        }


        await loadTokens();

        await refreshDashboard();

    }

    catch (err) {

        console.error(
            "DELETE TOKEN ERROR:",
            err
        );


        alert(
            err.message ||
            "Unable to delete token."
        );

    }

}


/* ==========================================================
   SEARCH TOKEN
========================================================== */

function filterToken() {

    const input =
        document.getElementById(
            "searchToken"
        );


    if (!input) {

        return;

    }


    const keyword =
        input.value
            .toLowerCase()
            .trim();


    document
        .querySelectorAll(
            "#tokenTable tbody tr"
        )
        .forEach(row => {

            row.style.display =
                row.innerText
                    .toLowerCase()
                    .includes(keyword)
                        ? ""
                        : "none";

        });

}


/* ==========================================================
   RESULT PAGE
========================================================== */

function loadResultPage() {

    setContent(`

        <h2>
            Speaking Results
        </h2>

        <br>

        <div
            style="
                display:flex;
                gap:10px;
                flex-wrap:wrap;
                align-items:center;
            "
        >

            <input
                id="searchResult"
                type="text"
                placeholder="Search Student..."
                onkeyup="filterResult()"
                style="
                    padding:9px;
                    min-width:220px;
                "
            >

            <button
                type="button"
                class="btn"
                onclick="selectAllResults()"
            >
                ☑ Select All
            </button>

            <button
                type="button"
                class="btn delete"
                onclick="deleteSelectedResults()"
            >
                🗑 Delete Selected
            </button>

            <button
                type="button"
                class="btn delete"
                onclick="deleteAllResults()"
            >
                🗑 Delete All
            </button>

        </div>

        <br>

        <div id="resultSelectionStatus">
            0 selected
        </div>

        <br>

        <div id="resultTable">

            Loading...

        </div>

    `);


    loadResults();

}


/* ==========================================================
   LOAD RESULTS
========================================================== */

async function loadResults() {

    const table =
        document.getElementById(
            "resultTable"
        );


    if (!table) {

        return;

    }


    table.innerHTML =
        "<p>Loading results...</p>";


    try {

        const res =
            await apiGetResult();


        console.log(
            "GET RESULT RESPONSE:",
            res
        );


        if (
            !res ||
            res.success !== true
        ) {

            APP.result = [];


            updateResultCounter(0);


            table.innerHTML =
                "<p style='color:red'>" +
                escapeHTML(
                    res &&
                    res.message
                        ? res.message
                        : "Failed to load results."
                ) +
                "</p>";


            updateResultSelectionStatus();

            return;

        }


        APP.result =
            normalizeApiArray(
                res.data ??
                res
            );


        updateResultCounter(
            APP.result.length
        );


        if (
            APP.result.length === 0
        ) {

            table.innerHTML =
                "<p>No result found.</p>";

            updateResultSelectionStatus();

            return;

        }


        renderResultList();

    }

    catch (err) {

        console.error(
            "LOAD RESULTS ERROR:",
            err
        );


        APP.result = [];


        updateResultCounter(0);


        table.innerHTML =
            "<p style='color:red'>" +
            escapeHTML(
                err.message ||
                "Unable to load results."
            ) +
            "</p>";


        updateResultSelectionStatus();

    }

}


/* ==========================================================
   RENDER RESULT LIST
========================================================== */

function renderResultList() {

    const table =
        document.getElementById(
            "resultTable"
        );


    if (!table) {

        return;

    }


    if (
        !Array.isArray(APP.result) ||
        APP.result.length === 0
    ) {

        table.innerHTML =
            "<p>No result found.</p>";

        updateResultSelectionStatus();

        return;

    }


    let html = `

        <div
            style="
                overflow-x:auto;
            "
        >

        <table
            border="1"
            width="100%"
            cellpadding="8"
            cellspacing="0"
        >

            <thead>

                <tr>

                    <th>

                        <input
                            type="checkbox"
                            id="selectAllResultsCheckbox"
                            onchange="toggleAllResultCheckboxes(this)"
                            aria-label="Select all results"
                        >

                    </th>

                    <th>No</th>

                    <th>NIS</th>

                    <th>Name</th>

                    <th>Class</th>

                    <th>Question</th>

                    <th>Score</th>

                    <th>Accuracy</th>

                    <th>Transcript</th>

                    <th>Feedback</th>

                    <th>Result ID</th>

                    <th>Action</th>

                </tr>

            </thead>

            <tbody>

    `;


    APP.result.forEach(
        (r, i) => {

            const score =
                getResultScore(r);


            const accuracy =
                getResultAccuracy(r);


            const transcript =
                r.transcript ??
                r.recognizedText ??
                r.text ??
                "-";


            const feedback =
                r.feedback ??
                r.comment ??
                r.message ??
                "-";


            const resultId =
                r.id ??
                r.resultId ??
                "";


            const safeResultId =
                String(resultId);


            html += `

                <tr>

                    <td
                        style="
                            text-align:center;
                        "
                    >

                        ${
                            safeResultId
                                ? `
                                    <input
                                        type="checkbox"
                                        class="result-checkbox"
                                        value="${escapeAttribute(safeResultId)}"
                                        onchange="updateResultSelectionStatus()"
                                        aria-label="Select result"
                                    >
                                  `
                                : `
                                    -
                                  `
                        }

                    </td>

                    <td>
                        ${i + 1}
                    </td>

                    <td>
                        ${escapeHTML(r.nis)}
                    </td>

                    <td>
                        ${escapeHTML(r.nama)}
                    </td>

                    <td>
                        ${escapeHTML(r.kelas)}
                    </td>

                    <td>
                        ${escapeHTML(r.question)}
                    </td>

                    <td>
                        <b>
                            ${escapeHTML(score)}
                        </b>
                    </td>

                    <td>
                        ${escapeHTML(accuracy)}
                    </td>

                    <td>
                        ${escapeHTML(transcript)}
                    </td>

                    <td>
                        ${escapeHTML(feedback)}
                    </td>

                    <td>
                        ${escapeHTML(resultId)}
                    </td>

                    <td>

                        ${
                            safeResultId
                                ? `
                                    <button
                                        type="button"
                                        class="btn delete"
                                        onclick="deleteResult('${escapeAttribute(safeResultId)}')"
                                    >
                                        Delete
                                    </button>
                                  `
                                : `
                                    -
                                  `
                        }

                    </td>

                </tr>

            `;

        }
    );


    html += `

            </tbody>

        </table>

        </div>

    `;


    table.innerHTML =
        html;


    updateResultSelectionStatus();

}


/* ==========================================================
   TOGGLE ALL RESULT CHECKBOXES
========================================================== */

function toggleAllResultCheckboxes(
    source
) {

    const checkboxes =
        document.querySelectorAll(
            ".result-checkbox"
        );


    checkboxes.forEach(
        checkbox => {

            checkbox.checked =
                source.checked;

        }
    );


    updateResultSelectionStatus();

}


/* ==========================================================
   SELECT ALL RESULTS
========================================================== */

function selectAllResults() {

    const master =
        document.getElementById(
            "selectAllResultsCheckbox"
        );


    if (!master) {

        return;

    }


    master.checked =
        true;


    toggleAllResultCheckboxes(
        master
    );

}


/* ==========================================================
   GET SELECTED RESULT IDS
========================================================== */

function getSelectedResultIds() {

    return Array
        .from(
            document.querySelectorAll(
                ".result-checkbox:checked"
            )
        )
        .map(
            checkbox =>
                checkbox.value
        )
        .filter(
            id =>
                id &&
                id !== "-"
        );

}


/* ==========================================================
   UPDATE RESULT SELECTION STATUS
========================================================== */

function updateResultSelectionStatus() {

    const selected =
        getSelectedResultIds();


    const status =
        document.getElementById(
            "resultSelectionStatus"
        );


    if (status) {

        status.textContent =
            selected.length +
            " selected";

    }


    const checkboxes =
        document.querySelectorAll(
            ".result-checkbox"
        );


    const master =
        document.getElementById(
            "selectAllResultsCheckbox"
        );


    if (
        master &&
        checkboxes.length > 0
    ) {

        const checkedCount =
            Array
                .from(checkboxes)
                .filter(
                    checkbox =>
                        checkbox.checked
                )
                .length;


        master.checked =
            checkedCount ===
            checkboxes.length;


        master.indeterminate =
            checkedCount > 0 &&
            checkedCount <
            checkboxes.length;

    }

    else if (master) {

        master.checked =
            false;

        master.indeterminate =
            false;

    }

}


/* ==========================================================
   DELETE SELECTED RESULTS
========================================================== */

async function deleteSelectedResults() {

    const selectedIds =
        getSelectedResultIds();


    if (
        selectedIds.length === 0
    ) {

        alert(
            "Please select at least one result."
        );

        return;

    }


    const confirmed =
        confirm(
            "Delete " +
            selectedIds.length +
            " selected result(s)?"
        );


    if (!confirmed) {

        return;

    }


    await deleteResultBatch(
        selectedIds,
        "selected"
    );

}


/* ==========================================================
   DELETE ALL RESULTS
========================================================== */

async function deleteAllResults() {

    const allIds =
        APP.result

            .map(
                result =>
                    result.id ??
                    result.resultId ??
                    ""
            )

            .map(
                id =>
                    String(id)
            )

            .filter(
                id =>
                    id &&
                    id !== "-"
            );


    if (
        allIds.length === 0
    ) {

        alert(
            "No results available to delete."
        );

        return;

    }


    const confirmed =
        confirm(
            "WARNING!\n\n" +
            "This will delete ALL " +
            allIds.length +
            " speaking results.\n\n" +
            "Continue?"
        );


    if (!confirmed) {

        return;

    }


    await deleteResultBatch(
        allIds,
        "all"
    );

}


/* ==========================================================
   DELETE RESULT BATCH
========================================================== */

async function deleteResultBatch(
    ids,
    mode
) {

    if (
        !Array.isArray(ids) ||
        ids.length === 0
    ) {

        return;

    }


    const uniqueIds =
        [
            ...new Set(
                ids.map(
                    id =>
                        String(id)
                )
            )
        ]
        .filter(
            id =>
                id &&
                id !== "-"
        );


    if (
        uniqueIds.length === 0
    ) {

        alert(
            "No valid result ID found."
        );

        return;

    }


    const resultTable =
        document.getElementById(
            "resultTable"
        );


    if (resultTable) {

        resultTable.innerHTML =
            "<p>Deleting results...</p>";

    }


    let successCount =
        0;


    let failedCount =
        0;


    const errors = [];


    for (
        const id of uniqueIds
    ) {

        try {

            const res =
                await apiDeleteResult({

                    id: id

                });


            if (
                res &&
                res.success === true
            ) {

                successCount++;

            }

            else {

                failedCount++;


                errors.push(
                    res &&
                    res.message
                        ? res.message
                        : (
                            "Failed to delete " +
                            id
                        )
                );

            }

        }

        catch (err) {

            failedCount++;


            errors.push(
                err.message ||
                (
                    "Failed to delete " +
                    id
                )
            );

        }

    }


    console.log(
        "BATCH DELETE RESULT:",
        {
            mode: mode,
            total: uniqueIds.length,
            success: successCount,
            failed: failedCount,
            errors: errors
        }
    );


    await loadResults();

    await refreshDashboard();


    if (
        failedCount === 0
    ) {

        alert(
            successCount +
            " result(s) deleted successfully."
        );

    }

    else {

        alert(
            successCount +
            " result(s) deleted.\n" +
            failedCount +
            " result(s) failed."
        );

    }

}


/* ==========================================================
   DELETE SINGLE RESULT
========================================================== */

async function deleteResult(id) {

    if (
        !id ||
        id === "-"
    ) {

        alert(
            "Result ID is not available."
        );

        return;

    }


    if (
        !confirm(
            "Delete this result?"
        )
    ) {

        return;

    }


    try {

        const res =
            await apiDeleteResult({

                id: id

            });


        alert(
            res &&
            res.message
                ? res.message
                : "Result deleted."
        );


        if (
            !res ||
            res.success !== true
        ) {

            return;

        }


        await loadResults();

        await refreshDashboard();

    }

    catch (err) {

        console.error(
            "DELETE RESULT ERROR:",
            err
        );


        alert(
            err.message ||
            "Unable to delete result."
        );

    }

}


/* ==========================================================
   SEARCH RESULT
========================================================== */

function filterResult() {

    const input =
        document.getElementById(
            "searchResult"
        );


    if (!input) {

        return;

    }


    const keyword =
        input.value
            .toLowerCase()
            .trim();


    document
        .querySelectorAll(
            "#resultTable tbody tr"
        )
        .forEach(row => {

            row.style.display =
                row.innerText
                    .toLowerCase()
                    .includes(keyword)
                        ? ""
                        : "none";

        });

}


/* ==========================================================
   REPORT PAGE
========================================================== */

function loadReportsPage() {

    STATE.reportClass =
        "";


    setContent(`

        <h2>
            📊 Speaking Reports
        </h2>

        <p>
            View and export speaking test results
            by class.
        </p>

        <br>

        <div
            style="
                display:flex;
                gap:12px;
                flex-wrap:wrap;
                align-items:center;
            "
        >

            <label>
                <b>
                    Class:
                </b>
            </label>

            <select
                id="reportClassFilter"
                onchange="filterReportClass()"
                style="
                    min-width:180px;
                    padding:8px;
                "
            >

                <option value="">
                    All Classes
                </option>

            </select>


            <button
                type="button"
                class="btn teacher"
                onclick="refreshReports()"
            >

                Refresh Report

            </button>


            <button
                type="button"
                class="btn teacher"
                onclick="exportReportExcel()"
            >

                📥 Export Excel

            </button>

        </div>

        <br>

        <div
            id="reportSummary"
        >

            Loading summary...

        </div>

        <br>

        <div
            id="reportTable"
        >

            Loading report...

        </div>

    `);


    loadReports();

}


/* ==========================================================
   LOAD REPORTS
========================================================== */

async function loadReports() {

    const table =
        document.getElementById(
            "reportTable"
        );


    if (!table) {

        return;

    }


    table.innerHTML =
        "<p>Loading reports...</p>";


    try {

        const res =
            await apiGetResult();


        console.log(
            "REPORT RESULT RESPONSE:",
            res
        );


        if (
            !res ||
            res.success !== true
        ) {

            APP.result = [];


            updateReportClassOptions();


            table.innerHTML =
                "<p style='color:red'>" +
                escapeHTML(
                    res &&
                    res.message
                        ? res.message
                        : "Failed to load reports."
                ) +
                "</p>";


            renderReportSummary([]);

            return;

        }


        APP.result =
            normalizeApiArray(
                res.data ??
                res
            );


        updateResultCounter(
            APP.result.length
        );


        updateReportClassOptions();

        renderReport();

    }

    catch (err) {

        console.error(
            "LOAD REPORT ERROR:",
            err
        );


        APP.result = [];


        table.innerHTML =
            "<p style='color:red'>" +
            escapeHTML(
                err.message ||
                "Unable to load reports."
            ) +
            "</p>";


        renderReportSummary([]);

    }

}


/* ==========================================================
   REFRESH REPORT
========================================================== */

async function refreshReports() {

    await loadReports();

}


/* ==========================================================
   REPORT CLASS OPTIONS
========================================================== */

function updateReportClassOptions() {

    const select =
        document.getElementById(
            "reportClassFilter"
        );


    if (!select) {

        return;

    }


    const currentValue =
        STATE.reportClass ||
        "";


    const classes =
        APP.result

            .map(
                item =>
                    String(
                        item.kelas ??
                        ""
                    ).trim()
            )

            .filter(
                value =>
                    value !== ""
            );


    const uniqueClasses =
        [
            ...new Set(classes)
        ]
        .sort(
            (a, b) =>
                a.localeCompare(
                    b,
                    undefined,
                    {
                        numeric: true,
                        sensitivity: "base"
                    }
                )
        );


    let html = `

        <option value="">
            All Classes
        </option>

    `;


    uniqueClasses.forEach(
        kelas => {

            html += `

                <option
                    value="${escapeAttribute(kelas)}"
                >

                    ${escapeHTML(kelas)}

                </option>

            `;

        }
    );


    select.innerHTML =
        html;


    if (
        uniqueClasses.includes(
            currentValue
        )
    ) {

        select.value =
            currentValue;

    }

    else {

        select.value =
            "";

        STATE.reportClass =
            "";

    }

}


/* ==========================================================
   FILTER REPORT CLASS
========================================================== */

function filterReportClass() {

    const select =
        document.getElementById(
            "reportClassFilter"
        );


    if (!select) {

        return;

    }


    STATE.reportClass =
        select.value || "";


    renderReport();

}


/* ==========================================================
   GET FILTERED REPORT DATA
========================================================== */

function getFilteredReportData() {

    if (
        !Array.isArray(APP.result)
    ) {

        return [];

    }


    if (
        !STATE.reportClass
    ) {

        return [
            ...APP.result
        ];

    }


    return APP.result.filter(
        item => {

            return (
                String(
                    item.kelas ??
                    ""
                ).trim()
                ===
                String(
                    STATE.reportClass
                ).trim()
            );

        }
    );

}


/* ==========================================================
   RENDER REPORT
========================================================== */

function renderReport() {

    const table =
        document.getElementById(
            "reportTable"
        );


    if (!table) {

        return;

    }


    const data =
        getFilteredReportData();


    renderReportSummary(
        data
    );


    if (
        data.length === 0
    ) {

        table.innerHTML = `

            <div
                style="
                    padding:20px;
                    border:1px solid #ddd;
                    text-align:center;
                "
            >

                <p>
                    No result found
                    for the selected class.
                </p>

            </div>

        `;

        return;

    }


    let html = `

        <div
            style="
                overflow-x:auto;
            "
        >

            <table
                border="1"
                width="100%"
                cellpadding="8"
                cellspacing="0"
            >

                <thead>

                    <tr>

                        <th>No</th>

                        <th>NIS</th>

                        <th>Student Name</th>

                        <th>Class</th>

                        <th>Question</th>

                        <th>Score</th>

                        <th>Accuracy</th>

                        <th>Transcript</th>

                        <th>Feedback</th>

                        <th>Date</th>

                    </tr>

                </thead>

                <tbody>

    `;


    data.forEach(
        (r, index) => {

            const score =
                getResultScore(r);


            const accuracy =
                getResultAccuracy(r);


            const transcript =
                r.transcript ??
                r.recognizedText ??
                r.text ??
                "-";


            const feedback =
                r.feedback ??
                r.comment ??
                r.message ??
                "-";


            html += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${escapeHTML(r.nis)}
                    </td>

                    <td>
                        ${escapeHTML(r.nama)}
                    </td>

                    <td>
                        ${escapeHTML(r.kelas)}
                    </td>

                    <td>
                        ${escapeHTML(r.question)}
                    </td>

                    <td>
                        <b>
                            ${escapeHTML(score)}
                        </b>
                    </td>

                    <td>
                        ${escapeHTML(accuracy)}
                    </td>

                    <td>
                        ${escapeHTML(transcript)}
                    </td>

                    <td>
                        ${escapeHTML(feedback)}
                    </td>

                    <td>
                        ${formatDate(
                            r.createdAt
                        )}
                    </td>

                </tr>

            `;

        }
    );


    html += `

                </tbody>

            </table>

        </div>

    `;


    table.innerHTML =
        html;

}


/* ==========================================================
   REPORT SUMMARY
========================================================== */

function renderReportSummary(data) {

    const summary =
        document.getElementById(
            "reportSummary"
        );


    if (!summary) {

        return;

    }


    if (
        !Array.isArray(data)
    ) {

        data = [];

    }


    const totalResults =
        data.length;


    const studentSet =
        new Set();


    let scoreTotal =
        0;


    let scoreCount =
        0;


    let accuracyTotal =
        0;


    let accuracyCount =
        0;


    data.forEach(
        result => {

            const nis =
                String(
                    result.nis ??
                    ""
                ).trim();


            const nama =
                String(
                    result.nama ??
                    ""
                ).trim();


            if (
                nis ||
                nama
            ) {

                studentSet.add(
                    nis ||
                    nama
                );

            }


            const score =
                parseNumericValue(
                    getResultScore(
                        result
                    )
                );


            if (
                score !== null
            ) {

                scoreTotal +=
                    score;

                scoreCount++;

            }


            const accuracy =
                parseNumericValue(
                    getResultAccuracy(
                        result
                    )
                );


            if (
                accuracy !== null
            ) {

                accuracyTotal +=
                    accuracy;

                accuracyCount++;

            }

        }
    );


    const totalStudents =
        studentSet.size;


    const averageScore =
        scoreCount > 0

            ? (
                scoreTotal /
                scoreCount
            ).toFixed(2)

            : "-";


    const averageAccuracy =
        accuracyCount > 0

            ? (
                accuracyTotal /
                accuracyCount
            ).toFixed(2)

            : "-";


    const selectedClass =
        STATE.reportClass
            ? escapeHTML(
                STATE.reportClass
            )
            : "All Classes";


    summary.innerHTML = `

        <div
            style="
                display:grid;
                grid-template-columns:
                    repeat(
                        auto-fit,
                        minmax(180px, 1fr)
                    );
                gap:12px;
            "
        >

            <div
                style="
                    border:1px solid #ddd;
                    padding:15px;
                    border-radius:8px;
                "
            >

                <div>
                    Class
                </div>

                <strong>
                    ${selectedClass}
                </strong>

            </div>


            <div
                style="
                    border:1px solid #ddd;
                    padding:15px;
                    border-radius:8px;
                "
            >

                <div>
                    Total Students
                </div>

                <strong>
                    ${totalStudents}
                </strong>

            </div>


            <div
                style="
                    border:1px solid #ddd;
                    padding:15px;
                    border-radius:8px;
                "
            >

                <div>
                    Total Results
                </div>

                <strong>
                    ${totalResults}
                </strong>

            </div>


            <div
                style="
                    border:1px solid #ddd;
                    padding:15px;
                    border-radius:8px;
                "
            >

                <div>
                    Average Score
                </div>

                <strong>
                    ${averageScore}
                </strong>

            </div>


            <div
                style="
                    border:1px solid #ddd;
                    padding:15px;
                    border-radius:8px;
                "
            >

                <div>
                    Average Accuracy
                </div>

                <strong>
                    ${averageAccuracy}
                </strong>

            </div>

        </div>

    `;

}


/* ==========================================================
   GET RESULT SCORE
========================================================== */

function getResultScore(result) {

    if (!result) {

        return "-";

    }


    return (
        result.score ??
        result.totalScore ??
        result.nilai ??
        result.value ??
        "-"
    );

}


/* ==========================================================
   GET RESULT ACCURACY
========================================================== */

function getResultAccuracy(result) {

    if (!result) {

        return "-";

    }


    return (
        result.accuracy ??
        result.accuracyScore ??
        result.pronunciationAccuracy ??
        result.accuracyPercent ??
        "-"
    );

}


/* ==========================================================
   PARSE NUMERIC VALUE
========================================================== */

function parseNumericValue(value) {

    if (
        value === null ||
        typeof value === "undefined" ||
        value === ""
    ) {

        return null;

    }


    const number =
        Number(
            String(value)
                .replace(
                    "%",
                    ""
                )
                .trim()
        );


    if (
        Number.isNaN(number)
    ) {

        return null;

    }


    return number;

}


/* ==========================================================
   LOAD XLSX LIBRARY
========================================================== */

function ensureXLSX() {

    return new Promise(
        (resolve, reject) => {

            if (
                typeof XLSX !==
                "undefined"
            ) {

                resolve(
                    XLSX
                );

                return;

            }


            const existing =
                document.querySelector(
                    'script[data-saf-xlsx="true"]'
                );


            if (existing) {

                existing.addEventListener(
                    "load",
                    () => {

                        if (
                            typeof XLSX !==
                            "undefined"
                        ) {

                            resolve(
                                XLSX
                            );

                        }

                        else {

                            reject(
                                new Error(
                                    "Excel library failed to load."
                                )
                            );

                        }

                    }
                );


                existing.addEventListener(
                    "error",
                    () => {

                        reject(
                            new Error(
                                "Unable to load Excel library."
                            )
                        );

                    }
                );


                return;

            }


            const script =
                document.createElement(
                    "script"
                );


            script.src =
                "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";


            script.async =
                true;


            script.dataset.safXlsx =
                "true";


            script.onload =
                function () {

                    if (
                        typeof XLSX !==
                        "undefined"
                    ) {

                        resolve(
                            XLSX
                        );

                    }

                    else {

                        reject(
                            new Error(
                                "Excel library is not available."
                            )
                        );

                    }

                };


            script.onerror =
                function () {

                    reject(
                        new Error(
                            "Unable to load Excel library."
                        )
                    );

                };


            document.head.appendChild(
                script
            );

        }
    );

}


/* ==========================================================
   EXPORT REPORT EXCEL
========================================================== */

async function exportReportExcel() {

    const data =
        getFilteredReportData();


    if (
        data.length === 0
    ) {

        alert(
            "Tidak ada data report untuk diekspor."
        );

        return;

    }


    try {

        const excel =
            await ensureXLSX();


        const rows =
            data.map(
                (r, index) => {

                    return {

                        No:
                            index + 1,

                        NIS:
                            r.nis ?? "",

                        "Student Name":
                            r.nama ?? "",

                        Class:
                            r.kelas ?? "",

                        Question:
                            r.question ?? "",

                        Score:
                            getResultScore(r),

                        Accuracy:
                            getResultAccuracy(r),

                        Transcript:
                            r.transcript ??
                            r.recognizedText ??
                            r.text ??
                            "",

                        Feedback:
                            r.feedback ??
                            r.comment ??
                            r.message ??
                            "",

                        "Result ID":
                            r.id ??
                            r.resultId ??
                            "",

                        Token:
                            r.token ?? "",

                        Created:
                            formatDateForExcel(
                                r.createdAt
                            )

                    };

                }
            );


        const worksheet =
            excel.utils.json_to_sheet(
                rows
            );


        worksheet["!cols"] = [

            {
                wch: 6
            },

            {
                wch: 12
            },

            {
                wch: 25
            },

            {
                wch: 10
            },

            {
                wch: 30
            },

            {
                wch: 10
            },

            {
                wch: 12
            },

            {
                wch: 40
            },

            {
                wch: 50
            },

            {
                wch: 38
            },

            {
                wch: 14
            },

            {
                wch: 22
            }

        ];


        const workbook =
            excel.utils.book_new();


        excel.utils.book_append_sheet(
            workbook,
            worksheet,
            "Speaking Results"
        );


        const className =
            STATE.reportClass
                ? sanitizeFileName(
                    STATE.reportClass
                )
                : "All_Classes";


        const date =
            new Date()
                .toISOString()
                .slice(
                    0,
                    10
                );


        const fileName =
            "SAF_Speaking_Report_" +
            className +
            "_" +
            date +
            ".xlsx";


        excel.writeFile(
            workbook,
            fileName
        );


        alert(
            "Excel report berhasil dibuat."
        );

    }

    catch (err) {

        console.error(
            "EXPORT EXCEL ERROR:",
            err
        );


        alert(
            err.message ||
            "Gagal membuat file Excel."
        );

    }

}


/* ==========================================================
   FORMAT DATE FOR EXCEL
========================================================== */

function formatDateForExcel(value) {

    if (!value) {

        return "";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            value
        );

    }


    return date.toLocaleString(
        "id-ID"
    );

}


/* ==========================================================
   SANITIZE FILE NAME
========================================================== */

function sanitizeFileName(value) {

    return String(
        value || ""
    )

        .replace(
            /[<>:"/\\|?*]+/g,
            "_"
        )

        .replace(
            /\s+/g,
            "_"
        )

        .trim() ||

        "Report";

}


/* ==========================================================
   DASHBOARD COUNTERS
========================================================== */

function updateQuestionCounter(total) {

    const elements = [

        "totalQuestion",

        "dashboardQuestionCount"

    ];


    elements.forEach(
        id => {

            const el =
                document.getElementById(
                    id
                );


            if (el) {

                el.textContent =
                    total;

            }

        }
    );

}


function updateStudentCounter(total) {

    const elements = [

        "totalStudent",

        "dashboardStudentCount"

    ];


    elements.forEach(
        id => {

            const el =
                document.getElementById(
                    id
                );


            if (el) {

                el.textContent =
                    total;

            }

        }
    );

}


function updateTokenCounter(total) {

    const elements = [

        "totalToken",

        "dashboardTokenCount"

    ];


    elements.forEach(
        id => {

            const el =
                document.getElementById(
                    id
                );


            if (el) {

                el.textContent =
                    total;

            }

        }
    );

}


function updateResultCounter(total) {

    const elements = [

        "totalResult",

        "dashboardResultCount"

    ];


    elements.forEach(
        id => {

            const el =
                document.getElementById(
                    id
                );


            if (el) {

                el.textContent =
                    total;

            }

        }
    );

}


/* ==========================================================
   ESCAPE HTML
========================================================== */

function escapeHTML(value) {

    if (
        value === null ||
        typeof value === "undefined"
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* ==========================================================
   ESCAPE ATTRIBUTE
========================================================== */

function escapeAttribute(value) {

    if (
        value === null ||
        typeof value === "undefined"
    ) {

        return "";

    }


    return String(value)

        .replace(
            /\\/g,
            "\\\\"
        )

        .replace(
            /'/g,
            "\\'"
        )

        .replace(
            /"/g,
            "&quot;"
        );

}


/* ==========================================================
   FORMAT DATE
========================================================== */

function formatDate(value) {

    if (!value) {

        return "-";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return escapeHTML(
            value
        );

    }


    return escapeHTML(
        date.toLocaleString()
    );

}


/* ==========================================================
   END OF teacher.js v7.3
   FINAL CLEAN
========================================================== */