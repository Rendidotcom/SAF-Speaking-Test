/**
 * ==========================================
 * SAF Speaking Online Test
 * API Service
 * Version 2.0 (Stable Foundation)
 * ==========================================
 */

async function callAPI(action, data = {}) {

    const endpoint = {

        login: "login",

        insertQuestion: "question",
        getQuestion: "question",
        updateQuestion: "question",
        deleteQuestion: "question",

        saveScore: "score"

    };

    try {

        if (!endpoint[action]) {

            return {

                success: false,
                message: "Unknown API action: " + action

            };

        }

        const response = await fetch(`/api/${endpoint[action]}`, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                action: action,
                data: data

            })

        });

        const text = await response.text();

        console.log("=================================");
        console.log("API ACTION :", action);
        console.log("ENDPOINT   :", endpoint[action]);
        console.log("STATUS     :", response.status);
        console.log("RAW        :", text);
        console.log("=================================");

        let result;

        try {

            result = JSON.parse(text);

        } catch (err) {

            return {

                success: false,
                message: "Invalid JSON Response",
                raw: text

            };

        }

        if (typeof CONFIG !== "undefined" && CONFIG.DEBUG) {

            console.log("REQUEST");
            console.log(data);

            console.log("RESPONSE");
            console.log(result);

            console.log("=================================");

        }

        return result;

    } catch (err) {

        console.error(err);

        return {

            success: false,
            message: "Cannot connect to server.",
            error: err.message

        };

    }

}

/* =====================================================
   LOGIN
===================================================== */

async function apiLogin(username, password, role) {

    return await callAPI("login", {

        username,
        password,
        role

    });

}

/* =====================================================
   SPEAKING QUESTIONS
===================================================== */

async function apiInsertQuestion(data) {

    return await callAPI("insertQuestion", data);

}

async function apiGetQuestion(data = {}) {

    return await callAPI("getQuestion", data);

}

async function apiUpdateQuestion(data) {

    return await callAPI("updateQuestion", data);

}

async function apiDeleteQuestion(data) {

    return await callAPI("deleteQuestion", data);

}

/* =====================================================
   STUDENT
===================================================== */

async function apiSaveScore(data) {

    return await callAPI("saveScore", data);

}