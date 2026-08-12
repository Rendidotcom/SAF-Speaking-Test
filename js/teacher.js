/**
 * =========================================================
 * SAF Speaking Online Test
 * Teacher Dashboard Controller
 *
 * STABLE FOUNDATION
 *
 * MODULE:
 * - Dashboard
 * - Question Management
 * - Student Management
 * - CSV Student Import
 * - Token Management
 * - Result Management
 *
 * BACKEND:
 * api.js
 *
 * IMPORTANT:
 * - Do not change API architecture from this file.
 * - Existing API helper functions are preserved.
 * - Teacher login remains unchanged.
 * - Question insert/update/delete routes remain unchanged.
 * - Student routes remain unchanged.
 * - Token routes remain unchanged.
 * - Result routes remain unchanged.
 * =========================================================
 */


/* =========================================================
   GLOBAL STATE
========================================================= */

let teacherQuestions = [];
let teacherStudents = [];
let teacherTokens = [];
let teacherResults = [];

let csvStudentData = [];


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    initializeTeacherDashboard();

});


async function initializeTeacherDashboard() {

    try {

        setupMenu();

        updateTodayDate();

        /*
         * Do not block the dashboard rendering.
         * Counter loading runs asynchronously.
         */
        refreshDashboardCounters();

    }

    catch (err) {

        console.error(
            "Teacher Dashboard Init Error:",
            err
        );

    }

}


/* =========================================================
   MENU
========================================================= */

function setupMenu() {

    const menuLinks =
        document.querySelectorAll(
            ".menu a[data-page]"
        );


    menuLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            async function (event) {

                event.preventDefault();


                const page =
                    this.getAttribute(
                        "data-page"
                    );


                if (!page) return;


                if (page === "dashboard") {

                    await loadDashboardPage();

                }

                else if (page === "question") {

                    await loadQuestionPage();

                }

                else if (page === "student") {

                    await loadStudentPage();

                }

                else if (page === "token") {

                    await loadTokenPage();

                }

                else if (page === "result") {

                    await loadResultPage();

                }

            }
        );

    });

}


/* =========================================================
   DATE
========================================================= */

function updateTodayDate() {

    const el =
        document.getElementById(
            "todayDate"
        );


    if (!el) return;


    const today =
        new Date();


    const options = {

        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"

    };


    el.textContent =
        today.toLocaleDateString(
            "en-US",
            options
        );

}


/* =========================================================
   CONTENT
========================================================= */

function getContentElement() {

    return document.getElementById(
        "content"
    );

}


/* =========================================================
   DASHBOARD
========================================================= */

async function loadDashboardPage() {

    const content =
        getContentElement();


    if (!content) return;


    content.innerHTML = `

        <h2>
            Dashboard Ready
        </h2>

        <br>

        <p>
            Welcome to the SAF Speaking Online Test
            Teacher Dashboard.
        </p>

        <br>

        <p>
            Manage speaking questions, students,
            exam tokens, and speaking results.
        </p>

        <br>

        <hr>

        <br>

        <h3>
            Quick Actions
        </h3>

        <br>

        <div style="
            display:flex;
            flex-wrap:wrap;
            gap:12px;
        ">

            <button
                class="btn teacher"
                onclick="loadQuestionPage()">

                🎤 Add Speaking Question

            </button>

            <button
                class="btn teacher"
                onclick="loadStudentPage()">

                👨‍🎓 Manage Students

            </button>

            <button
                class="btn teacher"
                onclick="loadTokenPage()">

                🔑 Exam Token

            </button>

            <button
                class="btn teacher"
                onclick="loadResultPage()">

                📊 Speaking Results

            </button>

        </div>

    `;


    /*
     * Refresh counters in background.
     */
    refreshDashboardCounters();

}


/* =========================================================
   DASHBOARD COUNTERS
========================================================= */

async function refreshDashboardCounters() {

    /*
     * Each request is handled independently.
     * One failed API will not prevent other counters.
     */

    try {

        const response =
            await apiGetQuestion();


        if (
            response &&
            response.success
        ) {

            teacherQuestions =
                response.data || [];


            const el =
                document.getElementById(
                    "totalQuestion"
                );


            if (el) {

                el.textContent =
                    teacherQuestions.length;

            }

        }

    }

    catch (err) {

        console.error(
            "Question Counter Error:",
            err
        );

    }


    try {

        const response =
            await apiGetStudent();


        if (
            response &&
            response.success
        ) {

            teacherStudents =
                response.data || [];


            const el =
                document.getElementById(
                    "totalStudent"
                );


            if (el) {

                el.textContent =
                    teacherStudents.length;

            }

        }

    }

    catch (err) {

        console.error(
            "Student Counter Error:",
            err
        );

    }


    try {

        const response =
            await apiGetToken();


        if (
            response &&
            response.success
        ) {

            teacherTokens =
                response.data || [];


            const el =
                document.getElementById(
                    "totalToken"
                );


            if (el) {

                el.textContent =
                    teacherTokens.length;

            }

        }

    }

    catch (err) {

        console.error(
            "Token Counter Error:",
            err
        );

    }


    try {

        const response =
            await apiGetResult();


        if (
            response &&
            response.success
        ) {

            teacherResults =
                response.data || [];


            const el =
                document.getElementById(
                    "totalResult"
                );


            if (el) {

                el.textContent =
                    teacherResults.length;

            }

        }

    }

    catch (err) {

        console.error(
            "Result Counter Error:",
            err
        );

    }

}


/* =========================================================
   QUESTION DATA CACHE
========================================================= */

/**
 * Make sure Questions are available.
 *
 * Important:
 * Token page uses this function so the Question ID
 * dropdown will work even when Teacher opens Token page
 * directly without opening Question page first.
 */

async function ensureTeacherQuestionsLoaded() {

    /*
     * If cache already contains questions,
     * use the existing data.
     */
    if (
        Array.isArray(teacherQuestions) &&
        teacherQuestions.length > 0
    ) {

        return teacherQuestions;

    }


    try {

        const response =
            await apiGetQuestion();


        if (
            response &&
            response.success
        ) {

            teacherQuestions =
                response.data || [];


            return teacherQuestions;

        }


        console.error(
            "Question Load Error:",
            response?.message ||
            "Unknown error."
        );


        teacherQuestions = [];


        return [];

    }

    catch (err) {

        console.error(
            "Question Load Exception:",
            err
        );


        teacherQuestions = [];


        return [];

    }

}


/* =========================================================
   QUESTION PAGE
========================================================= */

async function loadQuestionPage() {

    const content =
        getContentElement();


    if (!content) return;


    content.innerHTML = `

        <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            flex-wrap:wrap;
            gap:15px;
        ">

            <div>

                <h2>
                    🎤 Speaking Questions
                </h2>

                <p style="
                    margin-top:8px;
                    color:#666;
                ">

                    Manage speaking questions.

                </p>

            </div>

            <button
                class="btn teacher"
                onclick="showQuestionForm()">

                ➕ Add Question

            </button>

        </div>

        <div
            id="questionArea"
            style="margin-top:25px;">

            Loading...

        </div>

    `;


    await renderQuestionList();

}


/* =========================================================
   QUESTION FORM
========================================================= */

function showQuestionForm(question = null) {

    const area =
        document.getElementById(
            "questionArea"
        );


    if (!area) return;


    const editing =
        question !== null;


    const title =
        question?.title ||
        question?.questionTitle ||
        "";


    const answer =
        question?.answer ||
        question?.answerKey ||
        "";


    const difficulty =
        question?.difficulty ||
        "Easy";


    const duration =
        question?.duration ??
        30;


    area.innerHTML = `

        <div class="card-box">

            <h3>

                ${
                    editing
                    ? "Edit Speaking Question"
                    : "Add Speaking Question"
                }

            </h3>

            <br>

            <label>
                Title
            </label>

            <input
                id="questionTitle"
                type="text"
                value="${escapeAttribute(title)}"
                placeholder="Contoh: Unit 1 Classmate"
                style="${inputStyle}"
            >

            <br><br>

            <label>
                Question
            </label>

            <textarea
                id="questionText"
                rows="4"
                style="${textareaStyle}"
                placeholder="Enter speaking question..."
            >${
                editing
                ? escapeHtml(
                    question.question || ""
                )
                : ""
            }</textarea>

            <br><br>

            <label>
                Answer Key
            </label>

            <textarea
                id="answerKey"
                rows="4"
                style="${textareaStyle}"
                placeholder="Enter answer key..."
            >${escapeHtml(answer)}</textarea>

            <br><br>

            <label>
                Difficulty
            </label>

            <select
                id="questionDifficulty"
                style="${inputStyle}">

                <option
                    value="Easy"
                    ${
                        difficulty === "Easy"
                        ? "selected"
                        : ""
                    }>
                    Easy
                </option>

                <option
                    value="Medium"
                    ${
                        difficulty === "Medium"
                        ? "selected"
                        : ""
                    }>
                    Medium
                </option>

                <option
                    value="Hard"
                    ${
                        difficulty === "Hard"
                        ? "selected"
                        : ""
                    }>
                    Hard
                </option>

            </select>

            <br><br>

            <label>
                Duration (seconds)
            </label>

            <input
                id="questionDuration"
                type="number"
                min="1"
                value="${escapeAttribute(duration)}"
                placeholder="30"
                style="${inputStyle}"
            >

            <br><br>

            <div style="
                display:flex;
                gap:10px;
                flex-wrap:wrap;
            ">

                <button
                    class="btn teacher"
                    onclick="${
                        editing
                        ? `submitQuestionUpdate('${escapeAttribute(question.id)}')`
                        : "submitQuestionInsert()"
                    }">

                    💾 Save

                </button>

                <button
                    class="btn"
                    onclick="renderQuestionList()">

                    Cancel

                </button>

            </div>

            <div
                id="questionMessage"
                style="margin-top:15px;">
            </div>

        </div>

    `;

}


/* =========================================================
   QUESTION FORM DATA
========================================================= */

function getQuestionFormData() {

    return {

        title:
            document
                .getElementById(
                    "questionTitle"
                )
                ?.value
                .trim() || "",

        question:
            document
                .getElementById(
                    "questionText"
                )
                ?.value
                .trim() || "",

        answerKey:
            document
                .getElementById(
                    "answerKey"
                )
                ?.value
                .trim() || "",

        answer:
            document
                .getElementById(
                    "answerKey"
                )
                ?.value
                .trim() || "",

        difficulty:
            document
                .getElementById(
                    "questionDifficulty"
                )
                ?.value ||
                "Easy",

        duration:
            Number(
                document
                    .getElementById(
                        "questionDuration"
                    )
                    ?.value || 30
            )

    };

}


/* =========================================================
   INSERT QUESTION
========================================================= */

async function submitQuestionInsert() {

    const data =
        getQuestionFormData();


    if (!data.title) {

        showMessage(
            "questionMessage",
            "Title wajib diisi.",
            "error"
        );

        return;

    }


    if (!data.question) {

        showMessage(
            "questionMessage",
            "Question wajib diisi.",
            "error"
        );

        return;

    }


    if (!data.answerKey) {

        showMessage(
            "questionMessage",
            "Answer Key wajib diisi.",
            "error"
        );

        return;

    }


    const result =
        await apiInsertQuestion(
            data
        );


    if (
        result &&
        result.success
    ) {

        alert(
            result.message ||
            "Question berhasil ditambahkan."
        );


        await renderQuestionList();

        refreshDashboardCounters();

    }

    else {

        showMessage(
            "questionMessage",
            result?.message ||
            "Gagal menambahkan question.",
            "error"
        );

    }

}


/* =========================================================
   UPDATE QUESTION
========================================================= */

async function submitQuestionUpdate(id) {

    const data =
        getQuestionFormData();


    if (!data.title) {

        showMessage(
            "questionMessage",
            "Title wajib diisi.",
            "error"
        );

        return;

    }


    if (!data.question) {

        showMessage(
            "questionMessage",
            "Question wajib diisi.",
            "error"
        );

        return;

    }


    if (!data.answerKey) {

        showMessage(
            "questionMessage",
            "Answer Key wajib diisi.",
            "error"
        );

        return;

    }


    data.id =
        id;


    const result =
        await apiUpdateQuestion(
            data
        );


    if (
        result &&
        result.success
    ) {

        alert(
            result.message ||
            "Question berhasil diupdate."
        );


        await renderQuestionList();

        refreshDashboardCounters();

    }

    else {

        showMessage(
            "questionMessage",
            result?.message ||
            "Gagal update question.",
            "error"
        );

    }

}


/* =========================================================
   QUESTION LIST
========================================================= */

async function renderQuestionList() {

    const area =
        document.getElementById(
            "questionArea"
        );


    if (!area) return;


    area.innerHTML =
        "Loading questions...";


    const response =
        await apiGetQuestion();


    if (
        !response ||
        !response.success
    ) {

        area.innerHTML = `

            <div style="color:#b00020;">

                Gagal mengambil questions.

                <br>

                ${escapeHtml(
                    response?.message ||
                    "Unknown error."
                )}

            </div>

        `;


        return;

    }


    teacherQuestions =
        response.data || [];


    if (
        teacherQuestions.length === 0
    ) {

        area.innerHTML = `

            <div class="card-box">

                <h3>
                    No Questions
                </h3>

                <br>

                <p>
                    Belum ada speaking question.
                </p>

            </div>

        `;


        return;

    }


    let html = `

        <div style="
            overflow-x:auto;
        ">

            <table style="
                width:100%;
                border-collapse:collapse;
                min-width:900px;
            ">

                <thead>

                    <tr>

                        <th style="${tableHeadStyle}">
                            #
                        </th>

                        <th style="${tableHeadStyle}">
                            ID
                        </th>

                        <th style="${tableHeadStyle}">
                            Title
                        </th>

                        <th style="${tableHeadStyle}">
                            Answer
                        </th>

                        <th style="${tableHeadStyle}">
                            Difficulty
                        </th>

                        <th style="${tableHeadStyle}">
                            Duration
                        </th>

                        <th style="${tableHeadStyle}">
                            Action
                        </th>

                    </tr>

                </thead>

                <tbody>

    `;


    teacherQuestions.forEach(
        function (item, index) {

            const questionId =
                item.id ||
                item.questionId ||
                item.questionID ||
                "";


            const title =
                item.title ||
                item.questionTitle ||
                "";


            const answer =
                item.answer ||
                item.answerKey ||
                "";


            const difficulty =
                item.difficulty ||
                "";


            const duration =
                item.duration ??
                "";


            html += `

                <tr>

                    <td style="${tableCellStyle}">
                        ${index + 1}
                    </td>

                    <td style="${tableCellStyle}">
                        ${escapeHtml(
                            questionId
                        )}
                    </td>

                    <td style="${tableCellStyle}">
                        ${escapeHtml(title)}
                    </td>

                    <td style="${tableCellStyle}">
                        ${escapeHtml(answer)}
                    </td>

                    <td style="${tableCellStyle}">
                        ${escapeHtml(difficulty)}
                    </td>

                    <td style="${tableCellStyle}">
                        ${escapeHtml(
                            duration === ""
                            ? ""
                            : String(duration) + " sec"
                        )}
                    </td>

                    <td style="${tableCellStyle}">

                        <button
                            class="btn teacher"
                            onclick="editQuestion(${index})">

                            Edit

                        </button>

                        <button
                            class="btn"
                            onclick="deleteQuestionByIndex(${index})">

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


    area.innerHTML =
        html;

}


/* =========================================================
   EDIT QUESTION
========================================================= */

function editQuestion(index) {

    const question =
        teacherQuestions[index];


    if (!question) return;


    showQuestionForm(
        question
    );

}


/* =========================================================
   DELETE QUESTION
========================================================= */

async function deleteQuestionByIndex(index) {

    const question =
        teacherQuestions[index];


    if (!question) return;


    const confirmed =
        confirm(
            "Hapus speaking question ini?"
        );


    if (!confirmed) return;


    const questionId =
        question.id ||
        question.questionId ||
        question.questionID ||
        "";


    const result =
        await apiDeleteQuestion({

            id:
                questionId

        });


    if (
        result &&
        result.success
    ) {

        alert(
            result.message ||
            "Question berhasil dihapus."
        );


        await renderQuestionList();

        refreshDashboardCounters();

    }

    else {

        alert(
            result?.message ||
            "Gagal menghapus question."
        );

    }

}


/* =========================================================
   STUDENT PAGE
========================================================= */

async function loadStudentPage() {

    const content =
        getContentElement();


    if (!content) return;


    content.innerHTML = `

        <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            flex-wrap:wrap;
            gap:15px;
        ">

            <div>

                <h2>
                    👨‍🎓 Student Management
                </h2>

                <p style="
                    margin-top:8px;
                    color:#666;
                ">

                    Manage student accounts
                    for the speaking test.

                </p>

            </div>

            <div style="
                display:flex;
                gap:10px;
                flex-wrap:wrap;
            ">

                <button
                    class="btn teacher"
                    onclick="showStudentForm()">

                    ➕ Add Student

                </button>

                <button
                    class="btn teacher"
                    onclick="showCSVImport()">

                    📥 Import CSV

                </button>

            </div>

        </div>

        <div
            id="studentArea"
            style="margin-top:25px;">

            Loading...

        </div>

    `;


    await renderStudentList();

}


/* =========================================================
   STUDENT FORM
========================================================= */

function showStudentForm(student = null) {

    const area =
        document.getElementById(
            "studentArea"
        );


    if (!area) return;


    const editing =
        student !== null;


    area.innerHTML = `

        <div class="card-box">

            <h3>
                ${
                    editing
                    ? "Edit Student"
                    : "Add Student"
                }
            </h3>

            <br>

            <label>
                NIS
            </label>

            <input
                id="studentNis"
                type="text"
                value="${
                    editing
                    ? escapeAttribute(student.nis || "")
                    : ""
                }"
                ${
                    editing
                    ? "readonly"
                    : ""
                }
                placeholder="NIS"
                style="${inputStyle}"
            >

            <br><br>

            <label>
                Nama
            </label>

            <input
                id="studentNama"
                type="text"
                value="${
                    editing
                    ? escapeAttribute(student.nama || "")
                    : ""
                }"
                placeholder="Nama siswa"
                style="${inputStyle}"
            >

            <br><br>

            <label>
                Kelas
            </label>

            <input
                id="studentKelas"
                type="text"
                value="${
                    editing
                    ? escapeAttribute(student.kelas || "")
                    : ""
                }"
                placeholder="Contoh: 7A"
                style="${inputStyle}"
            >

            <br><br>

            <label>
                Username
            </label>

            <input
                id="studentUsername"
                type="text"
                value="${
                    editing
                    ? escapeAttribute(student.username || "")
                    : ""
                }"
                placeholder="Username"
                style="${inputStyle}"
            >

            <br><br>

            <label>
                Password
            </label>

            <input
                id="studentPassword"
                type="text"
                value="${
                    editing
                    ? escapeAttribute(student.password || "")
                    : ""
                }"
                placeholder="Password"
                style="${inputStyle}"
            >

            <br><br>

            <label>
                Status
            </label>

            <select
                id="studentStatus"
                style="${inputStyle}">

                <option
                    value="ACTIVE"
                    ${
                        !editing ||
                        student.status === "ACTIVE"
                        ? "selected"
                        : ""
                    }>
                    ACTIVE
                </option>

                <option
                    value="INACTIVE"
                    ${
                        editing &&
                        student.status === "INACTIVE"
                        ? "selected"
                        : ""
                    }>
                    INACTIVE
                </option>

            </select>

            <br><br>

            <div style="
                display:flex;
                gap:10px;
                flex-wrap:wrap;
            ">

                <button
                    class="btn teacher"
                    onclick="${
                        editing
                        ? `submitStudentUpdate('${escapeAttribute(student.nis)}')`
                        : "submitStudentInsert()"
                    }">

                    💾 Save

                </button>

                <button
                    class="btn"
                    onclick="renderStudentList()">

                    Cancel

                </button>

            </div>

            <div
                id="studentMessage"
                style="margin-top:15px;">
            </div>

        </div>

    `;

}


/* =========================================================
   STUDENT FORM DATA
========================================================= */

function getStudentFormData() {

    return {

        nis:
            document
                .getElementById(
                    "studentNis"
                )
                ?.value
                .trim() || "",

        nama:
            document
                .getElementById(
                    "studentNama"
                )
                ?.value
                .trim() || "",

        kelas:
            document
                .getElementById(
                    "studentKelas"
                )
                ?.value
                .trim() || "",

        username:
            document
                .getElementById(
                    "studentUsername"
                )
                ?.value
                .trim() || "",

        password:
            document
                .getElementById(
                    "studentPassword"
                )
                ?.value
                .trim() || "",

        status:
            document
                .getElementById(
                    "studentStatus"
                )
                ?.value ||
                "ACTIVE"

    };

}


/* =========================================================
   INSERT STUDENT
========================================================= */

async function submitStudentInsert() {

    const data =
        getStudentFormData();


    if (!data.nis) {

        showMessage(
            "studentMessage",
            "NIS wajib diisi.",
            "error"
        );

        return;

    }


    if (!data.nama) {

        showMessage(
            "studentMessage",
            "Nama wajib diisi.",
            "error"
        );

        return;

    }


    const result =
        await apiInsertStudent(
            data
        );


    if (
        result &&
        result.success
    ) {

        alert(
            result.message ||
            "Student berhasil ditambahkan."
        );


        await renderStudentList();

        refreshDashboardCounters();

    }

    else {

        showMessage(
            "studentMessage",
            result?.message ||
            "Gagal menambahkan student.",
            "error"
        );

    }

}


/* =========================================================
   UPDATE STUDENT
========================================================= */

async function submitStudentUpdate(nis) {

    const data =
        getStudentFormData();


    data.nis =
        nis;


    if (!data.nama) {

        showMessage(
            "studentMessage",
            "Nama wajib diisi.",
            "error"
        );

        return;

    }


    const result =
        await apiUpdateStudent(
            data
        );


    if (
        result &&
        result.success
    ) {

        alert(
            result.message ||
            "Student berhasil diupdate."
        );


        await renderStudentList();

        refreshDashboardCounters();

    }

    else {

        showMessage(
            "studentMessage",
            result?.message ||
            "Gagal update student.",
            "error"
        );

    }

}


/* =========================================================
   STUDENT LIST
========================================================= */

async function renderStudentList() {

    const area =
        document.getElementById(
            "studentArea"
        );


    if (!area) return;


    area.innerHTML =
        "Loading students...";


    const response =
        await apiGetStudent();


    if (
        !response ||
        !response.success
    ) {

        area.innerHTML = `

            <div style="color:#b00020;">

                Gagal mengambil data student.

                <br>

                ${escapeHtml(
                    response?.message ||
                    "Unknown error."
                )}

            </div>

        `;


        return;

    }


    teacherStudents =
        response.data || [];


    if (
        teacherStudents.length === 0
    ) {

        area.innerHTML = `

            <div class="card-box">

                <h3>
                    No Students
                </h3>

                <br>

                <p>
                    Belum ada student.
                </p>

                <br>

                <button
                    class="btn teacher"
                    onclick="showCSVImport()">

                    📥 Import CSV

                </button>

            </div>

        `;


        return;

    }


    let html = `

        <div style="
            margin-bottom:20px;
            display:flex;
            justify-content:space-between;
            align-items:center;
            flex-wrap:wrap;
            gap:10px;
        ">

            <strong>
                Total Students:
                ${teacherStudents.length}
            </strong>

            <button
                class="btn teacher"
                onclick="showCSVImport()">

                📥 Import CSV

            </button>

        </div>

        <div style="overflow-x:auto;">

            <table style="
                width:100%;
                border-collapse:collapse;
                min-width:850px;
            ">

                <thead>

                    <tr>

                        <th style="${tableHeadStyle}">
                            #
                        </th>

                        <th style="${tableHeadStyle}">
                            NIS
                        </th>

                        <th style="${tableHeadStyle}">
                            Nama
                        </th>

                        <th style="${tableHeadStyle}">
                            Kelas
                        </th>

                        <th style="${tableHeadStyle}">
                            Username
                        </th>

                        <th style="${tableHeadStyle}">
                            Status
                        </th>

                        <th style="${tableHeadStyle}">
                            Action
                        </th>

                    </tr>

                </thead>

                <tbody>

    `;


    teacherStudents.forEach(
        function (student, index) {

            const status =
                String(
                    student.status ||
                    "ACTIVE"
                ).toUpperCase();


            html += `

                <tr>

                    <td style="${tableCellStyle}">
                        ${index + 1}
                    </td>

                    <td style="${tableCellStyle}">
                        ${escapeHtml(
                            String(
                                student.nis || ""
                            )
                        )}
                    </td>

                    <td style="${tableCellStyle}">
                        ${escapeHtml(
                            student.nama || ""
                        )}
                    </td>

                    <td style="${tableCellStyle}">
                        ${escapeHtml(
                            student.kelas || ""
                        )}
                    </td>

                    <td style="${tableCellStyle}">
                        ${escapeHtml(
                            student.username || ""
                        )}
                    </td>

                    <td style="${tableCellStyle}">
                        ${escapeHtml(status)}
                    </td>

                    <td style="${tableCellStyle}">

                        <button
                            class="btn teacher"
                            onclick="editStudent(${index})">

                            Edit

                        </button>

                        <button
                            class="btn"
                            onclick="deleteStudentByIndex(${index})">

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


    area.innerHTML =
        html;

}


/* =========================================================
   EDIT STUDENT
========================================================= */

function editStudent(index) {

    const student =
        teacherStudents[index];


    if (!student) return;


    showStudentForm(
        student
    );

}


/* =========================================================
   DELETE STUDENT
========================================================= */

async function deleteStudentByIndex(index) {

    const student =
        teacherStudents[index];


    if (!student) return;


    const nis =
        String(
            student.nis || ""
        );


    if (
        !confirm(
            "Hapus student dengan NIS " +
            nis +
            "?"
        )
    ) return;


    const result =
        await apiDeleteStudent({

            nis:
                nis

        });


    if (
        result &&
        result.success
    ) {

        alert(
            result.message ||
            "Student berhasil dihapus."
        );


        await renderStudentList();

        refreshDashboardCounters();

    }

    else {

        alert(
            result?.message ||
            "Gagal menghapus student."
        );

    }

}


/* =========================================================
   CSV IMPORT UI
========================================================= */

function showCSVImport() {

    const area =
        document.getElementById(
            "studentArea"
        );


    if (!area) return;


    csvStudentData = [];


    area.innerHTML = `

        <div class="card-box">

            <h2>
                📥 Import Students from CSV
            </h2>

            <br>

            <p>
                Gunakan file CSV dengan format:
            </p>

            <br>

            <div style="
                background:#f5f7fa;
                padding:15px;
                border-radius:10px;
                overflow-x:auto;
            ">

                <code>
                    nis,nama,kelas,username,password,status
                </code>

                <br>

                <code>
                    7001,Ahmad Fauzan,7A,ahmad,123456,ACTIVE
                </code>

            </div>

            <br>

            <input
                id="studentCSVFile"
                type="file"
                accept=".csv,text/csv"
                style="${inputStyle}"
            >

            <br><br>

            <div style="
                display:flex;
                gap:10px;
                flex-wrap:wrap;
            ">

                <button
                    class="btn teacher"
                    onclick="previewStudentCSV()">

                    🔍 Preview CSV

                </button>

                <button
                    class="btn"
                    onclick="renderStudentList()">

                    Cancel

                </button>

            </div>

            <div
                id="csvPreview"
                style="margin-top:25px;">
            </div>

        </div>

    `;

}


/* =========================================================
   CSV PREVIEW
========================================================= */

function previewStudentCSV() {

    const input =
        document.getElementById(
            "studentCSVFile"
        );


    if (
        !input ||
        !input.files ||
        !input.files[0]
    ) {

        alert(
            "Silakan pilih file CSV terlebih dahulu."
        );

        return;

    }


    const file =
        input.files[0];


    const reader =
        new FileReader();


    reader.onload =
        function (event) {

            try {

                const result =
                    parseStudentCSV(
                        event.target.result
                    );


                if (!result.success) {

                    showCSVError(
                        result.message
                    );

                    return;

                }


                csvStudentData =
                    result.data;


                renderCSVPreview();

            }

            catch (err) {

                console.error(
                    "CSV Parse Error:",
                    err
                );


                showCSVError(
                    "CSV tidak dapat dibaca."
                );

            }

        };


    reader.onerror =
        function () {

            showCSVError(
                "Gagal membaca file CSV."
            );

        };


    reader.readAsText(
        file,
        "UTF-8"
    );

}


/* =========================================================
   CSV PARSER
========================================================= */

function parseStudentCSV(text) {

    if (!text) {

        return {

            success: false,

            message:
                "File CSV kosong."

        };

    }


    text =
        text.replace(
            /^\uFEFF/,
            ""
        );


    const rows =
        parseCSVRows(
            text
        );


    if (
        !rows ||
        rows.length < 2
    ) {

        return {

            success: false,

            message:
                "CSV tidak memiliki data student."

        };

    }


    const headers =
        rows[0].map(
            function (header) {

                return String(
                    header || ""
                )
                .trim()
                .toLowerCase();

            }
        );


    const requiredHeaders = [

        "nis",
        "nama",
        "kelas",
        "username",
        "password",
        "status"

    ];


    const missingHeaders =
        requiredHeaders.filter(
            function (header) {

                return !headers.includes(
                    header
                );

            }
        );


    if (
        missingHeaders.length
    ) {

        return {

            success: false,

            message:
                "Header CSV tidak lengkap: " +
                missingHeaders.join(", ")

        };

    }


    const data = [];


    for (
        let i = 1;
        i < rows.length;
        i++
    ) {

        const row =
            rows[i];


        if (
            row.every(
                function (cell) {

                    return String(
                        cell || ""
                    ).trim() === "";

                }
            )
        ) continue;


        const item = {

            nis:
                getCSVValue(
                    row,
                    headers,
                    "nis"
                ),

            nama:
                getCSVValue(
                    row,
                    headers,
                    "nama"
                ),

            kelas:
                getCSVValue(
                    row,
                    headers,
                    "kelas"
                ),

            username:
                getCSVValue(
                    row,
                    headers,
                    "username"
                ),

            password:
                getCSVValue(
                    row,
                    headers,
                    "password"
                ),

            status:
                getCSVValue(
                    row,
                    headers,
                    "status"
                ) ||
                "ACTIVE"

        };


        if (
            !item.nis ||
            !item.nama
        ) continue;


        data.push(
            item
        );

    }


    if (!data.length) {

        return {

            success: false,

            message:
                "Tidak ada student valid."

        };

    }


    return {

        success: true,

        data: data

    };

}


/* =========================================================
   CSV ROW PARSER
========================================================= */

function parseCSVRows(text) {

    const rows = [];

    let row = [];

    let cell = "";

    let insideQuotes = false;


    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        const char =
            text[i];


        const nextChar =
            text[i + 1];


        if (
            char === '"'
        ) {

            if (
                insideQuotes &&
                nextChar === '"'
            ) {

                cell += '"';

                i++;

            }

            else {

                insideQuotes =
                    !insideQuotes;

            }

            continue;

        }


        if (
            char === "," &&
            !insideQuotes
        ) {

            row.push(cell);

            cell = "";

            continue;

        }


        if (
            (
                char === "\n" ||
                char === "\r"
            ) &&
            !insideQuotes
        ) {

            if (
                char === "\r" &&
                nextChar === "\n"
            ) {

                i++;

            }


            row.push(cell);

            rows.push(row);

            row = [];

            cell = "";

            continue;

        }


        cell += char;

    }


    if (
        cell !== "" ||
        row.length > 0
    ) {

        row.push(cell);

        rows.push(row);

    }


    return rows;

}


/* =========================================================
   GET CSV VALUE
========================================================= */

function getCSVValue(
    row,
    headers,
    field
) {

    const index =
        headers.indexOf(
            field
        );


    if (index < 0) return "";


    return String(
        row[index] || ""
    ).trim();

}


/* =========================================================
   CSV PREVIEW
========================================================= */

function renderCSVPreview() {

    const preview =
        document.getElementById(
            "csvPreview"
        );


    if (!preview) return;


    let html = `

        <h3>
            Preview
        </h3>

        <br>

        <p>
            ${csvStudentData.length}
            student siap diimport.
        </p>

        <br>

        <button
            class="btn teacher"
            id="startCSVImportButton"
            onclick="startStudentCSVImport()">

            🚀 Import
            ${csvStudentData.length}
            Students

        </button>

        <div
            id="csvImportProgress"
            style="margin-top:20px;">
        </div>

    `;


    preview.innerHTML =
        html;

}


/* =========================================================
   START CSV IMPORT
========================================================= */

async function startStudentCSVImport() {

    if (
        !csvStudentData.length
    ) {

        alert(
            "Tidak ada data CSV."
        );

        return;

    }


    if (
        !confirm(
            "Import " +
            csvStudentData.length +
            " student sekarang?"
        )
    ) return;


    const button =
        document.getElementById(
            "startCSVImportButton"
        );


    if (button) {

        button.disabled = true;

        button.textContent =
            "⏳ Importing...";

    }


    let successCount = 0;

    let failedCount = 0;


    for (
        let i = 0;
        i < csvStudentData.length;
        i++
    ) {

        const result =
            await apiInsertStudent(
                csvStudentData[i]
            );


        if (
            result &&
            result.success
        ) {

            successCount++;

        }

        else {

            failedCount++;

        }

    }


    alert(
        "Import selesai.\n\n" +
        "Berhasil: " +
        successCount +
        "\n" +
        "Gagal: " +
        failedCount
    );


    csvStudentData = [];


    await renderStudentList();

    refreshDashboardCounters();

}


/* =========================================================
   TOKEN PAGE
========================================================= */

async function loadTokenPage() {

    const content =
        getContentElement();


    if (!content) return;


    /*
     * Render page immediately.
     * Question data will be loaded afterwards.
     */
    content.innerHTML = `

        <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            flex-wrap:wrap;
        ">

            <div>

                <h2>
                    🔑 Exam Token
                </h2>

                <p style="
                    margin-top:8px;
                    color:#666;
                ">

                    Manage examination tokens.

                </p>

            </div>

            <button
                class="btn teacher"
                onclick="showTokenForm()">

                ➕ Create Token

            </button>

        </div>

        <div
            id="tokenArea"
            style="margin-top:25px;">

            Loading...

        </div>

    `;


    /*
     * Load existing tokens.
     */
    await renderTokenList();

}


/* =========================================================
   TOKEN GENERATOR
========================================================= */

/**
 * Generate automatic exam token.
 *
 * Example:
 * SAF-2026-A8K3P7
 */

function generateExamToken() {

    const year =
        new Date()
        .getFullYear();


    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


    let randomPart = "";


    /*
     * Use crypto API when available.
     */
    if (
        window.crypto &&
        window.crypto.getRandomValues
    ) {

        const values =
            new Uint32Array(6);


        window.crypto.getRandomValues(
            values
        );


        for (
            let i = 0;
            i < values.length;
            i++
        ) {

            randomPart +=
                characters[
                    values[i] %
                    characters.length
                ];

        }

    }

    else {

        /*
         * Fallback for older browsers.
         */
        for (
            let i = 0;
            i < 6;
            i++
        ) {

            randomPart +=
                characters[
                    Math.floor(
                        Math.random() *
                        characters.length
                    )
                ];

        }

    }


    return (
        "SAF-" +
        year +
        "-" +
        randomPart
    );

}


/* =========================================================
   TOKEN FORM
========================================================= */

async function showTokenForm() {

    const area =
        document.getElementById(
            "tokenArea"
        );


    if (!area) return;


    /*
     * IMPORTANT:
     * Always make sure Questions are loaded.
     *
     * This fixes the problem where Question ID
     * was empty when teacher opened Token page directly.
     */
    area.innerHTML = `

        <div class="card-box">

            <h3>
                Create Exam Token
            </h3>

            <br>

            <p style="
                color:#666;
            ">

                Loading speaking questions...

            </p>

        </div>

    `;


    const questions =
        await ensureTeacherQuestionsLoaded();


    /*
     * Build Question dropdown.
     */
    let questionOptions = `

        <option value="">
            -- Select Question --
        </option>

    `;


    if (
        questions.length > 0
    ) {

        questions.forEach(
            function (question) {

                const questionId =
                    question.id ||
                    question.questionId ||
                    question.questionID ||
                    "";


                const title =
                    question.title ||
                    question.questionTitle ||
                    question.question ||
                    "Untitled Question";


                /*
                 * Skip question if it has no ID.
                 */
                if (!questionId) return;


                questionOptions += `

                    <option
                        value="${escapeAttribute(questionId)}">

                        ${escapeHtml(
                            questionId
                        )}
                        —
                        ${escapeHtml(
                            title
                        )}

                    </option>

                `;

            }
        );

    }


    /*
     * Generate token automatically.
     */
    const generatedToken =
        generateExamToken();


    area.innerHTML = `

        <div class="card-box">

            <h3>
                Create Exam Token
            </h3>

            <br>

            <label>
                Token
            </label>

            <div style="
                display:flex;
                gap:10px;
                align-items:center;
                flex-wrap:wrap;
                margin-top:8px;
            ">

                <input
                    id="tokenValue"
                    type="text"
                    value="${escapeAttribute(generatedToken)}"
                    readonly
                    style="
                        ${inputStyle}
                        margin-top:0;
                        flex:1;
                        min-width:250px;
                        background:#f5f7fa;
                        font-weight:600;
                        letter-spacing:1px;
                    "
                >

                <button
                    type="button"
                    class="btn"
                    onclick="regenerateExamToken()">

                    🔄 New Token

                </button>

            </div>

            <small style="
                display:block;
                margin-top:8px;
                color:#666;
            ">

                Token dibuat otomatis oleh sistem.

            </small>

            <br><br>

            <label>
                Question ID
            </label>

            <select
                id="tokenQuestionId"
                style="${inputStyle}">

                ${questionOptions}

            </select>

            ${
                questions.length === 0
                ? `
                    <div style="
                        margin-top:10px;
                        padding:12px;
                        border-radius:8px;
                        background:#fff3cd;
                        color:#856404;
                    ">

                        Belum ada speaking question.
                        Silakan buat Question terlebih dahulu.

                    </div>
                `
                : ""
            }

            <br><br>

            <div style="
                display:flex;
                gap:10px;
                flex-wrap:wrap;
            ">

                <button
                    class="btn teacher"
                    onclick="submitTokenCreate()"
                    ${
                        questions.length === 0
                        ? "disabled"
                        : ""
                    }>

                    💾 Create Token

                </button>

                <button
                    class="btn"
                    onclick="renderTokenList()">

                    Cancel

                </button>

            </div>

            <div
                id="tokenMessage"
                style="margin-top:15px;">
            </div>

        </div>

    `;

}


/* =========================================================
   REGENERATE TOKEN
========================================================= */

function regenerateExamToken() {

    const input =
        document.getElementById(
            "tokenValue"
        );


    if (!input) return;


    input.value =
        generateExamToken();

}


/* =========================================================
   CREATE TOKEN
========================================================= */

async function submitTokenCreate() {

    const tokenInput =
        document.getElementById(
            "tokenValue"
        );


    const questionInput =
        document.getElementById(
            "tokenQuestionId"
        );


    const token =
        tokenInput
            ?.value
            .trim() || "";


    const questionId =
        questionInput
            ?.value
            .trim() || "";


    if (!token) {

        showMessage(
            "tokenMessage",
            "Token gagal dibuat.",
            "error"
        );

        return;

    }


    if (!questionId) {

        showMessage(
            "tokenMessage",
            "Question ID wajib dipilih.",
            "error"
        );

        return;

    }


    /*
     * Preserve both field names for backend compatibility.
     */
    const result =
        await apiCreateToken({

            token:
                token,

            questionId:
                questionId,

            questionID:
                questionId

        });


    if (
        result &&
        result.success
    ) {

        alert(
            result.message ||
            "Token berhasil dibuat."
        );


        await renderTokenList();

        refreshDashboardCounters();

    }

    else {

        showMessage(
            "tokenMessage",
            result?.message ||
            "Gagal membuat token.",
            "error"
        );

    }

}


/* =========================================================
   TOKEN LIST
========================================================= */

async function renderTokenList() {

    const area =
        document.getElementById(
            "tokenArea"
        );


    if (!area) return;


    area.innerHTML =
        "Loading tokens...";


    const response =
        await apiGetToken();


    if (
        !response ||
        !response.success
    ) {

        area.innerHTML = `

            <div style="color:#b00020;">

                ${escapeHtml(
                    response?.message ||
                    "Gagal mengambil token."
                )}

            </div>

        `;


        return;

    }


    teacherTokens =
        response.data || [];


    if (
        teacherTokens.length === 0
    ) {

        area.innerHTML = `

            <div class="card-box">

                <h3>
                    No Token
                </h3>

                <br>

                <p>
                    Belum ada exam token.
                </p>

            </div>

        `;


        return;

    }


    let html = `

        <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            flex-wrap:wrap;
            gap:10px;
            margin-bottom:20px;
        ">

            <strong>
                Total Tokens:
                ${teacherTokens.length}
            </strong>

            <button
                class="btn teacher"
                onclick="showTokenForm()">

                ➕ Create Token

            </button>

        </div>

        <div style="overflow-x:auto;">

            <table style="
                width:100%;
                border-collapse:collapse;
                min-width:800px;
            ">

                <thead>

                    <tr>

                        <th style="${tableHeadStyle}">
                            #
                        </th>

                        <th style="${tableHeadStyle}">
                            Token
                        </th>

                        <th style="${tableHeadStyle}">
                            Question ID
                        </th>

                        <th style="${tableHeadStyle}">
                            Status
                        </th>

                    </tr>

                </thead>

                <tbody>

    `;


    teacherTokens.forEach(
        function (item, index) {

            const questionId =
                item.questionId ||
                item.questionID ||
                "";


            html += `

                <tr>

                    <td style="${tableCellStyle}">
                        ${index + 1}
                    </td>

                    <td style="${tableCellStyle}">
                        <strong>
                            ${escapeHtml(
                                item.token || ""
                            )}
                        </strong>
                    </td>

                    <td style="${tableCellStyle}">
                        ${escapeHtml(
                            questionId
                        )}
                    </td>

                    <td style="${tableCellStyle}">
                        ${escapeHtml(
                            item.status || ""
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


    area.innerHTML =
        html;

}


/* =========================================================
   RESULT PAGE
========================================================= */

async function loadResultPage() {

    const content =
        getContentElement();


    if (!content) return;


    content.innerHTML = `

        <div>

            <h2>
                📊 Speaking Results
            </h2>

            <p style="
                margin-top:8px;
                color:#666;
            ">

                Student speaking test results.

            </p>

        </div>

        <div
            id="resultArea"
            style="margin-top:25px;">

            Loading...

        </div>

    `;


    await renderResultList();

}


/* =========================================================
   RESULT LIST
========================================================= */

async function renderResultList() {

    const area =
        document.getElementById(
            "resultArea"
        );


    if (!area) return;


    area.innerHTML =
        "Loading results...";


    /*
     * IMPORTANT:
     * Keep the existing API route.
     * Do not replace apiGetResult().
     */
    const response =
        await apiGetResult();


    if (
        !response ||
        !response.success
    ) {

        area.innerHTML = `

            <div style="
                color:#b00020;
                padding:15px;
            ">

                ${escapeHtml(
                    response?.message ||
                    "Gagal mengambil result."
                )}

            </div>

        `;


        return;

    }


    teacherResults =
        response.data || [];


    if (
        teacherResults.length === 0
    ) {

        area.innerHTML = `

            <div class="card-box">

                <h3>
                    No Results
                </h3>

                <br>

                <p>
                    Belum ada speaking result.
                </p>

            </div>

        `;


        return;

    }


    let html = `

        <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            flex-wrap:wrap;
            gap:10px;
            margin-bottom:20px;
        ">

            <strong>
                Total Results:
                ${teacherResults.length}
            </strong>

            <div style="
                display:flex;
                gap:10px;
                flex-wrap:wrap;
            ">

                <button
                    class="btn"
                    onclick="selectAllResults()">

                    ☑ Select All

                </button>

                <button
                    class="btn"
                    onclick="clearResultSelection()">

                    ☐ Clear

                </button>

                <button
                    class="btn"
                    onclick="deleteSelectedResults()">

                    🗑 Delete Selected

                </button>

                <button
                    class="btn"
                    onclick="deleteAllResults()">

                    🗑 Delete All

                </button>

            </div>

        </div>

        <div style="
            overflow-x:auto;
        ">

            <table style="
                width:100%;
                border-collapse:collapse;
                min-width:900px;
            ">

                <thead>

                    <tr>

                        <th style="${tableHeadStyle}">

                            <input
                                type="checkbox"
                                id="selectAllResultsCheckbox"
                                onchange="toggleAllResults(this.checked)"
                            >

                        </th>

                        <th style="${tableHeadStyle}">
                            #
                        </th>

                        <th style="${tableHeadStyle}">
                            Student
                        </th>

                        <th style="${tableHeadStyle}">
                            Question
                        </th>

                        <th style="${tableHeadStyle}">
                            Score
                        </th>

                    </tr>

                </thead>

                <tbody>

    `;


    teacherResults.forEach(
        function (item, index) {

            const resultId =
                item.id ||
                item.resultId ||
                "";


            html += `

                <tr>

                    <td style="${tableCellStyle}">

                        <input
                            type="checkbox"
                            class="result-checkbox"
                            data-result-id="${escapeAttribute(resultId)}"
                            data-result-index="${index}"
                        >

                    </td>

                    <td style="${tableCellStyle}">
                        ${index + 1}
                    </td>

                    <td style="${tableCellStyle}">
                        ${escapeHtml(
                            item.nama ||
                            item.username ||
                            item.nis ||
                            item.student ||
                            ""
                        )}
                    </td>

                    <td style="${tableCellStyle}">
                        ${escapeHtml(
                            item.question ||
                            item.title ||
                            ""
                        )}
                    </td>

                    <td style="${tableCellStyle}">
                        ${escapeHtml(
                            String(
                                item.score ??
                                ""
                            )
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


    area.innerHTML =
        html;

}


/* =========================================================
   RESULT SELECT ALL
========================================================= */

function toggleAllResults(checked) {

    const checkboxes =
        document.querySelectorAll(
            ".result-checkbox"
        );


    checkboxes.forEach(
        function (checkbox) {

            checkbox.checked =
                checked;

        }
    );

}


/* =========================================================
   RESULT SELECT ALL BUTTON
========================================================= */

function selectAllResults() {

    toggleAllResults(true);


    const master =
        document.getElementById(
            "selectAllResultsCheckbox"
        );


    if (master) {

        master.checked =
            true;

    }

}


/* =========================================================
   RESULT CLEAR SELECTION
========================================================= */

function clearResultSelection() {

    toggleAllResults(false);


    const master =
        document.getElementById(
            "selectAllResultsCheckbox"
        );


    if (master) {

        master.checked =
            false;

    }

}


/* =========================================================
   GET SELECTED RESULTS
========================================================= */

function getSelectedResultIndexes() {

    const checkboxes =
        document.querySelectorAll(
            ".result-checkbox:checked"
        );


    const indexes = [];


    checkboxes.forEach(
        function (checkbox) {

            const index =
                Number(
                    checkbox.getAttribute(
                        "data-result-index"
                    )
                );


            if (
                Number.isInteger(index)
            ) {

                indexes.push(
                    index
                );

            }

        }
    );


    return indexes;

}


/* =========================================================
   DELETE SELECTED RESULTS
========================================================= */

async function deleteSelectedResults() {

    const indexes =
        getSelectedResultIndexes();


    if (
        indexes.length === 0
    ) {

        alert(
            "Pilih result yang ingin dihapus terlebih dahulu."
        );

        return;

    }


    if (
        !confirm(
            "Hapus " +
            indexes.length +
            " result terpilih?"
        )
    ) return;


    let successCount = 0;

    let failedCount = 0;


    for (
        const index of indexes
    ) {

        const item =
            teacherResults[index];


        if (!item) {

            failedCount++;

            continue;

        }


        const id =
            item.id ||
            item.resultId ||
            "";


        if (!id) {

            failedCount++;

            continue;

        }


        try {

            const result =
                await apiDeleteResult({

                    id:
                        id

                });


            if (
                result &&
                result.success
            ) {

                successCount++;

            }

            else {

                failedCount++;

            }

        }

        catch (err) {

            console.error(
                "Delete Result Error:",
                err
            );


            failedCount++;

        }

    }


    alert(
        "Delete selesai.\n\n" +
        "Berhasil: " +
        successCount +
        "\n" +
        "Gagal: " +
        failedCount
    );


    await renderResultList();

    refreshDashboardCounters();

}


/* =========================================================
   DELETE ALL RESULTS
========================================================= */

async function deleteAllResults() {

    if (
        teacherResults.length === 0
    ) {

        alert(
            "Tidak ada result untuk dihapus."
        );

        return;

    }


    if (
        !confirm(
            "PERINGATAN!\n\n" +
            "Semua " +
            teacherResults.length +
            " speaking result akan dihapus.\n\n" +
            "Lanjutkan?"
        )
    ) return;


    let successCount = 0;

    let failedCount = 0;


    /*
     * Use the same established delete-result API
     * one result at a time.
     */
    for (
        const item of teacherResults
    ) {

        const id =
            item.id ||
            item.resultId ||
            "";


        if (!id) {

            failedCount++;

            continue;

        }


        try {

            const result =
                await apiDeleteResult({

                    id:
                        id

                });


            if (
                result &&
                result.success
            ) {

                successCount++;

            }

            else {

                failedCount++;

            }

        }

        catch (err) {

            console.error(
                "Delete All Result Error:",
                err
            );


            failedCount++;

        }

    }


    alert(
        "Hapus semua selesai.\n\n" +
        "Berhasil: " +
        successCount +
        "\n" +
        "Gagal: " +
        failedCount
    );


    await renderResultList();

    refreshDashboardCounters();

}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    elementId,
    message,
    type
) {

    const el =
        document.getElementById(
            elementId
        );


    if (!el) return;


    let background =
        "#f5f7fa";


    let color =
        "#333";


    if (
        type === "success"
    ) {

        background =
            "#e8f5e9";


        color =
            "#2e7d32";

    }


    if (
        type === "error"
    ) {

        background =
            "#ffebee";


        color =
            "#c62828";

    }


    el.innerHTML = `

        <div style="
            padding:12px;
            border-radius:8px;
            background:${background};
            color:${color};
        ">

            ${escapeHtml(message)}

        </div>

    `;

}


/* =========================================================
   CSV ERROR
========================================================= */

function showCSVError(message) {

    const preview =
        document.getElementById(
            "csvPreview"
        );


    if (!preview) return;


    preview.innerHTML = `

        <div style="
            padding:12px;
            border-radius:8px;
            background:#ffebee;
            color:#c62828;
        ">

            ${escapeHtml(
                message ||
                "CSV tidak valid."
            )}

        </div>

    `;

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    return String(
        value ?? ""
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
   ESCAPE ATTRIBUTE
========================================================= */

function escapeAttribute(value) {

    return escapeHtml(
        value
    );

}


/* =========================================================
   UI STYLES
========================================================= */

const inputStyle = `
    width:100%;
    padding:12px;
    border:1px solid #ddd;
    border-radius:8px;
    font-size:15px;
    margin-top:8px;
`;


const textareaStyle = `
    width:100%;
    padding:12px;
    border:1px solid #ddd;
    border-radius:8px;
    font-size:15px;
    margin-top:8px;
    resize:vertical;
`;


const tableHeadStyle = `
    text-align:left;
    padding:12px;
    border-bottom:2px solid #ddd;
    background:#f5f7fa;
`;


const tableCellStyle = `
    padding:12px;
    border-bottom:1px solid #eee;
    vertical-align:top;
`;


/* =========================================================
   END OF TEACHER.JS
========================================================= */