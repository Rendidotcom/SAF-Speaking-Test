/**
 * ==========================================
 * SAF SPEAKING ONLINE TEST
 * Student Speaking Module
 *
 * File:
 * js/speaking.js
 *
 * ROLE:
 * - Student session
 * - Token validation
 * - Load question from Teacher
 * - Speech Recognition
 * - Transcript
 * - Submit answer
 *
 * ARCHITECTURE LOCKED
 *
 * speaking.html
 *      ↓
 * speaking.js
 *      ↓
 * /api
 *      ↓
 * Vercel API Gateway
 *      ↓
 * GAS Main.gs
 *      ↓
 * Question.gs / Score.gs
 *      ↓
 * Google Spreadsheet
 * ==========================================
 */

(function () {

    "use strict";


    /* ==========================================
       GLOBAL STATE
    ========================================== */

    let student = null;

    let currentToken = "";

    let currentQuestion = null;

    let recognition = null;

    let finalTranscript = "";

    let interimTranscript = "";

    let isRecording = false;

    let tokenVerified = false;


    /* ==========================================
       DOM HELPER
    ========================================== */

    function $(id) {

        return document.getElementById(id);

    }


    /* ==========================================
       SAFE TEXT
    ========================================== */

    function setText(id, value) {

        const element = $(id);

        if (!element) {
            return;
        }

        element.textContent =
            value === undefined ||
            value === null ||
            value === ""
                ? "-"
                : value;

    }


    /* ==========================================
       SHOW / HIDE EXAM AREA
    ========================================== */

    function showExamArea() {

        const area = $("examArea");

        if (area) {

            area.classList.remove("hidden");

        }

    }


    function hideExamArea() {

        const area = $("examArea");

        if (area) {

            area.classList.add("hidden");

        }

    }


    /* ==========================================
       STATUS
    ========================================== */

    function setStatus(message) {

        setText(
            "examStatus",
            message
        );

    }


    function setRecordStatus(message) {

        setText(
            "recordStatus",
            message
        );

    }


    /* ==========================================
       API REQUEST
       Browser
       ↓
       Vercel /api
       ========================================== */

    async function apiRequest(action, data) {

        console.log(
            "API REQUEST:",
            {
                action: action,
                data: data || {}
            }
        );


        const response =
            await fetch(
                "/api",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        action: action,
                        data: data || {}
                    })
                }
            );


        const text =
            await response.text();


        console.log(
            "API RAW RESPONSE:",
            text
        );


        let result;


        try {

            result =
                JSON.parse(text);

        }

        catch (error) {

            console.error(
                "API JSON PARSE ERROR:",
                error
            );

            throw new Error(
                "API returned invalid JSON."
            );

        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "API request failed."
            );

        }


        return result;

    }


    /* ==========================================
       LOAD STUDENT SESSION
    ========================================== */

    function loadStudentSession() {

        try {

            const raw =
                sessionStorage.getItem(
                    CONFIG.SESSION_KEY
                );


            if (!raw) {

                window.location.href =
                    "login.html?role=student";

                return false;

            }


            student =
                JSON.parse(raw);


            if (!student) {

                window.location.href =
                    "login.html?role=student";

                return false;

            }


            setText(
                "studentName",
                student.nama
            );


            setText(
                "studentClass",
                student.kelas
            );


            console.log(
                "STUDENT SESSION:",
                student
            );


            return true;

        }

        catch (error) {

            console.error(
                "STUDENT SESSION ERROR:",
                error
            );


            window.location.href =
                "login.html?role=student";


            return false;

        }

    }


    /* ==========================================
       VALIDATE TOKEN
       Student enters token manually
       ========================================== */

    async function validateToken() {

        const input =
            $("token");


        if (!input) {

            console.error(
                "Token input not found."
            );

            return;

        }


        const token =
            input.value
                .trim()
                .toUpperCase();


        if (!token) {

            alert(
                "Please enter an exam token."
            );

            return;

        }


        setStatus(
            "Checking Token..."
        );


        try {

            const result =
                await apiRequest(
                    "validateToken",
                    {
                        token: token
                    }
                );


            console.log(
                "VALIDATE TOKEN RESPONSE:",
                result
            );


            if (
                !result ||
                !result.success ||
                !result.valid
            ) {

                tokenVerified =
                    false;

                currentToken =
                    "";

                setStatus(
                    result &&
                    result.message
                        ? result.message
                        : "Token is not valid."
                );


                hideExamArea();


                return;

            }


            /* ==================================
               TOKEN VALID
            ================================== */

            currentToken =
                token;


            tokenVerified =
                true;


            /*
             * Save only AFTER
             * successful validation.
             */

            sessionStorage.setItem(
                CONFIG.TOKEN_KEY,
                token
            );


            setStatus(
                "Token Verified"
            );


            console.log(
                "TOKEN VERIFIED:",
                currentToken
            );


            /*
             * Load question created
             * from Teacher Dashboard.
             */

            await loadQuestion();

        }

        catch (error) {

            console.error(
                "TOKEN VALIDATION ERROR:",
                error
            );


            tokenVerified =
                false;


            currentToken =
                "";


            setStatus(
                error.message ||
                "Unable to validate token."
            );


            hideExamArea();

        }

    }


    /* ==========================================
       LOAD QUESTION
       FROM QUESTIONS SHEET
       ========================================== */

    async function loadQuestion() {

        setText(
            "question",
            "Loading question..."
        );


        try {

            const result =
                await apiRequest(
                    "getQuestion",
                    {}
                );


            console.log(
                "GET QUESTION RESPONSE:",
                result
            );


            if (
                !result ||
                !result.success
            ) {

                throw new Error(
                    result &&
                    result.message
                        ? result.message
                        : "Failed to load question."
                );

            }


            const questions =
                Array.isArray(result.data)
                    ? result.data
                    : [];


            /* ==================================
               ONLY ACTIVE QUESTIONS
            ================================== */

            const activeQuestions =
                questions.filter(
                    function (question) {

                        return String(
                            question.status || ""
                        )
                        .toUpperCase()
                        === "ACTIVE";

                    }
                );


            if (
                activeQuestions.length === 0
            ) {

                throw new Error(
                    "No active speaking question is available."
                );

            }


            /*
             * Stable foundation:
             *
             * Use the first ACTIVE question.
             *
             * Do not invent random
             * question selection.
             */

            currentQuestion =
                activeQuestions[0];


            /* ==================================
               DISPLAY QUESTION
            ================================== */

            setText(
                "question",
                currentQuestion.title
            );


            if ($("questionDifficulty")) {

                setText(
                    "questionDifficulty",
                    currentQuestion.difficulty
                );

            }


            if ($("questionDuration")) {

                setText(
                    "questionDuration",
                    currentQuestion.duration
                );

            }


            /* ==================================
               RESET ANSWER STATE
            ================================== */

            finalTranscript = "";

            interimTranscript = "";


            setText(
                "transcript",
                "Your transcript will appear here..."
            );


            setRecordStatus(
                "Ready"
            );


            showExamArea();


            console.log(
                "CURRENT QUESTION:",
                currentQuestion
            );

        }

        catch (error) {

            console.error(
                "LOAD QUESTION ERROR:",
                error
            );


            setText(
                "question",
                error.message ||
                "Question could not be loaded."
            );


            hideExamArea();

        }

    }


    /* ==========================================
       START RECORDING
    ========================================== */

    function startRecording() {

        if (!tokenVerified) {

            alert(
                "Please validate the exam token first."
            );

            return;

        }


        if (!currentQuestion) {

            alert(
                "Question is not available."
            );

            return;

        }


        if (
            !(
                "webkitSpeechRecognition"
                in window
            ) &&
            !(
                "SpeechRecognition"
                in window
            )
        ) {

            alert(
                "Speech Recognition is not supported in this browser."
            );

            return;

        }


        /*
         * Prevent duplicate recognition.
         */

        if (isRecording) {

            return;

        }


        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;


        recognition =
            new SpeechRecognition();


        recognition.lang =
            "en-US";


        recognition.continuous =
            true;


        recognition.interimResults =
            true;


        finalTranscript =
            "";

        interimTranscript =
            "";


        setText(
            "transcript",
            "Listening..."
        );


        recognition.onstart =
            function () {

                isRecording =
                    true;


                setRecordStatus(
                    "Recording..."
                );


                console.log(
                    "SPEECH RECOGNITION STARTED"
                );

            };


        recognition.onresult =
            function (event) {

                let finalText =
                    "";

                let interimText =
                    "";


                for (
                    let i = event.resultIndex;
                    i < event.results.length;
                    i++
                ) {

                    const transcript =
                        event.results[i][0]
                            .transcript;


                    if (
                        event.results[i]
                            .isFinal
                    ) {

                        finalText +=
                            transcript +
                            " ";

                    }

                    else {

                        interimText +=
                            transcript +
                            " ";

                    }

                }


                finalTranscript +=
                    finalText;


                interimTranscript =
                    interimText;


                const displayText =
                    (
                        finalTranscript +
                        interimTranscript
                    )
                    .trim();


                setText(
                    "transcript",
                    displayText ||
                    "Listening..."
                );


                console.log(
                    "TRANSCRIPT:",
                    displayText
                );

            };


        recognition.onerror =
            function (event) {

                console.error(
                    "SPEECH RECOGNITION ERROR:",
                    event
                );


                if (
                    event.error ===
                    "not-allowed"
                ) {

                    setRecordStatus(
                        "Microphone permission denied."
                    );

                    return;

                }


                if (
                    event.error ===
                    "no-speech"
                ) {

                    setRecordStatus(
                        "No speech detected."
                    );

                    return;

                }


                setRecordStatus(
                    "Recording error: " +
                    event.error
                );

            };


        recognition.onend =
            function () {

                isRecording =
                    false;


                if (
                    finalTranscript.trim()
                ) {

                    setRecordStatus(
                        "Finished"
                    );

                }
                else {

                    setRecordStatus(
                        "Ready"
                    );

                }


                console.log(
                    "SPEECH RECOGNITION ENDED"
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


            isRecording =
                false;


            setRecordStatus(
                "Unable to start recording."
            );

        }

    }


    /* ==========================================
       STOP RECORDING
    ========================================== */

    function stopRecording() {

        if (
            recognition &&
            isRecording
        ) {

            try {

                recognition.stop();

            }

            catch (error) {

                console.error(
                    "STOP RECORDING ERROR:",
                    error
                );

            }

        }


        isRecording =
            false;


        if (
            finalTranscript.trim()
        ) {

            setRecordStatus(
                "Finished"
            );

        }
        else {

            setRecordStatus(
                "Ready"
            );

        }

    }


    /* ==========================================
       GET TRANSCRIPT
    ========================================== */

    function getTranscript() {

        /*
         * Use the actual accumulated
         * final transcript first.
         */

        const transcript =
            (
                finalTranscript +
                interimTranscript
            )
            .trim();


        if (transcript) {

            return transcript;

        }


        /*
         * Fallback to DOM.
         */

        const element =
            $("transcript");


        if (
            element &&
            element.textContent &&
            element.textContent !==
                "Your transcript will appear here..."
        ) {

            return element
                .textContent
                .trim();

        }


        return "";

    }


    /* ==========================================
       SUBMIT ANSWER
       Browser
       ↓
       /api
       ↓
       Main.gs
       ↓
       saveScore()
       ========================================== */

    async function submitAnswer() {

        if (!tokenVerified) {

            alert(
                "Please validate the exam token first."
            );

            return;

        }


        if (!currentQuestion) {

            alert(
                "Question is not available."
            );

            return;

        }


        /*
         * Stop recording before submit.
         */

        if (isRecording) {

            stopRecording();

        }


        const transcript =
            getTranscript();


        if (!transcript) {

            alert(
                "Please record your answer first."
            );

            return;

        }


        /* ==================================
           BUILD SAVE SCORE PAYLOAD
        ================================== */

        const payload = {

            /*
             * Student
             */

            nis:
                student.nis || "",

            nama:
                student.nama || "",

            kelas:
                student.kelas || "",


            /*
             * Exam token
             */

            token:
                currentToken,


            /*
             * Question
             */

            questionId:
                currentQuestion.id || "",

            question:
                currentQuestion.title || "",


            /*
             * Student answer
             */

            transcript:
                transcript,


            /*
             * Timestamp
             */

            submittedAt:
                new Date().toISOString()

        };


        console.log(
            "SAVE SCORE REQUEST:",
            payload
        );


        try {

            const result =
                await apiRequest(
                    "saveScore",
                    payload
                );


            console.log(
                "SAVE SCORE RESPONSE:",
                result
            );


            if (
                !result ||
                !result.success
            ) {

                throw new Error(
                    result &&
                    result.message
                        ? result.message
                        : "Answer could not be saved."
                );

            }


            /* ==================================
               SUCCESS
            ================================== */

            setRecordStatus(
                "Answer submitted successfully."
            );


            setStatus(
                "Answer Submitted"
            );


            alert(
                result.message ||
                "Answer submitted successfully."
            );


            /*
             * Store backend result
             * if available.
             */

            if (
                result.resultId
            ) {

                sessionStorage.setItem(
                    "SAF_LAST_RESULT",
                    JSON.stringify(result)
                );

            }


            console.log(
                "ANSWER SUBMITTED SUCCESSFULLY"
            );

        }

        catch (error) {

            console.error(
                "SUBMIT ANSWER ERROR:",
                error
            );


            alert(
                error.message ||
                "Failed to submit answer."
            );

        }

    }


    /* ==========================================
       INITIALIZE
    ========================================== */

    function init() {

        /*
         * CONFIG must already be loaded
         * before speaking.js.
         */

        if (
            typeof CONFIG ===
            "undefined"
        ) {

            console.error(
                "CONFIG is not defined."
            );

            return;

        }


        hideExamArea();


        /* ==================================
           LOAD STUDENT SESSION
        ================================== */

        if (
            !loadStudentSession()
        ) {

            return;

        }


        /* ==================================
           IMPORTANT TOKEN BEHAVIOR
        ==================================

         * DO NOT restore an old token.
         *
         * Every new visit to speaking.html
         * starts with an empty token field.
         *
         * Student must enter the token
         * provided by Teacher Dashboard.
         */

        const input =
            $("token");


        if (input) {

            input.value =
                "";

        }


        /*
         * Remove stale token from
         * previous exam session.
         */

        sessionStorage.removeItem(
            CONFIG.TOKEN_KEY
        );


        /*
         * Reset state.
         */

        currentToken =
            "";

        tokenVerified =
            false;

        currentQuestion =
            null;

        finalTranscript =
            "";

        interimTranscript =
            "";

        isRecording =
            false;


        setStatus(
            "Waiting Token"
        );


        setRecordStatus(
            "Ready"
        );


        setText(
            "question",
            "Waiting for valid token..."
        );


        setText(
            "transcript",
            "Your transcript will appear here..."
        );


        console.log(
            "SPEAKING MODULE INITIALIZED"
        );

    }


    /* ==========================================
       GLOBAL FUNCTIONS
       speaking.html uses onclick=""
       ========================================== */

    window.validateToken =
        validateToken;


    window.startRecording =
        startRecording;


    window.stopRecording =
        stopRecording;


    window.submitAnswer =
        submitAnswer;


    /* ==========================================
       DOM READY
    ========================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    }

    else {

        init();

    }


})();