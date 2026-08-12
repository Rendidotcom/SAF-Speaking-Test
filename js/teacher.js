/**
 * =========================================================
 * SAF Speaking Online Test
 * Teacher Dashboard
 *
 * File:
 * js/teacher.js
 *
 * Stable Foundation v7.3
 *
 * FIX:
 * - Result response normalization
 * - Result numeric-key response support
 * - Result Select All
 * - Result Delete Selected
 * - Result Delete All
 * - Result individual delete
 *
 * PRESERVED:
 * - Dashboard
 * - Question management
 * - Student management
 * - Token management
 * - Session / Logout
 * - Existing API functions
 *
 * NO BACKEND CHANGE REQUIRED
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

    studentId: null

};


/* =========================================================
   RESULT SELECTION STATE
========================================================= */

const RESULT_SELECTION = new Set();


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


/* =========================================================
   LOGOUT
========================================================= */

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


/* =========================================================
   SIDEBAR MENU
========================================================= */

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


        APP.question =
            questionResult &&
            questionResult.success === true
                ? (
                    Array.isArray(
                        questionResult.data
                    )
                        ? questionResult.data
                        : []
                )
                : [];


        APP.student =
            studentResult &&
            studentResult.success === true
                ? (
                    Array.isArray(
                        studentResult.data
                    )
                        ? studentResult.data
                        : []
                )
                : [];


        APP.token =
            tokenResult &&
            tokenResult.success === true
                ? (
                    Array.isArray(
                        tokenResult.data
                    )
                        ? tokenResult.data
                        : []
                )
                : [];


        /*
         * IMPORTANT:
         * Result tidak boleh hanya membaca:
         *
         * resultResult.data
         *
         * karena backend saat ini dapat mengembalikan
         * object dengan numeric keys.
         */

        APP.result =
            resultResult &&
            resultResult.success === true
                ? normalizeResultResponse(
                    resultResult
                )
                : [];


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


        console.log(
            "DASHBOARD RESULT:",
            APP.result
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


/* =========================================================
   QUESTION PAGE
========================================================= */

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


/* =========================================================
   SAVE QUESTION
========================================================= */

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


        alert(
            res &&
            res.message
                ? res.message
                : "Question saved."
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
   LOAD QUESTIONS
========================================================= */

async function loadQuestions() {

    const table =
        document.getElementById(
            "questionTable"
        );


    if (!table) {

        return;

    }


    try {

        const res =
            await apiGetQuestion();


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
                        : "Failed to load questions."
                ) +
                "</p>";

            return;

        }


        APP.question =
            Array.isArray(res.data)
                ? res.data
                : [];


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
            (q, i) => {

                html += `

                    <tr>

                        <td>
                            ${i + 1}
                        </td>

                        <td>
                            ${escapeHTML(q.title)}
                        </td>

                        <td>
                            ${escapeHTML(q.difficulty)}
                        </td>

                        <td>
                            ${escapeHTML(q.duration)}s
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

    catch (err) {

        console.error(
            "LOAD QUESTIONS ERROR:",
            err
        );


        table.innerHTML =
            "<p style='color:red'>" +
            escapeHTML(
                err.message ||
                "Unable to load questions."
            ) +
            "</p>";

    }

}


/* =========================================================
   EDIT QUESTION
========================================================= */

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

    const button =
        document.getElementById(
            "btnSaveQuestion"
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
            question.difficulty || "Easy";

    }


    if (duration) {

        duration.value =
            question.duration || 30;

    }


    if (button) {

        button.innerText =
            "Update Question";

    }

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
        .forEach(row => {

            row.style.display =
                row.innerText
                    .toLowerCase()
                    .includes(keyword)
                        ? ""
                        : "none";

        });

}


/* =========================================================
   STUDENT PAGE
========================================================= */

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


/* =========================================================
   SAVE STUDENT
========================================================= */

async function saveStudent(e) {

    e.preventDefault();


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
            "Active"

    };


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
            Array.isArray(res.data)
                ? res.data
                : [];


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
            item =>
                String(item.nis) ===
                String(nis)
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
        document.getElementById("nis");

    const namaElement =
        document.getElementById("nama");

    const kelasElement =
        document.getElementById("kelas");

    const usernameElement =
        document.getElementById("username");

    const passwordElement =
        document.getElementById("password");

    const button =
        document.getElementById(
            "btnSaveStudent"
        );


    if (nisElement) {

        nisElement.value =
            student.nis || "";

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


    if (button) {

        button.innerText =
            "Update Student";

    }

}


/* =========================================================
   DELETE STUDENT
========================================================= */

async function deleteStudent(nis) {

    if (!nis) {

        alert(
            "NIS is required."
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
            String(STATE.studentId) ===
            String(nis)
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
        .forEach(row => {

            row.style.display =
                row.innerText
                    .toLowerCase()
                    .includes(keyword)
                        ? ""
                        : "none";

        });

}


/* =========================================================
   TOKEN PAGE
========================================================= */

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


/* =========================================================
   GENERATE TOKEN
========================================================= */

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
            "Expiration time tidak valid."
        );

        return;

    }


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
            "GENERATE TOKEN ERROR:",
            err
        );


        alert(
            err.message ||
            "Unable to create token."
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
            Array.isArray(res.data)
                ? res.data
                : [];


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
                            Action
                        </th>

                    </tr>

                </thead>

                <tbody>

        `;


        APP.token.forEach(
            (t, i) => {

                html += `

                    <tr>

                        <td>
                            ${i + 1}
                        </td>

                        <td>
                            <b>
                                ${escapeHTML(t.token)}
                            </b>
                        </td>

                        <td>
                            ${escapeHTML(t.kelas)}
                        </td>

                        <td>
                            ${escapeHTML(t.status)}
                        </td>

                        <td>
                            ${escapeHTML(t.expired)}
                        </td>

                        <td>

                            <button
                                type="button"
                                class="btn edit"
                                onclick="disableExamToken('${escapeAttribute(t.token)}')">

                                Disable

                            </button>

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

                token: token

            });


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

                token: token

            });


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
        .forEach(row => {

            row.style.display =
                row.innerText
                    .toLowerCase()
                    .includes(keyword)
                        ? ""
                        : "none";

        });

}


/* =========================================================
   RESULT PAGE
========================================================= */

function loadResultPage() {

    RESULT_SELECTION.clear();


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

        <div
            style="
                display:flex;
                align-items:center;
                gap:10px;
                flex-wrap:wrap;
                margin-bottom:15px;
            "
        >

            <label
                style="
                    display:flex;
                    align-items:center;
                    gap:6px;
                    cursor:pointer;
                "
            >

                <input
                    id="selectAllResults"
                    type="checkbox"
                    onchange="toggleSelectAllResults(this.checked)"
                >

                <span>
                    Select All
                </span>

            </label>


            <button
                type="button"
                class="btn delete"
                onclick="deleteSelectedResults()"
            >

                Delete Selected

            </button>


            <button
                type="button"
                class="btn delete"
                onclick="deleteAllResults()"
            >

                Delete All

            </button>


            <span
                id="selectedResultCount"
            >

                0 selected

            </span>

        </div>


        <div id="resultTable">

            Loading...

        </div>

    `);


    loadResults();

}


/* =========================================================
   RESULT NORMALIZER
========================================================= */

function normalizeResultResponse(response) {

    console.log(
        "RESULT RESPONSE:",
        response
    );


    if (!response) {

        return [];

    }


    /*
     * CASE 1
     *
     * Standard:
     *
     * {
     *   success: true,
     *   data: [...]
     * }
     */

    if (
        Array.isArray(
            response.data
        )
    ) {

        console.log(
            "RESULT DATA IS ARRAY:",
            true
        );


        return response.data;

    }


    /*
     * CASE 2
     *
     * Some backend versions:
     *
     * {
     *   success: true,
     *   result: [...]
     * }
     */

    if (
        Array.isArray(
            response.result
        )
    ) {

        return response.result;

    }


    /*
     * CASE 3
     *
     * Some backend versions:
     *
     * {
     *   success: true,
     *   results: [...]
     * }
     */

    if (
        Array.isArray(
            response.results
        )
    ) {

        return response.results;

    }


    /*
     * CASE 4
     *
     * CURRENT PROBLEM
     *
     * Response can look like:
     *
     * {
     *   0: {...},
     *   1: {...},
     *   2: {...},
     *   success: true,
     *   message: "Success"
     * }
     *
     * Therefore extract numeric keys.
     */

    const numericKeys =
        Object.keys(response)
            .filter(
                key =>
                    /^\d+$/.test(key)
            )
            .sort(
                (a, b) =>
                    Number(a) -
                    Number(b)
            );


    if (
        numericKeys.length > 0
    ) {

        const normalized =
            numericKeys.map(
                key =>
                    response[key]
            );


        console.log(
            "NORMALIZED RESULT ARRAY:",
            normalized
        );


        return normalized;

    }


    /*
     * CASE 5
     *
     * Sometimes data itself is an object:
     *
     * {
     *   data: {
     *      0: {...},
     *      1: {...}
     *   }
     * }
     */

    if (
        response.data &&
        typeof response.data ===
            "object"
    ) {

        const dataKeys =
            Object.keys(
                response.data
            )
            .filter(
                key =>
                    /^\d+$/.test(key)
            )
            .sort(
                (a, b) =>
                    Number(a) -
                    Number(b)
            );


        if (
            dataKeys.length > 0
        ) {

            return dataKeys.map(
                key =>
                    response.data[key]
            );

        }

    }


    console.warn(
        "RESULT RESPONSE FORMAT UNKNOWN:",
        response
    );


    return [];

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


    try {

        console.log(
            "================================="
        );

        console.log(
            "GET RESULT"
        );


        const res =
            await apiGetResult();


        console.log(
            "RESULT API RESPONSE:",
            res
        );


        if (
            !res ||
            res.success !== true
        ) {

            APP.result = [];


            updateResultCounter(
                0
            );


            updateSelectedResultCount();


            table.innerHTML =
                "<p style='color:red'>" +
                escapeHTML(
                    res &&
                    res.message
                        ? res.message
                        : "Failed to load results."
                ) +
                "</p>";

            return;

        }


        /*
         * IMPORTANT:
         * Use normalizer.
         */

        APP.result =
            normalizeResultResponse(
                res
            );


        console.log(
            "RESULT SUCCESS:",
            res.success
        );

        console.log(
            "RESULT DATA:",
            res.data
        );

        console.log(
            "RESULT DATA IS ARRAY:",
            Array.isArray(res.data)
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


        /*
         * Remove selected IDs
         * that no longer exist.
         */

        const validIds =
            new Set(
                APP.result.map(
                    item =>
                        String(item.id)
                )
            );


        Array
            .from(
                RESULT_SELECTION
            )
            .forEach(id => {

                if (
                    !validIds.has(
                        String(id)
                    )
                ) {

                    RESULT_SELECTION.delete(
                        id
                    );

                }

            });


        updateSelectedResultCount();


        if (
            APP.result.length === 0
        ) {

            updateSelectAllCheckbox(
                false
            );


            table.innerHTML =
                "<p>No result found.</p>";

            return;

        }


        let html = `

            <div
                style="overflow-x:auto;"
            >

                <table
                    border="1"
                    width="100%"
                    cellpadding="8"
                >

                    <thead>

                        <tr>

                            <th>
                                <input
                                    id="resultHeaderCheckbox"
                                    type="checkbox"
                                    onchange="toggleSelectAllResults(this.checked)"
                                >
                            </th>

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
                                Feedback
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

                const id =
                    String(
                        r.id || ""
                    );


                const checked =
                    RESULT_SELECTION.has(
                        id
                    )
                        ? "checked"
                        : "";


                html += `

                    <tr>

                        <td>
                            <input
                                type="checkbox"
                                class="result-checkbox"
                                data-result-id="${escapeAttribute(id)}"
                                ${checked}
                                onchange="toggleResultSelection(this)"
                            >
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
                                ${escapeHTML(r.score)}
                            </b>
                        </td>

                        <td>
                            ${escapeHTML(
                                r.feedback || "-"
                            )}
                        </td>

                        <td>

                            <button
                                type="button"
                                class="btn delete"
                                onclick="deleteResult('${escapeAttribute(id)}')"
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


        syncResultCheckboxes();

        updateSelectedResultCount();

    }

    catch (err) {

        console.error(
            "LOAD RESULTS ERROR:",
            err
        );


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
   TOGGLE SINGLE RESULT
========================================================= */

function toggleResultSelection(
    checkbox
) {

    if (!checkbox) {

        return;

    }


    const id =
        String(
            checkbox.dataset.resultId ||
            ""
        );


    if (!id) {

        return;

    }


    if (
        checkbox.checked
    ) {

        RESULT_SELECTION.add(
            id
        );

    }

    else {

        RESULT_SELECTION.delete(
            id
        );

    }


    updateSelectedResultCount();

    syncResultSelectAll();

}


/* =========================================================
   TOGGLE SELECT ALL
========================================================= */

function toggleSelectAllResults(
    checked
) {

    const checkboxes =
        document.querySelectorAll(
            "#resultTable .result-checkbox"
        );


    checkboxes.forEach(
        checkbox => {

            checkbox.checked =
                checked;


            const id =
                String(
                    checkbox.dataset.resultId ||
                    ""
                );


            if (!id) {

                return;

            }


            if (checked) {

                RESULT_SELECTION.add(
                    id
                );

            }

            else {

                RESULT_SELECTION.delete(
                    id
                );

            }

        }
    );


    updateSelectedResultCount();

    updateSelectAllCheckbox(
        checked
    );

}


/* =========================================================
   SYNC RESULT CHECKBOXES
========================================================= */

function syncResultCheckboxes() {

    const checkboxes =
        document.querySelectorAll(
            "#resultTable .result-checkbox"
        );


    checkboxes.forEach(
        checkbox => {

            const id =
                String(
                    checkbox.dataset.resultId ||
                    ""
                );


            checkbox.checked =
                RESULT_SELECTION.has(
                    id
                );

        }
    );


    syncResultSelectAll();

}


/* =========================================================
   SYNC SELECT ALL
========================================================= */

function syncResultSelectAll() {

    const checkboxes =
        Array.from(
            document.querySelectorAll(
                "#resultTable .result-checkbox"
            )
        );


    if (
        checkboxes.length === 0
    ) {

        updateSelectAllCheckbox(
            false
        );

        return;

    }


    const allChecked =
        checkboxes.every(
            checkbox =>
                checkbox.checked
        );


    updateSelectAllCheckbox(
        allChecked
    );

}


/* =========================================================
   UPDATE SELECT ALL CHECKBOX
========================================================= */

function updateSelectAllCheckbox(
    checked
) {

    const top =
        document.getElementById(
            "selectAllResults"
        );


    if (top) {

        top.checked =
            checked;

    }


    const header =
        document.getElementById(
            "resultHeaderCheckbox"
        );


    if (header) {

        header.checked =
            checked;

    }

}


/* =========================================================
   SELECTED RESULT COUNTER
========================================================= */

function updateSelectedResultCount() {

    const el =
        document.getElementById(
            "selectedResultCount"
        );


    if (el) {

        el.textContent =
            RESULT_SELECTION.size +
            " selected";

    }

}


/* =========================================================
   DELETE INDIVIDUAL RESULT
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


        RESULT_SELECTION.delete(
            String(id)
        );


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
   DELETE SELECTED RESULTS
========================================================= */

async function deleteSelectedResults() {

    const selectedIds =
        Array.from(
            RESULT_SELECTION
        );


    if (
        selectedIds.length === 0
    ) {

        alert(
            "Please select at least one result."
        );

        return;

    }


    if (
        !confirm(
            "Delete " +
            selectedIds.length +
            " selected result(s)?"
        )
    ) {

        return;

    }


    try {

        let deleted =
            0;

        let failedCount =
            0;


        for (
            const id of selectedIds
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

                    deleted++;

                }

                else {

                    failedCount++;

                    console.error(
                        "DELETE SELECTED FAILED:",
                        id,
                        res
                    );

                }

            }

            catch (err) {

                failedCount++;

                console.error(
                    "DELETE SELECTED ERROR:",
                    id,
                    err
                );

            }

        }


        RESULT_SELECTION.clear();


        await loadResults();

        await refreshDashboard();


        if (
            failedCount === 0
        ) {

            alert(
                deleted +
                " result(s) deleted successfully."
            );

        }

        else {

            alert(
                deleted +
                " result(s) deleted.\n" +
                failedCount +
                " result(s) failed."
            );

        }

    }

    catch (err) {

        console.error(
            "DELETE SELECTED RESULTS ERROR:",
            err
        );


        alert(
            err.message ||
            "Unable to delete selected results."
        );

    }

}


/* =========================================================
   DELETE ALL RESULTS
========================================================= */

async function deleteAllResults() {

    if (
        APP.result.length === 0
    ) {

        alert(
            "No result available to delete."
        );

        return;

    }


    const total =
        APP.result.length;


    if (
        !confirm(
            "WARNING\n\n" +
            "Delete ALL " +
            total +
            " result(s)?\n\n" +
            "This action cannot be undone."
        )
    ) {

        return;

    }


    /*
     * Second confirmation.
     * Prevent accidental Delete All.
     */

    if (
        !confirm(
            "FINAL CONFIRMATION\n\n" +
            "Are you absolutely sure you want to delete ALL results?"
        )
    ) {

        return;

    }


    try {

        let deleted =
            0;

        let failedCount =
            0;


        /*
         * Copy IDs first.
         * Do not modify APP.result
         * while looping.
         */

        const ids =
            APP.result
                .map(
                    item =>
                        String(
                            item.id || ""
                        )
                )
                .filter(
                    id =>
                        id !== ""
                );


        for (
            const id of ids
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

                    deleted++;

                }

                else {

                    failedCount++;

                    console.error(
                        "DELETE ALL FAILED:",
                        id,
                        res
                    );

                }

            }

            catch (err) {

                failedCount++;

                console.error(
                    "DELETE ALL ERROR:",
                    id,
                    err
                );

            }

        }


        RESULT_SELECTION.clear();


        await loadResults();

        await refreshDashboard();


        if (
            failedCount === 0
        ) {

            alert(
                "All " +
                deleted +
                " result(s) deleted successfully."
            );

        }

        else {

            alert(
                deleted +
                " result(s) deleted.\n" +
                failedCount +
                " result(s) failed."
            );

        }

    }

    catch (err) {

        console.error(
            "DELETE ALL RESULTS ERROR:",
            err
        );


        alert(
            err.message ||
            "Unable to delete all results."
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
        .forEach(row => {

            row.style.display =
                row.innerText
                    .toLowerCase()
                    .includes(keyword)
                        ? ""
                        : "none";

        });


    /*
     * Selection remains based on IDs,
     * not visual filtering.
     */

    syncResultSelectAll();

}


/* =========================================================
   COUNTERS
========================================================= */

function updateQuestionCounter(
    total
) {

    const el =
        document.getElementById(
            "totalQuestion"
        );


    if (el) {

        el.textContent =
            total;

    }

}


function updateStudentCounter(
    total
) {

    const el =
        document.getElementById(
            "totalStudent"
        );


    if (el) {

        el.textContent =
            total;

    }

}


function updateTokenCounter(
    total
) {

    const el =
        document.getElementById(
            "totalToken"
        );


    if (el) {

        el.textContent =
            total;

    }

}


function updateResultCounter(
    total
) {

    const el =
        document.getElementById(
            "totalResult"
        );


    if (el) {

        el.textContent =
            total;

    }

}


/* =========================================================
   COMMON HELPERS
========================================================= */

function escapeHTML(text) {

    return String(
        text === undefined ||
        text === null
            ? ""
            : text
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


/* =========================================================
   ATTRIBUTE ESCAPE
========================================================= */

function escapeAttribute(text) {

    return escapeHTML(
        text
    );

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(value) {

    if (!value) {

        return "-";

    }


    const d =
        new Date(value);


    if (
        isNaN(
            d.getTime()
        )
    ) {

        return String(
            value
        );

    }


    return d.toLocaleString();

}


/* =========================================================
   END OF FILE
========================================================= */