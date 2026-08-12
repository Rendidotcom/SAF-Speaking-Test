/**
 * =========================================================
 * SAF SPEAKING ONLINE TEST
 * Teacher Dashboard
 *
 * File:
 * js/teacher.js
 *
 * Stable Foundation v7.2
 *
 * FIX:
 *
 * - Exam Token now requires Speaking Question
 * - Token creation sends questionId
 * - Question selector uses APP.question
 * - No dependency on exam.js
 *
 * RESULT RESPONSE FIX:
 *
 * - Normalize API array responses
 * - Supports:
 *      1. Direct Array
 *      2. Object with data Array
 *      3. Object with numeric keys
 *
 * Frontend Sync:
 *
 * - Question.gs
 * - Student.gs
 * - Token.gs
 * - Result.gs
 * - Score.gs
 *
 * IMPORTANT:
 *
 * - Existing architecture preserved
 * - Existing API action names preserved
 * - Existing APP state preserved
 * - Existing STATE object preserved
 * - No exam.js dependency
 * =========================================================
 */


/* =========================================================
INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    init
);


/* =========================================================
GLOBAL STATE
========================================================= */

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


/* =========================================================
API ARRAY NORMALIZER
========================================================= */

/**
 * Normalize API response data into a real JavaScript Array.
 *
 * Supported formats:
 *
 * 1. Direct Array
 *
 * [
 *     {...},
 *     {...}
 * ]
 *
 *
 * 2. Object containing data Array
 *
 * {
 *     data: [
 *         {...},
 *         {...}
 *     ]
 * }
 *
 *
 * 3. Object with numeric keys
 *
 * {
 *     "0": {...},
 *     "1": {...},
 *     "2": {...}
 * }
 *
 *
 * This is especially important for Result API responses.
 */

function normalizeApiArray(value) {

    /* -----------------------------------------------------
       FORMAT 1
       Already an Array
    ----------------------------------------------------- */

    if (Array.isArray(value)) {

        return value;

    }


    /* -----------------------------------------------------
       FORMAT 2
       Object with data Array
    ----------------------------------------------------- */

    if (
        value &&
        Array.isArray(value.data)
    ) {

        return value.data;

    }


    /* -----------------------------------------------------
       FORMAT 3
       Object with numeric keys
    ----------------------------------------------------- */

    if (
        value &&
        typeof value === "object"
    ) {

        const keys =
            Object.keys(value);


        const numericKeys =
            keys.filter(
                function (key) {

                    return /^\d+$/.test(
                        key
                    );

                }
            );


        if (
            numericKeys.length > 0
        ) {

            return numericKeys
                .sort(
                    function (a, b) {

                        return (
                            Number(a) -
                            Number(b)
                        );

                    }
                )
                .map(
                    function (key) {

                        return value[key];

                    }
                );

        }

    }


    /* -----------------------------------------------------
       FALLBACK
    ----------------------------------------------------- */

    return [];

}


/* =========================================================
INITIALIZE
========================================================= */

async function init() {

    checkSession();

    bindMenu();

    bindLogout();

    await refreshDashboard();

    loadDashboard();

}


/* =========================================================
SESSION
========================================================= */

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


/* =========================================================
LOGOUT BINDING
========================================================= */

function bindLogout() {

    document
        .querySelectorAll("a")
        .forEach(
            function (link) {

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

            }
        );

}


/* =========================================================
SIDEBAR MENU
========================================================= */

function bindMenu() {

    document
        .querySelectorAll("[data-page]")
        .forEach(
            function (menu) {

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

            }
        );

}


/* =========================================================
CONTENT
========================================================= */

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


/* =========================================================
DASHBOARD DATA
========================================================= */

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


        /* -------------------------------------------------
           QUESTIONS
        ------------------------------------------------- */

        APP.question =
            questionResult &&
            questionResult.success
                ? normalizeApiArray(
                    questionResult.data
                )
                : [];


        /* -------------------------------------------------
           STUDENTS
        ------------------------------------------------- */

        APP.student =
            studentResult &&
            studentResult.success
                ? normalizeApiArray(
                    studentResult.data
                )
                : [];


        /* -------------------------------------------------
           TOKENS
        ------------------------------------------------- */

        APP.token =
            tokenResult &&
            tokenResult.success
                ? normalizeApiArray(
                    tokenResult.data
                )
                : [];


        /* -------------------------------------------------
           RESULTS
           
           IMPORTANT:
           Do not use Array.isArray() directly here.
        ------------------------------------------------- */

        APP.result =
            resultResult &&
            resultResult.success
                ? normalizeApiArray(
                    resultResult.data
                )
                : [];


        console.log(
            "REFRESH DASHBOARD RESULT:",
            resultResult
        );


        console.log(
            "NORMALIZED APP.result:",
            APP.result
        );


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

    catch (err) {

        console.error(
            "REFRESH DASHBOARD ERROR:",
            err
        );

    }

}


/* =========================================================
DASHBOARD PAGE
========================================================= */

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

                <td id="dashboardQuestionCount">
                    ${APP.question.length}
                </td>

                <td id="dashboardStudentCount">
                    ${APP.student.length}
                </td>

                <td id="dashboardTokenCount">
                    ${APP.token.length}
                </td>

                <td id="dashboardResultCount">
                    ${APP.result.length}
                </td>

            </tr>

        </table>

    `);

}


/* =========================================================
QUESTION PAGE
========================================================= */

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


/* =========================================================
LOAD QUESTIONS
========================================================= */

async function loadQuestions() {

    const table =
        document.getElementById(
            "questionTable"
        );


    if (!table) {

        console.warn(
            "loadQuestions: #questionTable not found."
        );

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


/* =========================================================
RENDER QUESTIONS
========================================================= */

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
        function (q, index) {

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


/* =========================================================
SAVE QUESTION
========================================================= */

async function saveQuestion(e) {

    e.preventDefault();


    const titleElement =
        document.getElementById(
            "title"
        );


    const answerElement =
        document.getElementById(
            "answer"
        );


    const difficultyElement =
        document.getElementById(
            "difficulty"
        );


    const durationElement =
        document.getElementById(
            "duration"
        );


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

        alert(
            "Title wajib diisi."
        );

        return;

    }


    if (!data.answer) {

        alert(
            "Answer Key wajib diisi."
        );

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


/* =========================================================
EDIT QUESTION
========================================================= */

function editQuestion(id) {

    const question =
        APP.question.find(
            function (item) {

                return (
                    String(item.id) ===
                    String(id)
                );

            }
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
        document.getElementById(
            "title"
        );


    const answer =
        document.getElementById(
            "answer"
        );


    const difficulty =
        document.getElementById(
            "difficulty"
        );


    const duration =
        document.getElementById(
            "duration"
        );


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


/* =========================================================
DELETE QUESTION
========================================================= */

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
            ) === String(id)
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


/* =========================================================
RESET QUESTION FORM
========================================================= */

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


/* =========================================================
SEARCH QUESTION
========================================================= */

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
        .forEach(
            function (row) {

                row.style.display =
                    row.innerText
                        .toLowerCase()
                        .includes(keyword)
                            ? ""
                            : "none";

            }
        );

}


/* =========================================================
STUDENT PAGE
========================================================= */

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


/* =========================================================
SAVE STUDENT
========================================================= */

async function saveStudent(e) {

    e.preventDefault();


    const nis =
        document.getElementById(
            "nis"
        );


    const nama =
        document.getElementById(
            "nama"
        );


    const kelas =
        document.getElementById(
            "kelas"
        );


    const username =
        document.getElementById(
            "username"
        );


    const password =
        document.getElementById(
            "password"
        );


    if (
        !nis ||
        !nama ||
        !kelas ||
        !username ||
        !password
    ) {

        alert(
            "Student form is not available."
        );

        return;

    }


    const data = {

        nis:
            nis.value.trim(),

        nama:
            nama.value.trim(),

        kelas:
            kelas.value.trim(),

        username:
            username.value.trim(),

        password:
            password.value.trim(),

        status:
            "ACTIVE"

    };


    if (!data.nis) {

        alert(
            "NIS wajib diisi."
        );

        return;

    }


    if (!data.nama) {

        alert(
            "Nama siswa wajib diisi."
        );

        return;

    }


    let res;


    try {

        if (
            STATE.studentEdit === true &&
            STATE.studentId
        ) {

            data.nis =
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


        console.log(
            "STUDENT SAVE RESPONSE:",
            res
        );


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


/* =========================================================
LOAD STUDENTS
========================================================= */

async function loadStudents() {

    const table =
        document.getElementById(
            "studentTable"
        );


    if (!table) {

        console.warn(
            "loadStudents: #studentTable not found."
        );

        return;

    }


    table.innerHTML =
        "<p>Loading students...</p>";


    try {

        const res =
            await apiGetStudent();


        console.log(
            "GET STUDENT RESPONSE:",
            res
        );


        if (
            !res ||
            res.success !== true
        ) {

            APP.student = [];


            table.innerHTML =
                "<p style='color:red'>" +
                escapeHTML(
                    res &&
                    res.message
                        ? res.message
                        : "Failed to load students."
                ) +
                "</p>";


            updateStudentCounter(0);

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
            function (s, index) {

                html += `

                    <tr>

                        <td>
                            ${index + 1}
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
                                onclick="editStudent('${escapeAttribute(s.nis)}')">

                                Edit

                            </button>

                            <button
                                type="button"
                                class="btn delete"
                                onclick="deleteStudent('${escapeAttribute(s.nis)}')">

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


        APP.student = [];


        table.innerHTML =
            "<p style='color:red'>" +
            escapeHTML(
                err.message ||
                "Unable to load students."
            ) +
            "</p>";

    }

}


/* =========================================================
EDIT STUDENT
========================================================= */

function editStudent(nis) {

    const student =
        APP.student.find(
            function (item) {

                return (
                    String(item.nis) ===
                    String(nis)
                );

            }
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
        student.nis;


    const nisElement =
        document.getElementById(
            "nis"
        );


    const namaElement =
        document.getElementById(
            "nama"
        );


    const kelasElement =
        document.getElementById(
            "kelas"
        );


    const usernameElement =
        document.getElementById(
            "username"
        );


    const passwordElement =
        document.getElementById(
            "password"
        );


    if (nisElement) {

        nisElement.value =
            student.nis || "";

        nisElement.readOnly =
            true;

    }


    if (namaElement) {

        namaElement.value =
            student.nama || "";

    }


    if (kelasElement) {

        kelasElement.value =
            student.kelas || "";

    }


    if (usernameElement) {

        usernameElement.value =
            student.username || "";

    }


    if (passwordElement) {

        passwordElement.value =
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


/* =========================================================
DELETE STUDENT
========================================================= */

async function deleteStudent(nis) {

    if (!nis) {

        alert(
            "Student NIS is required."
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

                nis: nis

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
            ) === String(nis)
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


/* =========================================================
RESET STUDENT FORM
========================================================= */

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


    const nis =
        document.getElementById(
            "nis"
        );


    if (nis) {

        nis.readOnly =
            false;

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


/* =========================================================
SEARCH STUDENT
========================================================= */

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
        .forEach(
            function (row) {

                row.style.display =
                    row.innerText
                        .toLowerCase()
                        .includes(keyword)
                            ? ""
                            : "none";

            }
        );

}


/* =========================================================
TOKEN PAGE
========================================================= */

function loadTokenPage() {

    /*
     * Make sure question data exists.
     *
     * refreshDashboard() normally loads it.
     * If it is empty, reload Questions before
     * rendering the selector.
     */

    if (
        !Array.isArray(APP.question) ||
        APP.question.length === 0
    ) {

        loadQuestionsForTokenPage();

        return;

    }


    renderTokenPage();

}


/* =========================================================
LOAD QUESTIONS FOR TOKEN PAGE
========================================================= */

async function loadQuestionsForTokenPage() {

    try {

        const result =
            await apiGetQuestion();


        if (
            result &&
            result.success === true
        ) {

            APP.question =
                normalizeApiArray(
                    result.data
                );

        }

    }

    catch (err) {

        console.error(
            "LOAD TOKEN QUESTIONS ERROR:",
            err
        );

    }


    renderTokenPage();

}


/* =========================================================
RENDER TOKEN PAGE
========================================================= */

function renderTokenPage() {

    const activeQuestions =
        APP.question.filter(
            function (question) {

                return (
                    question &&
                    String(
                        question.status || ""
                    )
                        .trim()
                        .toUpperCase()
                    === "ACTIVE"
                );

            }
        );


    let questionOptions = `

        <option value="">
            -- Select Speaking Question --
        </option>

    `;


    activeQuestions.forEach(
        function (question) {

            questionOptions += `

                <option
                    value="${escapeAttribute(question.id)}">

                    ${escapeHTML(
                        question.title
                    )}

                </option>

            `;

        }
    );


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
                type="text"
                required
            >

            <br><br>

            <label>
                Speaking Question
            </label>

            <select
                id="tokenQuestionId"
                required>

                ${questionOptions}

            </select>

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
                type="text"
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


/* =========================================================
GENERATE TOKEN
========================================================= */

async function generateExamToken(e) {

    e.preventDefault();


    const classElement =
        document.getElementById(
            "tokenClass"
        );


    const questionElement =
        document.getElementById(
            "tokenQuestionId"
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
        !questionElement ||
        !expiredElement ||
        !noteElement
    ) {

        alert(
            "Exam Token form is not available."
        );

        return;

    }


    const kelas =
        classElement.value
            .trim();


    const questionId =
        questionElement.value
            .trim();


    const expired =
        Number(
            expiredElement.value
        );


    const note =
        noteElement.value
            .trim();


    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!kelas) {

        alert(
            "Class wajib diisi."
        );

        return;

    }


    if (!questionId) {

        alert(
            "Question ID wajib dipilih saat membuat exam token."
        );

        return;

    }


    if (
        !expired ||
        expired <= 0
    ) {

        alert(
            "Expired minutes tidak valid."
        );

        return;

    }


    /*
     * Find selected question.
     */

    const selectedQuestion =
        APP.question.find(
            function (question) {

                return (
                    String(question.id) ===
                    String(questionId)
                );

            }
        );


    if (!selectedQuestion) {

        alert(
            "Speaking Question tidak ditemukan."
        );

        return;

    }


    const data = {

        kelas:
            kelas,

        questionId:
            questionId,

        expired:
            expired,

        note:
            note,

        createdBy:
            "Teacher"

    };


    console.log(
        "CREATE TOKEN REQUEST:",
        data
    );


    try {

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
                : (
                    res &&
                    res.success === true
                        ? "Exam token created."
                        : "Failed to create exam token."
                )
        );


        if (
            !res ||
            res.success !== true
        ) {

            return;

        }


        /*
         * Reset form after successful
         * token creation.
         */

        const form =
            document.getElementById(
                "tokenForm"
            );


        if (form) {

            form.reset();

        }


        const expiredInput =
            document.getElementById(
                "expired"
            );


        if (expiredInput) {

            expiredInput.value =
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
            "Unable to create exam token."
        );

    }

}


/* =========================================================
LOAD TOKENS
========================================================= */

async function loadTokens() {

    const table =
        document.getElementById(
            "tokenTable"
        );


    if (!table) {

        console.warn(
            "loadTokens: #tokenTable not found."
        );

        return;

    }


    table.innerHTML =
        "<p>Loading tokens...</p>";


    try {

        const res =
            await apiGetToken();


        console.log(
            "GET TOKEN RESPONSE:",
            res
        );


        if (
            !res ||
            res.success !== true
        ) {

            APP.token = [];


            table.innerHTML =
                "<p style='color:red'>" +
                escapeHTML(
                    res &&
                    res.message
                        ? res.message
                        : "Failed to load tokens."
                ) +
                "</p>";


            updateTokenCounter(0);

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


        renderTokens();

    }

    catch (err) {

        console.error(
            "LOAD TOKENS ERROR:",
            err
        );


        APP.token = [];


        table.innerHTML =
            "<p style='color:red'>" +
            escapeHTML(
                err.message ||
                "Unable to load tokens."
            ) +
            "</p>";

    }

}


/* =========================================================
RENDER TOKENS
========================================================= */

function renderTokens() {

    const table =
        document.getElementById(
            "tokenTable"
        );


    if (!table) {

        return;

    }


    if (
        !Array.isArray(APP.token) ||
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

                    <th>No</th>

                    <th>Token</th>

                    <th>Class</th>

                    <th>Question</th>

                    <th>Status</th>

                    <th>Expired</th>

                    <th>Action</th>

                </tr>

            </thead>

            <tbody>

    `;


    APP.token.forEach(
        function (token, index) {

            const question =
                APP.question.find(
                    function (q) {

                        return (
                            String(q.id) ===
                            String(
                                token.questionId || ""
                            )
                        );

                    }
                );


            const questionTitle =
                question
                    ? question.title
                    : (
                        token.questionId
                            ? "Question ID: " +
                              token.questionId
                            : "-"
                    );


            html += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        <b>
                            ${escapeHTML(
                                token.token
                            )}
                        </b>
                    </td>

                    <td>
                        ${escapeHTML(
                            token.kelas
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            questionTitle
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            token.status
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            token.expired
                        )}
                    </td>

                    <td>

                        <button
                            type="button"
                            class="btn edit"
                            onclick="disableExamToken('${escapeAttribute(token.token)}')">

                            Disable

                        </button>

                        <button
                            type="button"
                            class="btn delete"
                            onclick="deleteExamToken('${escapeAttribute(token.token)}')">

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


/* =========================================================
DISABLE TOKEN
========================================================= */

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

                token:
                    token

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


/* =========================================================
DELETE TOKEN
========================================================= */

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

                token:
                    token

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


/* =========================================================
SEARCH TOKEN
========================================================= */

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
        .forEach(
            function (row) {

                row.style.display =
                    row.innerText
                        .toLowerCase()
                        .includes(keyword)
                            ? ""
                            : "none";

            }
        );

}


/* =========================================================
RESULT PAGE
========================================================= */

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


/* =========================================================
LOAD RESULTS
========================================================= */

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


        /* -------------------------------------------------
           RAW RESPONSE DIAGNOSTIC
        ------------------------------------------------- */

        console.log(
            "RESULT SUCCESS:",
            res &&
            res.success
        );


        console.log(
            "RESULT DATA:",
            res &&
            res.data
        );


        console.log(
            "RESULT DATA IS ARRAY:",
            res &&
            Array.isArray(res.data)
        );


        if (
            res &&
            res.data &&
            typeof res.data === "object"
        ) {

            console.log(
                "RESULT DATA KEYS:",
                Object.keys(
                    res.data
                )
            );

        }


        /* -------------------------------------------------
           API FAILURE
        ------------------------------------------------- */

        if (
            !res ||
            res.success !== true
        ) {

            APP.result = [];


            table.innerHTML =
                "<p style='color:red'>" +
                escapeHTML(
                    res &&
                    res.message
                        ? res.message
                        : "Failed to load results."
                ) +
                "</p>";


            updateResultCounter(0);

            return;

        }


        /* -------------------------------------------------
           IMPORTANT RESULT NORMALIZATION
        ------------------------------------------------- */

        APP.result =
            normalizeApiArray(
                res.data
            );


        console.log(
            "NORMALIZED RESULT ARRAY:",
            APP.result
        );


        console.log(
            "NORMALIZED RESULT LENGTH:",
            APP.result.length
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


        let html = `

            <table
                border="1"
                width="100%"
                cellpadding="8">

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


        APP.result.forEach(
            function (result, index) {

                html += `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHTML(
                                result.nis
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                result.nama
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                result.question
                            )}
                        </td>

                        <td>
                            <b>
                                ${escapeHTML(
                                    result.score
                                )}
                            </b>
                        </td>

                        <td>
                            ${escapeHTML(
                                result.feedback
                            )}
                        </td>

                        <td>

                            <button
                                type="button"
                                class="btn delete"
                                onclick="deleteResult('${escapeAttribute(result.id)}')">

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
            "LOAD RESULTS ERROR:",
            err
        );


        APP.result = [];


        table.innerHTML =
            "<p style='color:red'>" +
            escapeHTML(
                err.message ||
                "Unable to load results."
            ) +
            "</p>";

    }

}


/* =========================================================
DELETE RESULT
========================================================= */

async function deleteResult(id) {

    if (!id) {

        alert(
            "Result ID is required."
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

                id:
                    id

            });


        console.log(
            "DELETE RESULT RESPONSE:",
            res
        );


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


/* =========================================================
SEARCH RESULT
========================================================= */

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
        .forEach(
            function (row) {

                row.style.display =
                    row.innerText
                        .toLowerCase()
                        .includes(keyword)
                            ? ""
                            : "none";

            }
        );

}


/* =========================================================
DASHBOARD COUNTERS
========================================================= */

function updateQuestionCounter(total) {

    const elements =
        document.querySelectorAll(
            "#totalQuestion"
        );


    elements.forEach(
        function (element) {

            element.textContent =
                total;

        }
    );

}


function updateStudentCounter(total) {

    const elements =
        document.querySelectorAll(
            "#totalStudent"
        );


    elements.forEach(
        function (element) {

            element.textContent =
                total;

        }
    );

}


function updateTokenCounter(total) {

    const elements =
        document.querySelectorAll(
            "#totalToken"
        );


    elements.forEach(
        function (element) {

            element.textContent =
                total;

        }
    );

}


function updateResultCounter(total) {

    const elements =
        document.querySelectorAll(
            "#totalResult"
        );


    elements.forEach(
        function (element) {

            element.textContent =
                total;

        }
    );

}


/* =========================================================
COMMON HELPERS
========================================================= */

function escapeHTML(value) {

    return String(
        value === null ||
        typeof value === "undefined"
            ? ""
            : value
    )

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


function escapeAttribute(value) {

    return String(
        value === null ||
        typeof value === "undefined"
            ? ""
            : value
    )

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


/* =========================================================
END OF FILE
========================================================= */