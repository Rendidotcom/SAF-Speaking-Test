/**
 * ==========================================
 * SAF Speaking Online Test
 * Exam Token Module
 * Stable Foundation v3.0
 * ==========================================
 *
 * Frontend : Vercel
 * API      : /api
 * Backend  : Google Apps Script
 *
 * Sync:
 * - api.js
 * - route.js
 * - Code.gs
 * - Token.gs
 *
 * Functions:
 * - Load Exam Token Page
 * - Generate Token
 * - Load Token
 * - Render Current Token
 * - Render Token History
 * - Disable Token
 * - Delete Token
 *
 * ==========================================
 */


/* =====================================================
   GLOBAL STATE
===================================================== */

let tokenList = [];


/* =====================================================
   LOAD EXAM TOKEN PAGE
===================================================== */

async function loadExamPage() {

    const content =
        document.getElementById("content");

    if (!content) {

        console.error(
            "Exam page error: #content not found."
        );

        return;

    }


    /* =================================================
       RENDER PAGE
    ================================================= */

    content.innerHTML = `

        <h2>🔑 Exam Token Management</h2>

        <br>

        <div class="form-grid">

            <label for="examClass">
                Class
            </label>

            <select id="examClass">

                <option value="7A">7A</option>

                <option value="7B">7B</option>

                <option value="7C">7C</option>

                <option value="7D">7D</option>

            </select>


            <label for="expiredMinute">
                Expired (Minutes)
            </label>

            <select id="expiredMinute">

                <option value="30">
                    30 Minutes
                </option>

                <option value="60">
                    60 Minutes
                </option>

                <option value="90">
                    90 Minutes
                </option>

                <option value="120">
                    120 Minutes
                </option>

            </select>

            <br><br>

            <button
                type="button"
                id="btnGenerateToken"
                class="btn teacher">

                Generate Token

            </button>

        </div>


        <hr style="margin:30px 0;">


        <h3>
            Current Token
        </h3>

        <div id="currentToken">

            Loading...

        </div>


        <br>


        <h3>
            Token History
        </h3>

        <br>


        <div
            id="tokenTableWrapper"
            style="overflow-x:auto;">

            <table
                class="table"
                width="100%">

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

                <tbody id="tokenTable">

                    <tr>

                        <td
                            colspan="7"
                            style="text-align:center;">

                            Loading...

                        </td>

                    </tr>

                </tbody>

            </table>

        </div>

    `;


    /* =================================================
       BIND GENERATE BUTTON
    ================================================= */

    const button =
        document.getElementById(
            "btnGenerateToken"
        );


    if (button) {

        button.addEventListener(
            "click",
            generateExamToken
        );

    }


    /* =================================================
       LOAD TOKEN DATA
    ================================================= */

    await loadToken();

}


/* =====================================================
   GENERATE EXAM TOKEN
===================================================== */

async function generateExamToken() {

    const classElement =
        document.getElementById("examClass");

    const expiredElement =
        document.getElementById("expiredMinute");

    const button =
        document.getElementById(
            "btnGenerateToken"
        );


    if (!classElement) {

        alert(
            "Class field is not available."
        );

        return;

    }


    if (!expiredElement) {

        alert(
            "Expired field is not available."
        );

        return;

    }


    const kelas =
        classElement.value.trim();

    const expired =
        Number(expiredElement.value);


    /* =================================================
       VALIDATION
    ================================================= */

    if (!kelas) {

        alert(
            "Please select a class."
        );

        return;

    }


    if (
        !expired ||
        expired <= 0
    ) {

        alert(
            "Invalid expiration time."
        );

        return;

    }


    /* =================================================
       BUTTON STATE
    ================================================= */

    if (button) {

        button.disabled = true;

        button.innerHTML =
            "Generating...";

    }


    try {

        console.log(
            "================================="
        );

        console.log(
            "CREATE TOKEN REQUEST"
        );

        console.log({

            kelas: kelas,

            expired: expired,

            createdBy: "Teacher"

        });


        /* =================================================
           API REQUEST
        ================================================= */

        const result =
            await apiCreateToken({

                kelas: kelas,

                expired: expired,

                createdBy: "Teacher"

            });


        console.log(
            "CREATE TOKEN RESPONSE"
        );

        console.log(result);


        /* =================================================
           RESPONSE VALIDATION
        ================================================= */

        if (
            !result ||
            result.success !== true
        ) {

            alert(

                result &&
                result.message

                    ? result.message

                    : "Failed to create exam token."

            );

            return;

        }


        /* =================================================
           SUCCESS
        ================================================= */

        const generatedToken =
            result.token ||
            (
                result.data &&
                result.data.token
            );


        if (generatedToken) {

            alert(

                "Token Created Successfully\n\n" +
                "Token: " +
                generatedToken

            );

        }

        else {

            alert(
                "Token Created Successfully."
            );

        }


        /* =================================================
           RELOAD TOKEN DATA
        ================================================= */

        await loadToken();


    }

    catch (err) {

        console.error(
            "CREATE TOKEN ERROR:",
            err
        );


        alert(

            "Unable to create exam token.\n\n" +
            (
                err.message ||
                "Unknown error."
            )

        );

    }


    finally {

        if (button) {

            button.disabled = false;

            button.innerHTML =
                "Generate Token";

        }

    }

}


/* =====================================================
   LOAD TOKEN
===================================================== */

async function loadToken() {

    try {

        console.log(
            "================================="
        );

        console.log(
            "GET TOKEN"
        );


        const result =
            await apiGetToken();


        console.log(
            "GET TOKEN RESPONSE"
        );

        console.log(result);


        /* =================================================
           FAILED RESPONSE
        ================================================= */

        if (
            !result ||
            result.success !== true
        ) {

            tokenList = [];

            renderToken();

            return;

        }


        /* =================================================
           NORMALIZE DATA
        ================================================= */

        if (Array.isArray(result.data)) {

            tokenList =
                result.data;

        }

        else {

            tokenList = [];

        }


        /* =================================================
           RENDER
        ================================================= */

        renderToken();


    }

    catch (err) {

        console.error(
            "LOAD TOKEN ERROR:",
            err
        );


        tokenList = [];

        renderToken();

    }

}


/* =====================================================
   RENDER TOKEN
===================================================== */

function renderToken() {

    const tbody =
        document.getElementById(
            "tokenTable"
        );

    const current =
        document.getElementById(
            "currentToken"
        );


    /* =================================================
       DOM SAFETY
    ================================================= */

    if (!tbody) {

        console.warn(
            "renderToken: #tokenTable not found."
        );

        return;

    }


    /* =================================================
       CLEAR TABLE
    ================================================= */

    tbody.innerHTML = "";


    /* =================================================
       FIND ACTIVE TOKEN
    ================================================= */

    let activeToken = null;


    tokenList.forEach(
        item => {

            if (
                String(item.status || "")
                    .toUpperCase()
                === "ACTIVE"
            ) {

                activeToken = item;

            }

        }
    );


    /* =================================================
       CURRENT TOKEN
    ================================================= */

    if (current) {

        if (activeToken) {

            current.innerHTML = `

                <div class="card-box">

                    <h2>
                        ${escapeHTML(
                            activeToken.token
                        )}
                    </h2>

                    <p>

                        <b>Class:</b>

                        ${escapeHTML(
                            activeToken.kelas
                        )}

                    </p>

                    <p>

                        <b>Expired:</b>

                        ${escapeHTML(
                            activeToken.expired
                        )}
                        minutes

                    </p>

                    <p>

                        <b>Status:</b>

                        ${escapeHTML(
                            activeToken.status
                        )}

                    </p>

                </div>

            `;

        }

        else {

            current.innerHTML =
                "<p>No Active Token.</p>";

        }

    }


    /* =================================================
       EMPTY TOKEN
    ================================================= */

    if (
        !Array.isArray(tokenList) ||
        tokenList.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="text-align:center;">

                    No Token Found.

                </td>

            </tr>

        `;

        return;

    }


    /* =================================================
       TOKEN HISTORY
    ================================================= */

    tokenList.forEach(
        (item, index) => {

            const status =
                String(
                    item.status || ""
                ).toUpperCase();


            let statusHTML =
                escapeHTML(status);


            if (status === "ACTIVE") {

                statusHTML = `

                    <span
                        class="badge active">

                        ACTIVE

                    </span>

                `;

            }

            else if (
                status === "DISABLED"
            ) {

                statusHTML = `

                    <span
                        class="badge">

                        DISABLED

                    </span>

                `;

            }


            const disableButton =
                status === "ACTIVE"

                    ? `

                        <button
                            type="button"
                            class="btn"
                            onclick="disableExamToken('${escapeAttribute(item.token)}')">

                            Disable

                        </button>

                      `

                    : "";


            tbody.innerHTML += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        <b>
                            ${escapeHTML(
                                item.token
                            )}
                        </b>
                    </td>

                    <td>
                        ${escapeHTML(
                            item.kelas
                        )}
                    </td>

                    <td>
                        ${statusHTML}
                    </td>

                    <td>
                        ${escapeHTML(
                            item.expired
                        )}
                        minutes
                    </td>

                    <td>
                        ${formatDate(
                            item.createdAt
                        )}
                    </td>

                    <td>

                        ${disableButton}

                        <button
                            type="button"
                            class="btn delete"
                            onclick="deleteExamToken('${escapeAttribute(item.token)}')">

                            Delete

                        </button>

                    </td>

                </tr>

            `;

        }
    );

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

        const result =
            await apiDisableToken({

                token: token

            });


        console.log(
            "DISABLE TOKEN RESPONSE:",
            result
        );


        alert(

            result &&
            result.message

                ? result.message

                : "Token disabled."

        );


        if (
            result &&
            result.success === true
        ) {

            await loadToken();

        }

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

        const result =
            await apiDeleteToken({

                token: token

            });


        console.log(
            "DELETE TOKEN RESPONSE:",
            result
        );


        alert(

            result &&
            result.message

                ? result.message

                : "Token deleted."

        );


        if (
            result &&
            result.success === true
        ) {

            await loadToken();

        }

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
   ESCAPE HTML
===================================================== */

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


/* =====================================================
   ESCAPE ATTRIBUTE
===================================================== */

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

        return escapeHTML(value);

    }


    return escapeHTML(

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