/**
 * ==========================================
 * SAF Speaking Online Test
 * API Service
 * Version 2.0
 * ==========================================
 */

async function callAPI(action, data = {}) {

    const endpoint = {

        login: "login",

        insertQuestion: "question",

        getQuestion: "question",

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
        console.log("API :", action);
        console.log("STATUS :", response.status);
        console.log("RAW :", text);

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

        if (CONFIG.DEBUG) {

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

/**
 * ==========================================
 * Login
 * ==========================================
 */

async function apiLogin(username, password, role) {

    return await callAPI("login", {

        username,
        password,
        role

    });

}

/**
 * ==========================================
 * Teacher
 * ==========================================
 */

async function apiInsertQuestion(data) {

    return await callAPI("insertQuestion", data);

}

async function apiGetQuestion(data = {}) {

    return await callAPI("getQuestion", data);

}

/**
 * ==========================================
 * Student
 * ==========================================
 */

async function apiSaveScore(data) {

    return await callAPI("saveScore", data);

}