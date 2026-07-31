/**
 * ==========================================
 * SAF Speaking Online Test
 * API Service
 * Stable Foundation v3.0
 * Backend : Google Apps Script
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

        console.log("=================================");
        console.log("ACTION :", action);
        console.log("STATUS :", response.status);
        console.log("RAW RESPONSE:");
        console.log(text);
        console.log("=================================");

        let result;

        try {

            result = JSON.parse(text);

        }

        catch (err) {

            return {

                success: false,

                message: "Invalid JSON response.",

                raw: text

            };

        }

        /* -----------------------------------------
           Safety
        ----------------------------------------- */

        if (typeof result.success === "undefined") {

            result.success = false;

        }

        if (!result.message) {

            result.message = result.success

                ? "Success"

                : "Unknown server response.";

        }

        if (CONFIG.DEBUG) {

            console.log("REQUEST");

            console.log({

                action,

                data

            });

            console.log("RESPONSE");

            console.log(result);

            console.log("=================================");

        }

        return result;

    }

    catch (err) {

        console.error(err);

        return {

            success: false,

            message: "Cannot connect to Google Apps Script.",

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
   QUESTION
===================================================== */

async function apiInsertQuestion(data) {

    return await callAPI("insertQuestion", data);

}

async function apiGetQuestion() {

    return await callAPI("getQuestion");

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

async function apiInsertStudent(data) {

    return await callAPI("insertStudent", data);

}

async function apiGetStudent() {

    return await callAPI("getStudent");

}

async function apiUpdateStudent(data) {

    return await callAPI("updateStudent", data);

}

async function apiDeleteStudent(data) {

    return await callAPI("deleteStudent", data);

}

/* =====================================================
   SCORE
===================================================== */

async function apiSaveScore(data) {

    return await callAPI("saveScore", data);

}
async function api(data){

const response=await fetch(CONFIG.API_URL,{

method:"POST",

body:JSON.stringify(data)

});

return await response.json();

}