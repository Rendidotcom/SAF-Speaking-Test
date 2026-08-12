/**
 * ==========================================
 * SAF Speaking Online Test
 * Teacher Dashboard
 *
 * File:
 * js/teacher.js
 *
 * Stable Foundation v7.0
 * Result Response Fix
 *
 * ==========================================
 *
 * Frontend Sync:
 * - Question.gs
 * - Student.gs
 * - Token.gs
 * - Result.gs
 * - Score.gs
 *
 * IMPORTANT:
 *
 * - Teacher dashboard business logic
 * - No dependency on exam.js
 * - Question state uses STATE object
 * - Student state uses STATE object
 * - Token state uses APP.token
 * - Result state uses APP.result
 *
 * RESULT FIX:
 *
 * API Result saat ini dapat mengembalikan:
 *
 * {
 *     0: {...},
 *     1: {...},
 *     2: {...},
 *     success: true,
 *     message: "Success"
 * }
 *
 * atau:
 *
 * {
 *     success: true,
 *     data: [...]
 * }
 *
 * Keduanya didukung.
 *
 * ==========================================
 */


/* =====================================================
   INITIALIZE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    init
);


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


/* =====================================================
   LOGOUT
===================================================== */

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


/* =====================================================
   LOGOUT BINDING
===================================================== */

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


/* =====================================================
   SIDEBAR MENU
===================================================== */

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

                    }

                };

        });

}


/* =====================================================
   CONTENT
===================================================== */

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


/* =====================================================
   API ARRAY NORMALIZER
===================================================== */

/*
 * Supports both:
 *
 * 1. response.data = [...]
 *
 * 2. response = {
 *        0: {...},
 *        1: {...},
 *        2: {...},
 *        success: true,
 *        message: "Success"
 *    }
 *
 * This is especially important
 * for the current Result API response.
 */

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


/* =====================================================
   DASHBOARD DATA
===================================================== */

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


        /*
         * =================================================
         * RESULT FIX #1
         * =================================================
         *
         * IMPORTANT:
         *
         * Current Result API may return the records
         * directly at the root response:
         *
         * response[0]
         * response[1]
         * response[2]
         *
         * instead of:
         *
         * response.data
         */

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


/* =====================================================
   DASHBOARD COUNTERS
===================================================== */

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


/* =====================================================
   DASHBOARD PAGE
===================================================== */

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
            Questions, Students, Exam Tokens
            and Results.
        </p>

        <br>

        <table
            width="100%"
            cellpadding="8"
            border="1">

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

                <td>
                    ${APP.question.length}
                </td>

                <td>
                    ${APP.student.length}
                </td>

                <td>
                    ${APP.token.length}
                </td>

                <td>
                    ${APP.result.length}
                </td>

            </tr>

        </table>

    `);

}


/* =====================================================
   QUESTION PAGE
===================================================== */

function loadQuestionPage() {

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

            <select id="difficulty">

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


/* =====================================================
   SAVE QUESTION
===================================================== */

async function saveQuestion(e) {

    e.preventDefault();


    const data = {

        title:
            document
                .getElementById("title")
                .value
                .trim(),

        answer:
            document
                .getElementById("answer")
                .value
                .trim(),

        difficulty:
            document
                .getElementById("difficulty")
                .value,

        duration:
            Number(
                document
                    .getElementById("duration")
                    .value
            ),

        status:
            "Active",

        createdBy:
            "Teacher"

    };


    let res;


    if (
        STATE.questionEdit
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


    alert(
        res &&
        res.message
            ? res.message
            : "Operation completed."
    );


    if (
        !res ||
        res.success !== true
    ) {

        return;

    }


    resetQuestionForm();

    await loadQuestions();

    await refreshDashboard();

}


/* =====================================================
   LOAD QUESTIONS
===================================================== */

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


/* =====================================================
   RENDER QUESTIONS
===================================================== */

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

        <table
            border="1"
            width="100%"
            cellpadding="8">

            <thead>

                <tr>

                    <th>
                        No
                    </th>

                    <th>
                        Title
                    </th>

                    <th>
                        Answer Key
                    </th>

                    <th>
                        Difficulty
                    </th>

                    <th>
                        Duration
                    </th>

                    <th>
                        Status
                    </th>

                    <th>
                        Action
                    </th>

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
                    </td>

                    <td>
                        ${escapeHTML(q.status)}
                    </td>

                    <td>

                        <button
                            type="button"
                            class="btn edit"
                            onclick="editQuestion('${escapeAttribute(q.id)}')">

                            Edit

                        </button>

                        <button
                            type="button"
                            class="btn delete"
                            onclick="deleteQuestion('${escapeAttribute(q.id)}')">

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

    `;


    table.innerHTML =
        html;

}


/* =====================================================
   EDIT QUESTION
===================================================== */

function editQuestion(id) {

    const item =
        APP.question.find(
            q =>
                String(q.id) ===
                String(id)
        );


    if (!item) {

        return;

    }


    STATE.questionEdit =
        true;

    STATE.questionId =
        item.id;


    document.getElementById(
        "title"
    ).value =
        item.title || "";


    document.getElementById(
        "answer"
    ).value =
        item.answer || "";


    document.getElementById(
        "difficulty"
    ).value =
        item.difficulty || "Easy";


    document.getElementById(
        "duration"
    ).value =
        item.duration || 30;


    const button =
        document.getElementById(
            "btnSaveQuestion"
        );


    if (button) {

        button.innerText =
            "Update Question";

    }

}


/* =====================================================
   DELETE QUESTION
===================================================== */

async function deleteQuestion(id) {

    if (
        !confirm(
            "Delete this question?"
        )
    ) {

        return;

    }


    const res =
        await apiDeleteQuestion({

            id: id

        });


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


    await loadQuestions();

    await refreshDashboard();

}


/* =====================================================
   RESET QUESTION FORM
===================================================== */

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


/* =====================================================
   SEARCH QUESTION
===================================================== */

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


/* =====================================================
   STUDENT PAGE
===================================================== */

function loadStudentPage() {

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


/* =====================================================
   SAVE STUDENT
===================================================== */

async function saveStudent(e) {

    e.preventDefault();


    const data = {

        nis:
            document
                .getElementById("nis")
                .value
                .trim(),

        nama:
            document
                .getElementById("nama")
                .value
                .trim(),

        kelas:
            document
                .getElementById("kelas")
                .value
                .trim(),

        username:
            document
                .getElementById("username")
                .value
                .trim(),

        password:
            document
                .getElementById("password")
                .value
                .trim(),

        status:
            "Active"

    };


    let res;


    if (
        STATE.studentEdit
    ) {

        data.id =
            STATE.studentId;


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
            : "Operation completed."
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


/* =====================================================
   LOAD STUDENTS
===================================================== */

async function loadStudents() {

    const table =
        document.getElementById(
            "studentTable"
        );


    if (!table) {

        return;

    }


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

            <table
                border="1"
                width="100%"
                cellpadding="8">

                <thead>

                    <tr>

                        <th>
                            No
                        </th>

                        <th>
                            NIS
                        </th>

                        <th>
                            Name
                        </th>

                        <th>
                            Class
                        </th>

                        <th>
                            Username
                        </th>

                        <th>
                            Status
                        </th>

                        <th>
                            Action
                        </th>

                    </tr>

                </thead>

                <tbody>

        `;


        APP.student.forEach(
            (s, i) => {

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
                                onclick="editStudent('${escapeAttribute(s.id)}')">

                                Edit

                            </button>

                            <button
                                type="button"
                                class="btn delete"
                                onclick="deleteStudent('${escapeAttribute(s.id)}')">

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


/* =====================================================
   EDIT STUDENT
===================================================== */

function editStudent(id) {

    const student =
        APP.student.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!student) {

        return;

    }


    STATE.studentEdit =
        true;

    STATE.studentId =
        student.id;


    document.getElementById(
        "nis"
    ).value =
        student.nis || "";


    document.getElementById(
        "nama"
    ).value =
        student.nama || "";


    document.getElementById(
        "kelas"
    ).value =
        student.kelas || "";


    document.getElementById(
        "username"
    ).value =
        student.username || "";


    document.getElementById(
        "password"
    ).value =
        student.password || "";


    const button =
        document.getElementById(
            "btnSaveStudent"
        );


    if (button) {

        button.innerText =
            "Update Student";

    }

}


/* =====================================================
   DELETE STUDENT
===================================================== */

async function deleteStudent(id) {

    if (
        !confirm(
            "Delete this student?"
        )
    ) {

        return;

    }


    const res =
        await apiDeleteStudent({

            id: id

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


    await loadStudents();

    await refreshDashboard();

}


/* =====================================================
   RESET STUDENT FORM
===================================================== */

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


/* =====================================================
   SEARCH STUDENT
===================================================== */

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


/* =====================================================
   TOKEN PAGE
===================================================== */

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
                class="btn teacher">

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
            generateExamToken
        );

    }


    loadTokens();

}


/* =====================================================
   GENERATE TOKEN
===================================================== */

async function generateExamToken(e) {

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
            "Exam token form is not available."
        );

        return;

    }


    const data = {

        kelas:
            classElement.value
                .trim(),

        expired:
            Number(
                expiredElement.value
            ),

        note:
            noteElement.value
                .trim(),

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


        const expired =
            document.getElementById(
                "expired"
            );


        if (expired) {

            expired.value =
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


/* =====================================================
   LOAD TOKENS
===================================================== */

async function loadTokens() {

    const table =
        document.getElementById(
            "tokenTable"
        );


    if (!table) {

        return;

    }


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

            <table
                border="1"
                width="100%"
                cellpadding="8">

                <thead>

                    <tr>

                        <th>
                            No
                        </th>

                        <th>
                            Token
                        </th>

                        <th>
                            Class
                        </th>

                        <th>
                            Status
                        </th>

                        <th>
                            Expired
                        </th>

                        <th>
                            Created
                        </th>

                        <th>
                            Action
                        </th>

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
                                onclick="disableExamToken('${escapeAttribute(t.token)}')">

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
                                onclick="deleteExamToken('${escapeAttribute(t.token)}')">

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


/* =====================================================
   DISABLE TOKEN
===================================================== */

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


/* =====================================================
   DELETE TOKEN
===================================================== */

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


/* =====================================================
   SEARCH TOKEN
===================================================== */

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


/* =====================================================
   RESULT PAGE
===================================================== */

function loadResultPage() {

    setContent(`

        <h2>
            Speaking Results
        </h2>

        <br>

        <input
            id="searchResult"
            type="text"
            placeholder="Search Student..."
            onkeyup="filterResult()"
        >

        <br><br>

        <div id="resultTable">

            Loading...

        </div>

    `);


    loadResults();

}


/* =====================================================
   LOAD RESULTS
===================================================== */

async function loadResults() {

    const table =
        document.getElementById(
            "resultTable"
        );


    if (!table) {

        return;

    }


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

            table.innerHTML =
                "<p style='color:red'>" +
                escapeHTML(
                    res &&
                    res.message
                        ? res.message
                        : "Failed to load results."
                ) +
                "</p>";

            APP.result = [];

            updateResultCounter(0);

            return;

        }


        /*
         * =================================================
         * RESULT FIX #2
         * =================================================
         *
         * IMPORTANT:
         *
         * If API returns:
         *
         * response.data = [...]
         *
         * use response.data.
         *
         * If API returns:
         *
         * response[0]
         * response[1]
         * response[2]
         *
         * use the root response.
         */

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

    }

}


/* =====================================================
   RENDER RESULT LIST
===================================================== */

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

        return;

    }


    let html = `

        <table
            border="1"
            width="100%"
            cellpadding="8">

            <thead>

                <tr>

                    <th>
                        No
                    </th>

                    <th>
                        NIS
                    </th>

                    <th>
                        Name
                    </th>

                    <th>
                        Class
                    </th>

                    <th>
                        Question
                    </th>

                    <th>
                        Score
                    </th>

                    <th>
                        Accuracy
                    </th>

                    <th>
                        Transcript
                    </th>

                    <th>
                        Feedback
                    </th>

                    <th>
                        Result ID
                    </th>

                    <th>
                        Action
                    </th>

                </tr>

            </thead>

            <tbody>

    `;


    APP.result.forEach(
        (r, i) => {

            /*
             * Score compatibility.
             *
             * Current backend normally provides:
             *
             * score
             *
             * Additional aliases are supported
             * without changing backend.
             */

            const score =
                r.score ??
                r.totalScore ??
                r.nilai ??
                r.value ??
                "-";


            const accuracy =
                r.accuracy ??
                r.accuracyScore ??
                r.pronunciationAccuracy ??
                r.accuracyPercent ??
                "-";


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
                "-";


            html += `

                <tr>

                    <td>
                        ${i + 1}
                    </td>

                    <td>
                        ${escapeHTML(
                            r.nis
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            r.nama
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            r.kelas
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            r.question
                        )}
                    </td>

                    <td>

                        <b>
                            ${escapeHTML(
                                score
                            )}
                        </b>

                    </td>

                    <td>
                        ${escapeHTML(
                            accuracy
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            transcript
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            feedback
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            resultId
                        )}
                    </td>

                    <td>

                        <button
                            type="button"
                            class="btn delete"
                            onclick="deleteResult('${escapeAttribute(resultId)}')">

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

    `;


    table.innerHTML =
        html;

}


/* =====================================================
   DELETE RESULT
===================================================== */

async function deleteResult(id) {

    if (!id || id === "-") {

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


/* =====================================================
   SEARCH RESULT
===================================================== */

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


/* =====================================================
   DASHBOARD COUNTERS
===================================================== */

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


/* =====================================================
   ESCAPE HTML
===================================================== */

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


/* =====================================================
   ESCAPE ATTRIBUTE
===================================================== */

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


/* =====================================================
   FORMAT DATE
===================================================== */

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


/* =====================================================
   END OF FILE
===================================================== */