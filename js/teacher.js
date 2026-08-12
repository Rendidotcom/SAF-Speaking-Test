/**
 * =========================================================
 * SAF Speaking Online Test
 * Teacher Dashboard Controller
 *
 * Stable Foundation v4.3
 *
 * MODULE:
 * - Dashboard
 * - Question Management
 * - Student Management
 * - CSV Student Import
 * - Token Management
 * - Result Management
 *
 * Backend:
 * api.js
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

        await refreshDashboardCounters();

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
CONTENT HELPER
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

        <h2>Dashboard Ready</h2>

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

        <h3>Quick Actions</h3>

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


    await refreshDashboardCounters();

}


/* =========================================================
DASHBOARD COUNTERS
========================================================= */

async function refreshDashboardCounters() {

    try {

        const [
            questionResponse,
            studentResponse,
            tokenResponse,
            resultResponse
        ] = await Promise.all([

            apiGetQuestion(),

            apiGetStudent(),

            apiGetToken(),

            apiGetResult()

        ]);


        if (
            questionResponse &&
            questionResponse.success
        ) {

            const data =
                questionResponse.data || [];

            const el =
                document.getElementById(
                    "totalQuestion"
                );

            if (el) {

                el.textContent =
                    data.length;

            }

        }


        if (
            studentResponse &&
            studentResponse.success
        ) {

            const data =
                studentResponse.data || [];

            const el =
                document.getElementById(
                    "totalStudent"
                );

            if (el) {

                el.textContent =
                    data.length;

            }

        }


        if (
            tokenResponse &&
            tokenResponse.success
        ) {

            const data =
                tokenResponse.data || [];

            const el =
                document.getElementById(
                    "totalToken"
                );

            if (el) {

                el.textContent =
                    data.length;

            }

        }


        if (
            resultResponse &&
            resultResponse.success
        ) {

            const data =
                resultResponse.data || [];

            const el =
                document.getElementById(
                    "totalResult"
                );

            if (el) {

                el.textContent =
                    data.length;

            }

        }

    }

    catch (err) {

        console.error(
            "Counter Error:",
            err
        );

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


    /*
     * Support both new schema:
     * title / answer
     *
     * and old data:
     * question / answerKey
     */

    const titleValue =
        editing
            ? (
                question.title ||
                question.question ||
                ""
            )
            : "";


    const answerValue =
        editing
            ? (
                question.answer ||
                question.answerKey ||
                ""
            )
            : "";


    area.innerHTML = `

        <div class="card-box">

            <h3>
                ${editing
                    ? "Edit Speaking Question"
                    : "Add Speaking Question"}
            </h3>

            <br>

            <label>
                Title
            </label>

            <input
                id="questionTitle"
                type="text"
                value="${escapeAttribute(
                    titleValue
                )}"
                placeholder="Enter question title..."
                style="${inputStyle}"
            >

            <br><br>

            <label>
                Question
            </label>

            <textarea
                id="questionText"
                rows="5"
                style="
                    width:100%;
                    padding:12px;
                    margin-top:8px;
                    border:1px solid #ddd;
                    border-radius:8px;
                    resize:vertical;
                "
                placeholder="Enter speaking question..."
            >${editing
                ? escapeHtml(
                    question.question || ""
                )
                : ""}</textarea>

            <br><br>

            <label>
                Answer
            </label>

            <textarea
                id="answerKey"
                rows="5"
                style="
                    width:100%;
                    padding:12px;
                    margin-top:8px;
                    border:1px solid #ddd;
                    border-radius:8px;
                    resize:vertical;
                "
                placeholder="Enter answer key..."
            >${escapeHtml(
                answerValue
            )}</textarea>

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
GET QUESTION FORM DATA
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

        answer:
            document
                .getElementById(
                    "answerKey"
                )
                ?.value
                .trim() || ""

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


    const result =
        await apiInsertQuestion({

            title:
                data.title,

            question:
                data.question,

            answer:
                data.answer,

            /*
             * Compatibility with previous
             * teacher.js / API naming.
             */

            answerKey:
                data.answer

        });


    if (
        result &&
        result.success
    ) {

        showMessage(
            "questionMessage",
            result.message ||
            "Question berhasil ditambahkan.",
            "success"
        );


        await renderQuestionList();

        await refreshDashboardCounters();

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


    const result =
        await apiUpdateQuestion({

            id:
                id,

            title:
                data.title,

            question:
                data.question,

            answer:
                data.answer,

            /*
             * Compatibility with previous
             * teacher.js / API naming.
             */

            answerKey:
                data.answer

        });


    if (
        result &&
        result.success
    ) {

        alert(
            result.message ||
            "Question berhasil diupdate."
        );


        await renderQuestionList();

        await refreshDashboardCounters();

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
                            Title
                        </th>

                        <th style="${tableHeadStyle}">
                            Question
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

            /*
             * New schema:
             * title / answer
             *
             * Legacy fallback:
             * question / answerKey
             */

            const title =
                item.title ||
                "";


            const question =
                item.question ||
                "";


            const answer =
                item.answer ||
                item.answerKey ||
                "";


            const difficulty =
                item.difficulty ||
                "";


            const duration =
                item.duration ||
                "";


            html += `

                <tr>

                    <td style="${tableCellStyle}">
                        ${index + 1}
                    </td>

                    <td style="${tableCellStyle}">
                        ${escapeHtml(
                            title
                        )}
                    </td>

                    <td style="${tableCellStyle}">
                        ${escapeHtml(
                            question
                        )}
                    </td>

                    <td style="${tableCellStyle}">
                        ${escapeHtml(
                            answer
                        )}
                    </td>

                    <td style="${tableCellStyle}">
                        ${escapeHtml(
                            difficulty
                        )}
                    </td>

                    <td style="${tableCellStyle}">
                        ${escapeHtml(
                            String(
                                duration
                            )
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


    const result =
        await apiDeleteQuestion({

            id:
                question.id

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

        await refreshDashboardCounters();

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
                ${editing
                    ? "Edit Student"
                    : "Add Student"}
            </h3>

            <br>

            <label>
                NIS
            </label>

            <input
                id="studentNis"
                type="text"
                value="${editing
                    ? escapeAttribute(student.nis || "")
                    : ""}"
                ${editing ? "readonly" : ""}
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
                value="${editing
                    ? escapeAttribute(student.nama || "")
                    : ""}"
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
                value="${editing
                    ? escapeAttribute(student.kelas || "")
                    : ""}"
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
                value="${editing
                    ? escapeAttribute(student.username || "")
                    : ""}"
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
                value="${editing
                    ? escapeAttribute(student.password || "")
                    : ""}"
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
                    ${(
                        !editing ||
                        student.status === "ACTIVE"
                    )
                    ? "selected"
                    : ""}>

                    ACTIVE

                </option>

                <option
                    value="INACTIVE"
                    ${(
                        editing &&
                        student.status === "INACTIVE"
                    )
                    ? "selected"
                    : ""}>

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

        await refreshDashboardCounters();

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
GET STUDENT FORM DATA
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
                ?.value || "ACTIVE"

    };

}


/* =========================================================
UPDATE STUDENT
========================================================= */

async function submitStudentUpdate(
    nis
) {

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

        await refreshDashboardCounters();

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

        <div style="
            overflow-x:auto;
        ">

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
                    student.status || "ACTIVE"
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
                        ${escapeHtml(
                            status
                        )}
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

async function deleteStudentByIndex(
    index
) {

    const student =
        teacherStudents[index];

    if (!student) return;


    const nis =
        String(
            student.nis || ""
        );


    const confirmed =
        confirm(
            "Hapus student dengan NIS " +
            nis +
            "?"
        );


    if (!confirmed) return;


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

        await refreshDashboardCounters();

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

                <br>

                <code>
                    7002,Budi Santoso,7A,budi,123456,ACTIVE
                </code>

            </div>

            <br>

            <div style="
                background:#fff8e1;
                border-left:4px solid #f0ad00;
                padding:12px;
                border-radius:6px;
            ">

                <strong>Catatan:</strong>

                <br>

                NIS harus berada pada kolom
                <strong>nis</strong>.

                <br>

                Jangan menghapus header CSV.

                <br>

                Password akan disimpan sesuai
                data CSV.

            </div>

            <br>

            <input
                id="studentCSVFile"
                type="file"
                accept=".csv,text/csv"
                style="
                    width:100%;
                    padding:12px;
                    border:1px solid #ddd;
                    border-radius:8px;
                "
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
PREVIEW CSV
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


    if (
        !file.name
            .toLowerCase()
            .endsWith(".csv")
    ) {

        alert(
            "File harus berformat CSV."
        );

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function (event) {

            try {

                const text =
                    event.target.result;


                const result =
                    parseStudentCSV(
                        text
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

            success:
                false,

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

            success:
                false,

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
        missingHeaders.length > 0
    ) {

        return {

            success:
                false,

            message:
                "Header CSV tidak lengkap. " +
                "Header yang kurang: " +
                missingHeaders.join(", ")

        };

    }


    const data = [];

    const errors = [];


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
        ) {

            continue;

        }


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


        if (!item.nis) {

            errors.push(
                "Baris " +
                (i + 1) +
                ": NIS kosong."
            );

            continue;

        }


        if (!item.nama) {

            errors.push(
                "Baris " +
                (i + 1) +
                ": nama kosong."
            );

            continue;

        }


        data.push(
            item
        );

    }


    if (
        data.length === 0
    ) {

        return {

            success:
                false,

            message:
                "Tidak ada student valid yang ditemukan."

        };

    }


    return {

        success:
            true,

        data:
            data,

        errors:
            errors

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

            row.push(
                cell
            );

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


            row.push(
                cell
            );

            rows.push(
                row
            );


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

        row.push(
            cell
        );

        rows.push(
            row
        );

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


    if (
        index < 0
    ) {

        return "";

    }


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


    if (
        csvStudentData.length === 0
    ) {

        preview.innerHTML =
            "Tidak ada data.";

        return;

    }


    let html = `

        <div style="
            margin-bottom:15px;
        ">

            <h3>
                Preview
            </h3>

            <p style="
                color:#666;
                margin-top:5px;
            ">

                ${csvStudentData.length}
                student siap diimport.

            </p>

        </div>

        <div style="
            overflow-x:auto;
        ">

            <table style="
                width:100%;
                border-collapse:collapse;
                min-width:750px;
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
                            Password
                        </th>

                        <th style="${tableHeadStyle}">
                            Status
                        </th>

                    </tr>

                </thead>

                <tbody>

    `;


    csvStudentData.forEach(
        function (student, index) {

            html += `

                <tr>

                    <td style="${tableCellStyle}">
                        ${index + 1}
                    </td>

                    <td style="${tableCellStyle}">
                        ${escapeHtml(student.nis)}
                    </td>

                    <td style="${tableCellStyle}">
                        ${escapeHtml(student.nama)}
                    </td>

                    <td style="${tableCellStyle}">
                        ${escapeHtml(student.kelas)}
                    </td>

                    <td style="${tableCellStyle}">
                        ${escapeHtml(student.username)}
                    </td>

                    <td style="${tableCellStyle}">
                        ${escapeHtml(student.password)}
                    </td>

                    <td style="${tableCellStyle}">
                        ${escapeHtml(student.status)}
                    </td>

                </tr>

            `;

        }
    );


    html += `

                </tbody>

            </table>

        </div>

        <br>

        <div style="
            display:flex;
            gap:10px;
            flex-wrap:wrap;
        ">

            <button
                class="btn teacher"
                id="startCSVImportButton"
                onclick="startStudentCSVImport()">

                🚀 Import
                ${csvStudentData.length}
                Students

            </button>

        </div>

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
        !csvStudentData ||
        csvStudentData.length === 0
    ) {

        alert(
            "Tidak ada data CSV untuk diimport."
        );

        return;

    }


    const confirmed =
        confirm(
            "Import " +
            csvStudentData.length +
            " student sekarang?"
        );


    if (!confirmed) return;


    const button =
        document.getElementById(
            "startCSVImportButton"
        );


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "⏳ Importing...";

    }


    const progress =
        document.getElementById(
            "csvImportProgress"
        );


    let successCount =
        0;

    let failedCount =
        0;

    const failedRows = [];


    for (
        let i = 0;
        i < csvStudentData.length;
        i++
    ) {

        const student =
            csvStudentData[i];


        if (progress) {

            progress.innerHTML = `

                <div style="
                    padding:15px;
                    background:#f5f7fa;
                    border-radius:10px;
                ">

                    <strong>
                        Importing ${i + 1}
                        /
                        ${csvStudentData.length}
                    </strong>

                    <br><br>

                    NIS:
                    ${escapeHtml(
                        student.nis
                    )}

                    <br>

                    Nama:
                    ${escapeHtml(
                        student.nama
                    )}

                </div>

            `;

        }


        try {

            const result =
                await apiInsertStudent(
                    student
                );


            if (
                result &&
                result.success
            ) {

                successCount++;

            }

            else {

                failedCount++;

                failedRows.push({

                    row:
                        i + 2,

                    nis:
                        student.nis,

                    nama:
                        student.nama,

                    message:
                        result?.message ||
                        "Unknown error."

                });

            }

        }

        catch (err) {

            failedCount++;

            failedRows.push({

                row:
                    i + 2,

                nis:
                    student.nis,

                nama:
                    student.nama,

                message:
                    err.message ||
                    "Import error."

            });

        }

    }


    if (button) {

        button.disabled =
            false;

        button.textContent =
            "🚀 Import Selesai";

    }


    let resultHTML = `

        <div style="
            padding:20px;
            background:#f5f7fa;
            border-radius:12px;
        ">

            <h3>
                📊 Import Result
            </h3>

            <br>

            <strong>
                Total:
            </strong>
            ${csvStudentData.length}

            <br>

            <strong>
                Berhasil:
            </strong>
            ${successCount}

            <br>

            <strong>
                Gagal:
            </strong>
            ${failedCount}

        </div>

    `;


    if (
        failedRows.length > 0
    ) {

        resultHTML += `

            <br>

            <div style="
                padding:20px;
                background:#fff3f3;
                border-left:4px solid #d32f2f;
                border-radius:8px;
            ">

                <h3>
                    ⚠️ Data Gagal
                </h3>

                <br>

        `;


        failedRows.forEach(
            function (item) {

                resultHTML += `

                    <div style="
                        margin-bottom:12px;
                        padding-bottom:12px;
                        border-bottom:1px solid #eee;
                    ">

                        Baris:
                        <strong>
                            ${item.row}
                        </strong>

                        <br>

                        NIS:
                        ${escapeHtml(
                            item.nis
                        )}

                        <br>

                        Nama:
                        ${escapeHtml(
                            item.nama
                        )}

                        <br>

                        Error:
                        ${escapeHtml(
                            item.message
                        )}

                    </div>

                `;

            }
        );


        resultHTML += `

            </div>

        `;

    }


    resultHTML += `

        <br>

        <button
            class="btn teacher"
            onclick="renderStudentList()">

            👨‍🎓 Kembali ke Student List

        </button>

    `;


    if (progress) {

        progress.innerHTML =
            resultHTML;

    }


    csvStudentData = [];


    await refreshDashboardCounters();

}


/* =========================================================
CSV ERROR
========================================================= */

function showCSVError(
    message
) {

    const preview =
        document.getElementById(
            "csvPreview"
        );

    if (!preview) return;


    preview.innerHTML = `

        <div style="
            padding:15px;
            background:#fff3f3;
            border-left:4px solid #d32f2f;
            border-radius:8px;
            color:#b00020;
        ">

            <strong>
                ❌ CSV Error
            </strong>

            <br><br>

            ${escapeHtml(
                message
            )}

        </div>

    `;

}


/* =========================================================
TOKEN PAGE
========================================================= */

async function loadTokenPage() {

    const content =
        getContentElement();

    if (!content) return;


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


    await renderTokenList();

}


/* =========================================================
TOKEN FORM
========================================================= */

function showTokenForm() {

    const area =
        document.getElementById(
            "tokenArea"
        );

    if (!area) return;


    area.innerHTML = `

        <div class="card-box">

            <h3>
                Create Exam Token
            </h3>

            <br>

            <label>
                Token
            </label>

            <input
                id="tokenValue"
                type="text"
                placeholder="Contoh: SAF2026"
                style="${inputStyle}"
            >

            <br><br>

            <button
                class="btn teacher"
                onclick="submitTokenCreate()">

                💾 Create Token

            </button>

            <button
                class="btn"
                onclick="renderTokenList()">

                Cancel

            </button>

            <div
                id="tokenMessage"
                style="margin-top:15px;">
            </div>

        </div>

    `;

}


/* =========================================================
CREATE TOKEN
========================================================= */

async function submitTokenCreate() {

    const token =
        document
            .getElementById(
                "tokenValue"
            )
            ?.value
            .trim();


    if (!token) {

        showMessage(
            "tokenMessage",
            "Token wajib diisi.",
            "error"
        );

        return;

    }


    const result =
        await apiCreateToken({

            token:
                token

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

        await refreshDashboardCounters();

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
            overflow-x:auto;
        ">

            <table style="
                width:100%;
                border-collapse:collapse;
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
                            Status
                        </th>

                    </tr>

                </thead>

                <tbody>

    `;


    teacherTokens.forEach(
        function (item, index) {

            html += `

                <tr>

                    <td style="${tableCellStyle}">
                        ${index + 1}
                    </td>

                    <td style="${tableCellStyle}">
                        ${escapeHtml(
                            item.token || ""
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


    const response =
        await apiGetResult();


    if (
        !response ||
        !response.success
    ) {

        area.innerHTML = `

            <div style="color:#b00020;">

                Gagal mengambil result.

                <br>

                ${escapeHtml(
                    response?.message ||
                    "Unknown error."
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
            margin-bottom:15px;
        ">

            <strong>
                Total Results:
                ${teacherResults.length}
            </strong>

        </div>

        <div style="
            overflow-x:auto;
        ">

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

            const studentName =
                item.nama ||
                item.username ||
                item.nis ||
                "";


            const question =
                item.question ||
                item.title ||
                "";


            const score =
                item.score ??
                "";


            html += `

                <tr>

                    <td style="${tableCellStyle}">
                        ${index + 1}
                    </td>

                    <td style="${tableCellStyle}">
                        ${escapeHtml(
                            studentName
                        )}
                    </td>

                    <td style="${tableCellStyle}">
                        ${escapeHtml(
                            question
                        )}
                    </td>

                    <td style="${tableCellStyle}">
                        ${escapeHtml(
                            String(
                                score
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

            ${escapeHtml(
                message
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