/**
 * ==========================================
 * SAF SPEAKING ONLINE TEST
 * SPEAKING MODULE
 * File: js/speaking.js
 * ==========================================
 *
 * ROLE:
 * - Load student session
 * - Display student information
 * - Validate exam token
 * - Load speaking question
 * - Speech Recognition
 * - Display transcript
 * - Submit answer
 * - Save answer through /api
 *
 * STABLE FRONTEND FOUNDATION
 * ==========================================
 */


/* ==========================================
   GLOBAL STATE
========================================== */

let recognition = null;

let isRecording = false;

let currentToken = "";

let currentQuestion =
    "Introduce yourself and tell us about your hobby.";


/* ==========================================
   STUDENT SESSION
========================================== */

const user = JSON.parse(
    sessionStorage.getItem(CONFIG.SESSION_KEY) || "{}"
);


/* ==========================================
   PAGE INITIALIZATION
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* --------------------------------------
       CHECK LOGIN
    -------------------------------------- */

    if (!user || !user.nama) {

        location.href = "login.html?role=student";

        return;
    }


    /* --------------------------------------
       DISPLAY STUDENT
    -------------------------------------- */

    const studentName =
        document.getElementById("studentName");

    const studentClass =
        document.getElementById("studentClass");


    if (studentName) {

        studentName.textContent =
            user.nama || "-";

    }


    if (studentClass) {

        studentClass.textContent =
            user.kelas || "-";

    }


    /* --------------------------------------
       INITIAL STATUS
    -------------------------------------- */

    setExamStatus("Waiting Token");

    setRecordStatus("Ready");


    /* --------------------------------------
       INITIAL QUESTION
    -------------------------------------- */

    const question =
        document.getElementById("question");

    if (question) {

        question.textContent =
            currentQuestion;

    }

});


/* ==========================================
   EXAM STATUS
========================================== */

function setExamStatus(status) {

    const element =
        document.getElementById("examStatus");

    if (element) {

        element.textContent = status;

    }

}


/* ==========================================
   RECORD STATUS
========================================== */

function setRecordStatus(status) {

    const element =
        document.getElementById("recordStatus");

    if (element) {

        element.textContent = status;

    }

}


/* ==========================================
   TRANSCRIPT
========================================== */

function setTranscript(text) {

    const element =
        document.getElementById("transcript");

    if (element) {

        element.textContent =
            text || "";

    }

}


/* ==========================================
   GET TRANSCRIPT
========================================== */

function getTranscript() {

    const element =
        document.getElementById("transcript");

    if (!element) {

        return "";

    }

    return element.textContent.trim();

}


/* ==========================================
   VALIDATE TOKEN
========================================== */

async function validateToken() {

    const input =
        document.getElementById("token");


    if (!input) {

        return;

    }


    const token =
        input.value.trim();


    if (!token) {

        alert("Token required");

        return;

    }


    try {

        setExamStatus("Validating Token...");


        const response =
            await fetch("/api", {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    action: "validateToken",

                    data: {

                        token: token

                    }

                })

            });


        const result =
            await response.json();


        console.log(
            "VALIDATE TOKEN RESPONSE:",
            result
        );


        if (
            !result ||
            result.success !== true ||
            result.valid !== true
        ) {

            setExamStatus("Invalid Token");

            alert(
                result &&
                result.message
                    ? result.message
                    : "Token tidak valid."
            );

            return;

        }


        /* ----------------------------------
           TOKEN VERIFIED
        ---------------------------------- */

        currentToken = token;


        setExamStatus("Token Verified");


        /* ----------------------------------
           QUESTION
        ---------------------------------- */

        if (result.question) {

            currentQuestion =
                result.question;

        }


        const question =
            document.getElementById("question");


        if (question) {

            question.textContent =
                currentQuestion;

        }


        /* ----------------------------------
           SHOW EXAM AREA
        ---------------------------------- */

        const examArea =
            document.getElementById("examArea");


        if (examArea) {

            examArea.classList.remove("hidden");

        }


    }

    catch (error) {

        console.error(
            "VALIDATE TOKEN ERROR:",
            error
        );


        setExamStatus(
            "Connection Error"
        );


        alert(
            "Gagal menghubungi server."
        );

    }

}


/* ==========================================
   START RECORDING
========================================== */

function startRecording() {

    if (
        !("webkitSpeechRecognition" in window)
    ) {

        alert(
            "Speech Recognition not supported"
        );

        return;

    }


    /* --------------------------------------
       STOP EXISTING RECOGNITION
    -------------------------------------- */

    if (recognition) {

        try {

            recognition.stop();

        }

        catch (error) {

            console.warn(
                "Recognition stop warning:",
                error
            );

        }

    }


    /* --------------------------------------
       CREATE RECOGNITION
    -------------------------------------- */

    recognition =
        new webkitSpeechRecognition();


    recognition.lang =
        "en-US";


    recognition.continuous =
        true;


    recognition.interimResults =
        true;


    /* --------------------------------------
       RESULT
    -------------------------------------- */

    recognition.onresult =
        function (event) {

            let text = "";


            for (
                let i = 0;
                i < event.results.length;
                i++
            ) {

                text +=
                    event.results[i][0]
                        .transcript + " ";

            }


            setTranscript(
                text.trim()
            );

        };


    /* --------------------------------------
       START
    -------------------------------------- */

    recognition.onstart =
        function () {

            isRecording = true;

            setRecordStatus(
                "Recording..."
            );

        };


    /* --------------------------------------
       END
    -------------------------------------- */

    recognition.onend =
        function () {

            isRecording = false;

            /*
             * Do not automatically restart.
             * This preserves the current
             * Start / Stop behavior.
             */

            setRecordStatus(
                "Finished"
            );

        };


    /* --------------------------------------
       ERROR
    -------------------------------------- */

    recognition.onerror =
        function (event) {

            console.error(
                "Speech Recognition Error:",
                event
            );


            isRecording = false;


            setRecordStatus(
                "Recording Error"
            );

        };


    try {

        recognition.start();

    }

    catch (error) {

        console.error(
            "START RECORDING ERROR:",
            error
        );


        setRecordStatus(
            "Unable to Start"
        );

    }

}


/* ==========================================
   STOP RECORDING
========================================== */

function stopRecording() {

    if (recognition) {

        try {

            recognition.stop();

        }

        catch (error) {

            console.warn(
                "STOP RECORDING WARNING:",
                error
            );

        }

    }


    isRecording = false;


    setRecordStatus(
        "Finished"
    );

}


/* ==========================================
   BUILD SAVE DATA
========================================== */

function buildAnswerData() {

    return {

        /* Student */

        nis:
            user.nis || "",

        nama:
            user.nama || "",

        kelas:
            user.kelas || "",


        /* Exam */

        token:
            currentToken ||
            (
                document.getElementById("token")
                    ? document
                        .getElementById("token")
                        .value
                        .trim()
                    : ""
            ),


        /* Question */

        question:
            currentQuestion || "",


        /* Answer */

        transcript:
            getTranscript(),


        /* Time */

        submittedAt:
            new Date().toISOString()

    };

}


/* ==========================================
   SUBMIT ANSWER
========================================== */

async function submitAnswer() {

    const transcript =
        getTranscript();


    /* --------------------------------------
       VALIDATE TOKEN
    -------------------------------------- */

    if (!currentToken) {

        const tokenInput =
            document.getElementById("token");


        currentToken =
            tokenInput
                ? tokenInput.value.trim()
                : "";

    }


    if (!currentToken) {

        alert(
            "Please validate the exam token first."
        );

        return;

    }


    /* --------------------------------------
       VALIDATE TRANSCRIPT
    -------------------------------------- */

    if (
        !transcript ||
        transcript ===
            "Your transcript will appear here..."
    ) {

        alert(
            "Please record your answer first."
        );

        return;

    }


    /* --------------------------------------
       STOP RECORDING
    -------------------------------------- */

    if (isRecording) {

        stopRecording();

    }


    /* --------------------------------------
       STATUS
    -------------------------------------- */

    setRecordStatus(
        "Submitting..."
    );


    const data =
        buildAnswerData();


    console.log(
        "SAVE SCORE REQUEST:",
        data
    );


    try {

        /* ----------------------------------
           API REQUEST
        ---------------------------------- */

        const response =
            await fetch("/api", {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    action: "saveScore",

                    data: data

                })

            });


        console.log(
            "SAVE SCORE STATUS:",
            response.status
        );


        const result =
            await response.json();


        console.log(
            "SAVE SCORE RESPONSE:",
            result
        );


        /* ----------------------------------
           SUCCESS
        ---------------------------------- */

        if (
            result &&
            result.success === true
        ) {

            setRecordStatus(
                "Submitted"
            );


            setExamStatus(
                "Answer Saved"
            );


            alert(
                result.message ||
                "Answer submitted successfully."
            );


            return;

        }


        /* ----------------------------------
           BACKEND ERROR
        ---------------------------------- */

        setRecordStatus(
            "Submit Failed"
        );


        alert(
            result &&
            result.message
                ? result.message
                : "Failed to save answer."
        );

    }

    catch (error) {

        console.error(
            "SUBMIT ANSWER ERROR:",
            error
        );


        setRecordStatus(
            "Connection Error"
        );


        alert(
            "Failed to connect to the server."
        );

    }

}


/* ==========================================
   EXPORT / GLOBAL FUNCTIONS
   ==========================================
 *
 * Functions intentionally remain global
 * because speaking.html uses:
 *
 * onclick="validateToken()"
 * onclick="startRecording()"
 * onclick="stopRecording()"
 * onclick="submitAnswer()"
 *
 * ==========================================
 */