/**
 * ==========================================
 * SAF Speaking Online Test
 * API Service
 * Version 1.0
 * ==========================================
 */

async function callAPI(action, data = {}) {

    try {

        const response = await fetch(CONFIG.API_URL, {

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

        console.log("STATUS :", response.status);
        console.log("RAW RESPONSE :", text);

        try {

            const result = JSON.parse(text);

            if (CONFIG.DEBUG) {

                console.log("=================================");
                console.log("API REQUEST");
                console.log(action);
                console.log(data);

                console.log("API RESPONSE");
                console.log(result);
                console.log("=================================");

            }

            return result;

        } catch (err) {

            return {
                success: false,
                message: "Invalid JSON Response",
                raw: text
            };

        }

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