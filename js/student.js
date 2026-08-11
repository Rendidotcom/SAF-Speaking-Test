/**
 * ==========================================
 * SAF Speaking Online Test
 * Student Dashboard
 *
 * File:
 * js/student.js
 *
 * Stable Foundation
 *
 * ROLE:
 * - Student session
 * - Student dashboard
 * - Student result
 * - Logout
 *
 * DEPENDENCY:
 * - config.js
 * - api.js
 *
 * BACKEND:
 * - getStudentResult
 *
 * IMPORTANT:
 * - Tidak mengubah teacher.js
 * - Tidak menggunakan exam.js
 * - Tidak mengubah architecture
 * ==========================================
 */


/* =====================================================
INITIALIZE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initStudent
);


/* =====================================================
INITIALIZE STUDENT
===================================================== */

async function initStudent() {

    console.log(
        "SAF Student Dashboard initializing..."
    );


    const session =
        getStudentSession();


    if (!session) {

        return;

    }


    setStudentIdentity(
        session
    );


    setTodayDate();


    bindStudentMenu();


    await loadStudentResults();


    updateDashboardFromResults();

}


/* =====================================================
SESSION
===================================================== */

function getStudentSession() {

    const raw =
        sessionStorage.getItem(
            CONFIG.SESSION_KEY
        );


    if (!raw) {

        console.warn(
            "Student session not found."
        );


        window.location.href =
            "login.html?role=student";


        return null;

    }


    try {

        const session =
            JSON.parse(raw);


        if (
            !session ||
            session.role !== "student"
        ) {

            console.warn(
                "Invalid student session."
            );


            logoutStudent();


            return null;

        }


        console.log(
            "STUDENT SESSION:",
            session
        );


        return session;

    }

    catch (err) {

        console.error(
            "STUDENT SESSION ERROR:",
            err
        );


        logoutStudent();


        return null;

    }

}


/* =====================================================
STUDENT IDENTITY
===================================================== */

function setStudentIdentity(session) {

    const nameElement =
        document.getElementById(
            "studentName"
        );


    if (
        nameElement &&
        session.nama
    ) {

        nameElement.textContent =
            session.nama;

    }

}


/* =====================================================
TODAY DATE
===================================================== */

function setTodayDate() {

    const dateElement =
        document.getElementById(
            "todayDate"
        );


    if (!dateElement) {

        return;

    }


    const today =
        new Date();


    dateElement.textContent =
        today.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

}


/* =====================================================
MENU
===================================================== */

function bindStudentMenu() {

    document
        .querySelectorAll(
            ".menu a"
        )
        .forEach(link => {

            const text =
                link.textContent
                    .trim()
                    .toLowerCase();


            if (
                text.includes("logout")
            ) {

                link.addEventListener(
                    "click",
                    function(e) {

                        e.preventDefault();

                        logoutStudent();

                    }
                );

            }

        });

}


/* =====================================================
LOGOUT
===================================================== */

function logoutStudent() {

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
LOAD STUDENT RESULTS
===================================================== */

async function loadStudentResults() {

    const session =
        getStudentSession();


    if (!session) {

        return;

    }


    const resultContainer =
        document.getElementById(
            "studentResults"
        );


    if (!resultContainer) {

        console.warn(
            "#studentResults not found."
        );

        return;

    }


    resultContainer.innerHTML =
        "<p>Loading your speaking results...</p>";


    const nis =
        session.nis;


    if (!nis) {

        resultContainer.innerHTML =
            "<p style='color:red'>" +
            "Student NIS tidak ditemukan pada session." +
            "</p>";

        return;

    }


    console.log(
        "GET STUDENT RESULT REQUEST:",
        {
            nis: nis
        }
    );


    try {

        const res =
            await apiGetStudentResult({

                nis: nis

            });


        console.log(
            "GET STUDENT RESULT RESPONSE:",
            res
        );


        if (
            !res ||
            res.success !== true
        ) {

            resultContainer.innerHTML =
                "<p>" +
                escapeStudentHTML(
                    res &&
                    res.message
                        ? res.message
                        : "Unable to load speaking results."
                ) +
                "</p>";

            return;

        }


        /* =================================================
        IMPORTANT RESPONSE NORMALIZATION

        Support:

        FORMAT A:
        {
            success: true,
            data: [...]
        }

        FORMAT B:
        {
            0: {...},
            1: {...},
            2: {...},
            success: true,
            message: "Success"
        }

        Current backend terbukti menggunakan FORMAT B.
        ================================================= */

        let results = [];


        /* FORMAT A */

        if (
            Array.isArray(res.data)
        ) {

            results =
                res.data;

        }


        /* FORMAT B */

        else {

            results =
                Object.keys(res)

                    .filter(
                        key =>
                            /^\d+$/.test(key)
                    )

                    .sort(
                        (a, b) =>
                            Number(a) - Number(b)
                    )

                    .map(
                        key =>
                            res[key]
                    )

                    .filter(
                        item =>
                            item &&
                            typeof item === "object"
                    );

        }


        console.log(
            "NORMALIZED STUDENT RESULTS:",
            results
        );


        console.log(
            "STUDENT RESULT COUNT:",
            results.length
        );


        renderStudentResults(
            results
        );


        updateStudentStatistics(
            results
        );

    }

    catch (err) {

        console.error(
            "LOAD STUDENT RESULTS ERROR:",
            err
        );


        resultContainer.innerHTML =
            "<p style='color:red'>" +
            escapeStudentHTML(
                err.message ||
                "Unable to load speaking results."
            ) +
            "</p>";

    }

}


/* =====================================================
RENDER STUDENT RESULTS
===================================================== */

function renderStudentResults(results) {

    const container =
        document.getElementById(
            "studentResults"
        );


    if (!container) {

        return;

    }


    if (
        !Array.isArray(results) ||
        results.length === 0
    ) {

        container.innerHTML = `

            <p>
                No speaking result yet.
            </p>

        `;

        return;

    }


    let html = `

        <div
            style="
                overflow-x:auto;
                width:100%;
            "
        >

            <table
                width="100%"
                cellpadding="10"
                cellspacing="0"
                style="
                    border-collapse:collapse;
                    background:white;
                    min-width:850px;
                "
            >

                <thead>

                    <tr
                        style="
                            background:#0B72B9;
                            color:white;
                        "
                    >

                        <th
                            style="
                                border:1px solid #ddd;
                                padding:12px;
                            "
                        >
                            No
                        </th>

                        <th
                            style="
                                border:1px solid #ddd;
                                padding:12px;
                            "
                        >
                            Question
                        </th>

                        <th
                            style="
                                border:1px solid #ddd;
                                padding:12px;
                            "
                        >
                            Transcript
                        </th>

                        <th
                            style="
                                border:1px solid #ddd;
                                padding:12px;
                            "
                        >
                            Score
                        </th>

                        <th
                            style="
                                border:1px solid #ddd;
                                padding:12px;
                            "
                        >
                            Feedback
                        </th>

                        <th
                            style="
                                border:1px solid #ddd;
                                padding:12px;
                            "
                        >
                            Token
                        </th>

                        <th
                            style="
                                border:1px solid #ddd;
                                padding:12px;
                            "
                        >
                            Date
                        </th>

                    </tr>

                </thead>

                <tbody>

    `;


    results.forEach(
        (result, index) => {

            const score =
                result.score !== undefined &&
                result.score !== null &&
                result.score !== ""
                    ? result.score
                    : "-";


            html += `

                <tr>

                    <td
                        style="
                            border:1px solid #ddd;
                            padding:12px;
                            text-align:center;
                        "
                    >
                        ${index + 1}
                    </td>

                    <td
                        style="
                            border:1px solid #ddd;
                            padding:12px;
                        "
                    >
                        ${escapeStudentHTML(
                            result.question || "-"
                        )}
                    </td>

                    <td
                        style="
                            border:1px solid #ddd;
                            padding:12px;
                        "
                    >
                        ${escapeStudentHTML(
                            result.transcript || "-"
                        )}
                    </td>

                    <td
                        style="
                            border:1px solid #ddd;
                            padding:12px;
                            text-align:center;
                        "
                    >

                        <strong
                            style="
                                font-size:20px;
                                color:#0B72B9;
                            "
                        >
                            ${escapeStudentHTML(
                                score
                            )}
                        </strong>

                    </td>

                    <td
                        style="
                            border:1px solid #ddd;
                            padding:12px;
                        "
                    >
                        ${escapeStudentHTML(
                            result.feedback || "-"
                        )}
                    </td>

                    <td
                        style="
                            border:1px solid #ddd;
                            padding:12px;
                        "
                    >
                        ${escapeStudentHTML(
                            result.token || "-"
                        )}
                    </td>

                    <td
                        style="
                            border:1px solid #ddd;
                            padding:12px;
                        "
                    >
                        ${formatStudentDate(
                            result.createdAt
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


    container.innerHTML =
        html;

}


/* =====================================================
UPDATE STATISTICS
===================================================== */

function updateStudentStatistics(results) {

    const total =
        Array.isArray(results)
            ? results.length
            : 0;


    let latestScore =
        0;


    if (total > 0) {

        const latest =
            results[
                results.length - 1
            ];


        if (
            latest &&
            latest.score !== undefined &&
            latest.score !== null &&
            latest.score !== ""
        ) {

            latestScore =
                Number(
                    latest.score
                );


            if (
                Number.isNaN(
                    latestScore
                )
            ) {

                latestScore = 0;

            }

        }

    }


    const scoreElement =
        document.getElementById(
            "latestScore"
        );


    if (scoreElement) {

        scoreElement.textContent =
            latestScore;

    }


    const attemptElement =
        document.getElementById(
            "attemptCount"
        );


    if (attemptElement) {

        attemptElement.textContent =
            total;

    }


    const statusElement =
        document.getElementById(
            "examStatus"
        );


    if (statusElement) {

        statusElement.textContent =
            total > 0
                ? "COMPLETED"
                : "READY";

    }


    const tokenElement =
        document.getElementById(
            "examToken"
        );


    if (
        tokenElement &&
        total > 0
    ) {

        const latest =
            results[
                results.length - 1
            ];


        tokenElement.textContent =
            latest &&
            latest.token
                ? latest.token
                : "-";

    }

}


/* =====================================================
DASHBOARD STATISTICS
===================================================== */

function updateDashboardFromResults() {

    /*
     * Statistik sudah diperbarui
     * oleh updateStudentStatistics().
     *
     * Fungsi ini disediakan sebagai
     * entry point dashboard.
     */

}


/* =====================================================
ESCAPE HTML
===================================================== */

function escapeStudentHTML(value) {

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
FORMAT DATE
===================================================== */

function formatStudentDate(value) {

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

        return escapeStudentHTML(
            value
        );

    }


    return escapeStudentHTML(

        date.toLocaleString(
            "en-US"
        )

    );

}


/* =====================================================
END OF FILE
===================================================== */