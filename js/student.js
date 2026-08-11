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
 * - Student hanya membaca result miliknya
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
GLOBAL STUDENT STATE
===================================================== */

const STUDENT_APP = {

    session: null,

    results: [],

    initialized: false

};


/* =====================================================
INITIALIZE STUDENT
===================================================== */

async function initStudent() {

    console.log(
        "================================="
    );

    console.log(
        "SAF Student Dashboard initializing..."
    );

    console.log(
        "================================="
    );


    const session =
        getStudentSession();


    if (!session) {

        return;

    }


    STUDENT_APP.session =
        session;


    STUDENT_APP.initialized =
        true;


    setStudentIdentity(
        session
    );


    setTodayDate();


    bindStudentMenu();


    /*
     * Load current token
     * if available in session.
     */

    setCurrentToken(
        session
    );


    /*
     * Load result student.
     */

    await loadStudentResults();


    /*
     * Final dashboard update.
     */

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
            "================================="
        );

        console.log(
            "STUDENT SESSION:"
        );

        console.log(
            session
        );

        console.log(
            "================================="
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
CURRENT TOKEN
===================================================== */

function setCurrentToken(session) {

    const tokenElement =
        document.getElementById(
            "examToken"
        );


    if (!tokenElement) {

        return;

    }


    let token = "";


    /*
     * Try session token fields.
     */

    if (session.token) {

        token =
            session.token;

    }


    /*
     * Try sessionStorage token.
     */

    if (!token) {

        try {

            const rawToken =
                sessionStorage.getItem(
                    CONFIG.TOKEN_KEY
                );


            if (rawToken) {

                try {

                    const parsedToken =
                        JSON.parse(
                            rawToken
                        );


                    if (
                        typeof parsedToken ===
                        "string"
                    ) {

                        token =
                            parsedToken;

                    }

                    else if (
                        parsedToken &&
                        parsedToken.token
                    ) {

                        token =
                            parsedToken.token;

                    }

                }

                catch (err) {

                    /*
                     * TOKEN_KEY may contain
                     * plain string.
                     */

                    token =
                        rawToken;

                }

            }

        }

        catch (err) {

            console.warn(
                "TOKEN READ ERROR:",
                err
            );

        }

    }


    tokenElement.textContent =
        token || "-";

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

                /*
                 * Avoid duplicate listener.
                 */

                if (
                    link.dataset
                        .studentLogoutBound ===
                    "true"
                ) {

                    return;

                }


                link.dataset
                    .studentLogoutBound =
                    "true";


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

    const resultContainer =
        document.getElementById(
            "studentResults"
        );


    if (!resultContainer) {

        console.error(
            "Student dashboard error: " +
            "#studentResults not found."
        );

        return;

    }


    resultContainer.innerHTML = `

        <p>
            Loading your speaking results...
        </p>

    `;


    /*
     * Use the session already loaded
     * during initialization.
     */

    const session =
        STUDENT_APP.session ||
        getStudentSession();


    if (!session) {

        return;

    }


    /*
     * NIS is the primary student identifier.
     */

    const nis =
        session.nis !== undefined &&
        session.nis !== null
            ? String(session.nis).trim()
            : "";


    if (!nis) {

        console.error(
            "Student NIS is missing from session:",
            session
        );


        resultContainer.innerHTML = `

            <p style="color:red;">
                Student NIS tidak ditemukan
                pada session.
            </p>

        `;

        return;

    }


    /*
     * Store session again.
     */

    STUDENT_APP.session =
        session;


    const requestData = {

        nis: nis

    };


    console.log(
        "================================="
    );

    console.log(
        "GET STUDENT RESULT REQUEST"
    );

    console.log(
        requestData
    );

    console.log(
        "================================="
    );


    try {

        /*
         * IMPORTANT:
         * Student uses getStudentResult,
         * NOT getResult.
         */

        const res =
            await apiGetStudentResult(
                requestData
            );


        console.log(
            "================================="
        );

        console.log(
            "GET STUDENT RESULT RESPONSE"
        );

        console.log(
            res
        );

        console.log(
            "================================="
        );


        if (!res) {

            resultContainer.innerHTML = `

                <p style="color:red;">
                    No response from server.
                </p>

            `;

            return;

        }


        if (
            res.success !== true
        ) {

            console.error(
                "GET STUDENT RESULT FAILED:",
                res
            );


            resultContainer.innerHTML = `

                <p style="color:red;">

                    ${escapeStudentHTML(
                        res.message ||
                        "Unable to load speaking results."
                    )}

                </p>

            `;

            return;

        }


        /*
         * Normalize API response.
         *
         * Primary:
         * res.data = [...]
         *
         * Also supports:
         * res.data.results
         * res.results
         * res.items
         */

        const results =
            normalizeStudentResults(
                res
            );


        console.log(
            "NORMALIZED STUDENT RESULTS:"
        );

        console.log(
            results
        );


        STUDENT_APP.results =
            results;


        /*
         * Render result table.
         */

        renderStudentResults(
            results
        );


        /*
         * Update dashboard cards.
         */

        updateStudentStatistics(
            results
        );

    }

    catch (err) {

        console.error(
            "================================="
        );

        console.error(
            "LOAD STUDENT RESULTS ERROR"
        );

        console.error(
            err
        );

        console.error(
            "================================="
        );


        resultContainer.innerHTML = `

            <p style="color:red;">

                ${escapeStudentHTML(
                    err &&
                    err.message
                        ? err.message
                        : "Unable to load speaking results."
                )}

            </p>

        `;

    }

}


/* =====================================================
NORMALIZE STUDENT RESULTS
===================================================== */

function normalizeStudentResults(res) {

    if (!res) {

        return [];

    }


    /*
     * Standard response:
     *
     * {
     *   success: true,
     *   data: [...]
     * }
     */

    if (
        Array.isArray(
            res.data
        )
    ) {

        return res.data;

    }


    /*
     * Alternative:
     *
     * {
     *   success: true,
     *   data: {
     *      results: [...]
     *   }
     * }
     */

    if (
        res.data &&
        Array.isArray(
            res.data.results
        )
    ) {

        return res.data.results;

    }


    /*
     * Alternative:
     *
     * {
     *   success: true,
     *   results: [...]
     * }
     */

    if (
        Array.isArray(
            res.results
        )
    ) {

        return res.results;

    }


    /*
     * Alternative:
     *
     * {
     *   success: true,
     *   items: [...]
     * }
     */

    if (
        Array.isArray(
            res.items
        )
    ) {

        return res.items;

    }


    return [];

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


    /*
     * Copy array so original API data
     * is not modified.
     */

    const sortedResults =
        [...results];


    /*
     * Latest result first when
     * createdAt exists.
     */

    sortedResults.sort(
        function(a, b) {

            const dateA =
                getStudentDateValue(
                    a.createdAt ||
                    a.updatedAt
                );


            const dateB =
                getStudentDateValue(
                    b.createdAt ||
                    b.updatedAt
                );


            if (
                dateA === 0 &&
                dateB === 0
            ) {

                return 0;

            }


            if (dateA === 0) {

                return 1;

            }


            if (dateB === 0) {

                return -1;

            }


            return dateB - dateA;

        }
    );


    /*
     * Save sorted version.
     */

    STUDENT_APP.results =
        sortedResults;


    let html = `

        <div
            style="
                overflow-x:auto;
                width:100%;
            "
        >

            <table
                border="1"
                width="100%"
                cellpadding="10"
                cellspacing="0"
                style="
                    border-collapse:collapse;
                    background:white;
                    width:100%;
                "
            >

                <thead>

                    <tr>

                        <th>No</th>

                        <th>Question</th>

                        <th>Transcript</th>

                        <th>Score</th>

                        <th>Feedback</th>

                        <th>Token</th>

                        <th>Date</th>

                    </tr>

                </thead>

                <tbody>

    `;


    sortedResults.forEach(
        function(result, index) {

            const score =
                result &&
                result.score !== undefined &&
                result.score !== null &&
                result.score !== ""
                    ? result.score
                    : "-";


            const scoreNumber =
                Number(score);


            const scoreDisplay =
                Number.isNaN(
                    scoreNumber
                )
                    ? escapeStudentHTML(
                        score
                    )
                    : escapeStudentHTML(
                        scoreNumber
                    );


            html += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${escapeStudentHTML(
                            result.question ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${escapeStudentHTML(
                            result.transcript ||
                            "-"
                        )}
                    </td>

                    <td>

                        <strong>

                            ${scoreDisplay}

                        </strong>

                    </td>

                    <td>
                        ${escapeStudentHTML(
                            result.feedback ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${escapeStudentHTML(
                            result.token ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${formatStudentDate(
                            result.createdAt ||
                            result.updatedAt
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
UPDATE STUDENT STATISTICS
===================================================== */

function updateStudentStatistics(results) {

    const total =
        Array.isArray(results)
            ? results.length
            : 0;


    let latestScore =
        0;


    /*
     * Results are already sorted
     * latest first.
     */

    if (
        total > 0
    ) {

        const latest =
            results[0];


        if (
            latest &&
            latest.score !== undefined &&
            latest.score !== null &&
            latest.score !== ""
        ) {

            const numericScore =
                Number(
                    latest.score
                );


            if (
                !Number.isNaN(
                    numericScore
                )
            ) {

                latestScore =
                    numericScore;

            }

            else {

                latestScore =
                    latest.score;

            }

        }

    }


    /*
     * Latest Score
     */

    const scoreElement =
        document.getElementById(
            "latestScore"
        );


    if (scoreElement) {

        scoreElement.textContent =
            latestScore;

    }


    /*
     * Attempts
     */

    const attemptElement =
        document.getElementById(
            "attemptCount"
        );


    if (attemptElement) {

        attemptElement.textContent =
            total;

    }


    /*
     * Exam Status
     */

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

}


/* =====================================================
DASHBOARD STATISTICS
===================================================== */

function updateDashboardFromResults() {

    /*
     * Statistics are already updated
     * by updateStudentStatistics().
     *
     * This function remains as the
     * dashboard entry point.
     */

    updateStudentStatistics(
        STUDENT_APP.results
    );

}


/* =====================================================
GET DATE VALUE
===================================================== */

function getStudentDateValue(value) {

    if (!value) {

        return 0;

    }


    const date =
        new Date(value);


    const time =
        date.getTime();


    if (
        Number.isNaN(time)
    ) {

        return 0;

    }


    return time;

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
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        )

    );

}


/* =====================================================
END OF FILE
===================================================== */