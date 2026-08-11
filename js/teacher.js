/**
 * ==========================================
 * SAF Speaking Online Test
 * Teacher Dashboard
 *
 * File:
 * js/teacher.js
 *
 * Stable Foundation v7.0
 *
 * Frontend Sync:
 * - Question.gs
 * - Student.gs
 * - Token.gs
 * - Result.gs
 * - Score.gs
 *
 * IMPORTANT:
 * - Teacher dashboard business logic
 * - No dependency on exam.js
 * - Question state uses STATE object
 * - Token state uses APP.token
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


    content.innerHTML = html;

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
            questionResult.success
                ? (
                    questionResult.data || []
                )
                : [];


        APP.student =
            studentResult &&
            studentResult.success
                ? (
                    studentResult.data || []
                )
                : [];


        APP.token =
            tokenResult &&
            tokenResult.success
                ? (
                    tokenResult.data || []
                )
                : [];


        APP.result =
            resultResult &&
            resultResult.success
                ? (
                    resultResult.data || []
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

    }

    catch (err) {

        console.error(
            "REFRESH DASHBOARD ERROR:",
            err
        );

    }

}


/* =====================================================
   DASHBOARD PAGE
===================================================== */

function loadDashboard() {

    setContent(`

        <h2>Dashboard</h2>

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


/* =====================================================
   QUESTION PAGE
===================================================== */

function loadQuestionPage() {

    STATE.questionEdit = false;

    STATE.questionId = null;


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
   LOAD QUESTIONS
===================================================== */

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


    table.innerHTML = html;

}


/* =====================================================
   SAVE QUESTION
===================================================== */

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


/* =====================================================
   EDIT QUESTION
===================================================== */

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
            question.duration || 30;

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


/* =====================================================
   DELETE QUESTION
===================================================== */

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

        duration.value = 30;

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


/* =====================================================
   EDIT STUDENT
===================================================== */

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

}


/* =====================================================
   DELETE STUDENT
===================================================== */

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


        const expired =
            document.getElementById(
                "expired"
            );


        if (expired) {

            expired.value = 30;

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


/* =====================================================
   LOAD TOKEN
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


        APP.token.forEach(
            (t, i) => {

                const status =
                    String(
                        t.status || ""
                    ).toUpperCase();


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
                            minutes
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
            "LOAD TOKEN ERROR:",
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

            return;

        }


        APP.result =
            Array.isArray(res.data)
                ? res.data
                : [];


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
            (r, i) => {

                html += `

                    <tr>

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
                                onclick="deleteResult('${escapeAttribute(r.id)}')">

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
   DELETE RESULT
===================================================== */

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
   COUNTERS
===================================================== */

function updateQuestionCounter(total) {

    const elements = [

        "totalQuestion",

        "dashboardQuestionCount"

    ];


    elements.forEach(id => {

        const el =
            document.getElementById(id);


        if (el) {

            el.textContent =
                total;

        }

    });

}


function updateStudentCounter(total) {

    const elements = [

        "totalStudent",

        "dashboardStudentCount"

    ];


    elements.forEach(id => {

        const el =
            document.getElementById(id);


        if (el) {

            el.textContent =
                total;

        }

    });

}


function updateTokenCounter(total) {

    const elements = [

        "totalToken",

        "dashboardTokenCount"

    ];


    elements.forEach(id => {

        const el =
            document.getElementById(id);


        if (el) {

            el.textContent =
                total;

        }

    });

}


function updateResultCounter(total) {

    const elements = [

        "totalResult",

        "dashboardResultCount"

    ];


    elements.forEach(id => {

        const el =
            document.getElementById(id);


        if (el) {

            el.textContent =
                total;

        }

    });

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