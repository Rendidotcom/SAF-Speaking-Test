/**
 * =========================================================
 * SAF SPEAKING ONLINE TEST
 * Student Speaking Module
 *
 * File:
 * js/speaking.js
 *
 * ROLE:
 * - Student session
 * - Exam token
 * - Token validation
 * - Load ACTIVE question from Questions Sheet
 * - Speech Recognition
 * - Transcript
 * - Submit answer
 *
 * LOCKED ARCHITECTURE
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
 * Question.gs / Token.gs / Score.gs
 *      ↓
 * Google Spreadsheet
 *
 * IMPORTANT:
 * Browser NEVER calls GAS functions directly.
 * Browser communicates only through /api.
 * =========================================================
 */

(function () {

    "use strict";


    /* =====================================================
       GLOBAL STATE
    ===================================================== */

    let student = null;

    let currentToken = "";

    let currentQuestion = null;

    let recognition = null;

    let finalTranscript = "";

    let interimTranscript = "";

    let isRecording = false;

    let tokenVerified = false;

    let isSubmitting = false;


    /* =====================================================
       DOM HELPER
    ===================================================== */

    function $(id) {

        return document.getElementById(id);

    }


    /* =====================================================
       SAFE TEXT
    ===================================================== */

    function setText(id, value) {

        const element = $(id);

        if (!element) {
            return;
        }

        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {

            element.textContent = "-";

            return;

        }

        element.textContent = String(value);

    }


    /* =====================================================
       SHOW EXAM AREA
    ===================================================== */

    function showExamArea() {

        const area = $("examArea");

        if (area) {

            area.classList.remove("hidden");

        }

    }


    /* =====================================================
       HIDE EXAM AREA
    ===================================================== */

    function hideExamArea() {

        const area = $("examArea");

        if (area) {

            area.classList.add("hidden");

        }

    }


    /* =====================================================
       EXAM STATUS
    ===================================================== */

    function setExamStatus(message) {

        setText(
            "examStatus",
            message
        );

    }


    /* =====================================================
       RECORD STATUS
    ===================================================== */

    function setRecordStatus(message) {

        setText(
            "recordStatus",
            message
        );

    }


    /* =====================================================
       CONFIG TOKEN KEY
       Safe fallback
    ===================================================== */

    function getTokenKey() {

        if (
            typeof CONFIG !== "undefined" &&
            CONFIG &&
            CONFIG.TOKEN_KEY
        ) {

            return CONFIG.TOKEN_KEY;

        }

        return "SAF_TOKEN";

    }


    /* =====================================================
       SESSION KEY
       Safe fallback
    ===================================================== */

    function getSessionKey() {

        if (
            typeof CONFIG !== "undefined" &&
            CONFIG &&
            CONFIG.SESSION_KEY
        ) {

            return CONFIG.SESSION_KEY;

        }

        return "SAF_SESSION";

    }


    /* =====================================================
       API REQUEST
       Browser → Vercel /api
    ===================================================== */

    async function apiRequest(action, data) {

        const response = await fetch(
            "/api",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    action: action,

                    data: data || {}

                })

            }
        );


        const text =
            await response.text();


        let result;


        try {

            result =
                JSON.parse(text);

        }

        catch (error) {

            console.error(
                "INVALID API JSON:",
                text
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


    /* =====================================================
       LOAD STUDENT SESSION
    ===================================================== */

    function loadStudentSession() {

        try {

            const raw =
                sessionStorage.getItem(
                    getSessionKey()
                );


            if (!raw) {

                window.location.href =
                    "login.html?role=student";

                return false;

            }


            student =
                JSON.parse(raw);


            if (
                !student ||
                typeof student !== "object"
            ) {

                sessionStorage.removeItem(
                    getSessionKey()
                );


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


            sessionStorage.removeItem(
                getSessionKey()
            );


            window.location.href =
                "login.html?role=student";


            return false;

        }

    }


    /* =====================================================
       GET STORED TOKEN
    ===================================================== */

    function getStoredToken() {

        try {

            const token =
                sessionStorage.getItem(
                    getTokenKey()
                );


            if (!token) {

                return "";

            }


            return String(token)
                .trim()
                .toUpperCase();

        }

        catch (error) {

            console.error(
                "GET STORED TOKEN ERROR:",
                error
            );

            return "";

        }

    }


    /* =====================================================
       SAVE TOKEN
    ===================================================== */

    function saveToken(token) {

        try {

            sessionStorage.setItem(
                getTokenKey(),
                token
            );

        }

        catch (error) {

            console.error(
                "SAVE TOKEN ERROR:",
                error
            );

        }

    }


    /* =====================================================
       CLEAR TOKEN
    ===================================================== */

    function clearToken() {

        try {

            sessionStorage.removeItem(
                getTokenKey()
            );

        }

        catch (error) {

            console.error(
                "CLEAR TOKEN ERROR:",
                error
            );

        }


        currentToken = "";

        tokenVerified = false;

    }


    /* =====================================================
       VALIDATE TOKEN
    ===================================================== */

    async function validateToken(tokenFromRestore) {

        const input =
            $("token");


        /*
         * If called from HTML button:
         * read token from input.
         *
         * If called during restore:
         * use tokenFromRestore.
         */

        let token;


        if (tokenFromRestore) {

            token =
                String(tokenFromRestore)
                    .trim()
                    .toUpperCase();

        }

        else {

            if (!input) {

                console.error(
                    "Token input not found."
                );

                return;

            }


            token =
                input.value
                    .trim()
                    .toUpperCase();

        }


        /* =================================================
           EMPTY TOKEN
        ================================================= */

        if (!token) {

            tokenVerified = false;

            currentToken = "";

            setExamStatus(
                "Waiting Token"
            );


            hideExamArea();


            if (!tokenFromRestore) {

                alert(
                    "Please enter an exam token."
                );

            }


            return;

        }


        /*
         * Keep normalized token in input.
         */

        if (input) {

            input.value = token;

        }


        /*
         * IMPORTANT:
         * Never assume token is valid
         * merely because it exists.
         */

        tokenVerified = false;

        currentToken = "";


        setExamStatus(
            "Checking Token..."
        );


        hideExamArea();


        try {

            console.log(
                "VALIDATE TOKEN REQUEST:",
                {
                    token: token
                }
            );


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


            /*
             * Backend must explicitly confirm:
             *
             * success === true
             * valid === true
             */

            if (
                !result ||
                result.success !== true ||
                result.valid !== true
            ) {

                tokenVerified = false;

                currentToken = "";


                /*
                 * Invalid token must not
                 * remain stored.
                 */

                clearToken();


                setExamStatus(
                    result &&
                    result.message
                        ? result.message
                        : "Token tidak valid."
                );


                hideExamArea();


                if (!tokenFromRestore) {

                    alert(
                        result &&
                        result.message
                            ? result.message
                            : "Token tidak valid."
                    );

                }


                return false;

            }


            /* =================================================
               TOKEN IS REALLY VALID
            ================================================= */

            currentToken =
                token;


            tokenVerified =
                true;


            /*
             * Save only after backend
             * confirms token validity.
             */

            saveToken(
                currentToken
            );


            /*
             * Keep input synchronized.
             */

            if (input) {

                input.value =
                    currentToken;

            }


            setExamStatus(
                "Token Verified"
            );


            console.log(
                "TOKEN VERIFIED:",
                currentToken
            );


            /*
             * Load question only AFTER
             * token is successfully verified.
             */

            const questionLoaded =
                await loadQuestion();


            if (!questionLoaded) {

                tokenVerified = false;

                currentQuestion = null;

                setExamStatus(
                    "Question unavailable"
                );

                hideExamArea();

                return false;

            }


            /*
             * Everything is ready.
             */

            showExamArea();


            setExamStatus(
                "Token Verified"
            );


            setRecordStatus(
                "Ready"
            );


            return true;

        }

        catch (error) {

            console.error(
                "TOKEN VALIDATION ERROR:",
                error
            );


            tokenVerified = false;

            currentToken = "";


            setExamStatus(
                error.message ||
                "Unable to validate token."
            );


            hideExamArea();


            /*
             * Do not remove stored token
             * during temporary network/API errors.
             *
             * It may still be valid.
             */

            if (!tokenFromRestore) {

                alert(
                    error.message ||
                    "Unable to validate token."
                );

            }


            return false;

        }

    }


    /* =====================================================
       LOAD QUESTION
       Main.gs → Question.gs → Questions Sheet
    ===================================================== */

    async function loadQuestion() {

        currentQuestion = null;


        setText(
            "question",
            "Loading question..."
        );


        try {

            console.log(
                "GET QUESTION REQUEST"
            );


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
                result.success !== true
            ) {

                throw new Error(
                    result &&
                    result.message
                        ? result.message
                        : "Failed to load question."
                );

            }


            /*
             * Backend response:
             *
             * {
             *   success: true,
             *   data: [...]
             * }
             */

            const questions =
                Array.isArray(result.data)
                    ? result.data
                    : [];


            /*
             * Only ACTIVE questions.
             */

            const activeQuestions =
                questions.filter(
                    function (question) {

                        return (
                            question &&
                            String(
                                question.status || ""
                            )
                                .trim()
                                .toUpperCase()
                            === "ACTIVE"
                        );

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
             * use the first ACTIVE question.
             *
             * No randomization.
             * No invented question.
             * No hardcoded question.
             */

            currentQuestion =
                activeQuestions[0];


            /*
             * Display question title
             * exactly from Questions Sheet.
             */

            setText(
                "question",
                currentQuestion.title
            );


            /*
             * Optional HTML fields.
             * These do not affect the
             * locked architecture.
             */

            if (
                $("questionDifficulty")
            ) {

                setText(
                    "questionDifficulty",
                    currentQuestion.difficulty
                );

            }


            if (
                $("questionDuration")
            ) {

                setText(
                    "questionDuration",
                    currentQuestion.duration
                );

            }


            console.log(
                "CURRENT ACTIVE QUESTION:",
                currentQuestion
            );


            return true;

        }

        catch (error) {

            console.error(
                "LOAD QUESTION ERROR:",
                error
            );


            currentQuestion = null;


            setText(
                "question",
                error.message ||
                "Question could not be loaded."
            );


            return false;

        }

    }


    /* =====================================================
       START RECORDING
    ===================================================== */

    function startRecording() {

        /*
         * CRITICAL:
         *
         * Check the INTERNAL state,
         * not the text displayed on screen.
         */

        if (
            tokenVerified !== true ||
            !currentToken
        ) {

            setExamStatus(
                "Waiting Token"
            );


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
         * Browser compatibility.
         */

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;


        if (!SpeechRecognition) {

            alert(
                "Speech Recognition is not supported in this browser."
            );


            setRecordStatus(
                "Speech Recognition not supported."
            );


            return;

        }


        /*
         * Prevent duplicate recording.
         */

        if (isRecording) {

            return;

        }


        /*
         * Create fresh recognition object.
         */

        recognition =
            new SpeechRecognition();


        recognition.lang =
            "en-US";


        recognition.continuous =
            true;


        recognition.interimResults =
            true;


        recognition.maxAlternatives =
            1;


        /*
         * Reset transcript.
         */

        finalTranscript = "";

        interimTranscript = "";


        setText(
            "transcript",
            "Listening..."
        );


        setRecordStatus(
            "Starting..."
        );


        /* =================================================
           ON START
        ================================================= */

        recognition.onstart =
            function () {

                isRecording = true;


                setRecordStatus(
                    "Recording..."
                );


                console.log(
                    "SPEECH RECOGNITION STARTED"
                );

            };


        /* =================================================
           ON RESULT
        ================================================= */

        recognition.onresult =
            function (event) {

                let newFinalText = "";

                let newInterimText = "";


                for (
                    let i = event.resultIndex;
                    i < event.results.length;
                    i++
                ) {

                    const transcript =
                        event.results[i][0]
                            .transcript;


                    if (
                        event.results[i].isFinal
                    ) {

                        newFinalText +=
                            transcript + " ";

                    }

                    else {

                        newInterimText +=
                            transcript + " ";

                    }

                }


                /*
                 * Add only newly finalized text.
                 */

                if (
                    newFinalText
                ) {

                    finalTranscript +=
                        newFinalText;

                }


                interimTranscript =
                    newInterimText;


                const displayText =
                    (
                        finalTranscript +
                        interimTranscript
                    ).trim();


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


        /* =================================================
           ON ERROR
        ================================================= */

        recognition.onerror =
            function (event) {

                console.error(
                    "SPEECH RECOGNITION ERROR:",
                    event
                );


                isRecording = false;


                let message =
                    "Recording error.";


                switch (
                    event.error
                ) {

                    case "not-allowed":

                        message =
                            "Microphone permission denied.";

                        break;


                    case "audio-capture":

                        message =
                            "Microphone could not be accessed.";

                        break;


                    case "no-speech":

                        message =
                            "No speech detected.";

                        break;


                    case "network":

                        message =
                            "Speech Recognition network error.";

                        break;


                    case "aborted":

                        message =
                            "Recording stopped.";

                        break;


                    default:

                        message =
                            "Recording error: " +
                            event.error;

                        break;

                }


                setRecordStatus(
                    message
                );

            };


        /* =================================================
           ON END
        ================================================= */

        recognition.onend =
            function () {

                isRecording = false;


                /*
                 * Clear interim because recording
                 * has ended.
                 */

                interimTranscript = "";


                const finalText =
                    finalTranscript.trim();


                if (finalText) {

                    setText(
                        "transcript",
                        finalText
                    );


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


        /* =================================================
           START
        ================================================= */

        try {

            recognition.start();

        }

        catch (error) {

            console.error(
                "START RECORDING ERROR:",
                error
            );


            isRecording = false;


            setRecordStatus(
                "Unable to start recording."
            );


            alert(
                "Unable to start recording."
            );

        }

    }


    /* =====================================================
       STOP RECORDING
    ===================================================== */

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


        isRecording = false;


        /*
         * If recognition does not fire onend,
         * still show current final transcript.
         */

        const text =
            finalTranscript.trim();


        if (text) {

            setText(
                "transcript",
                text
            );


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


    /* =====================================================
       GET FINAL TRANSCRIPT
    ===================================================== */

    function getTranscript() {

        /*
         * Prefer internal final transcript.
         */

        const internal =
            finalTranscript
                .trim();


        if (internal) {

            return internal;

        }


        /*
         * Fallback to DOM.
         */

        const element =
            $("transcript");


        if (!element) {

            return "";

        }


        const text =
            element.textContent
                .trim();


        if (
            !text ||
            text ===
                "Your transcript will appear here..."
        ) {

            return "";

        }


        if (
            text ===
                "Listening..."
        ) {

            return "";

        }


        return text;

    }


    /* =====================================================
       SUBMIT ANSWER
    ===================================================== */

    async function submitAnswer() {

        /*
         * Prevent double submit.
         */

        if (isSubmitting) {

            return;

        }


        /*
         * Token must really be verified.
         */

        if (
            tokenVerified !== true ||
            !currentToken
        ) {

            alert(
                "Please validate the exam token first."
            );


            return;

        }


        /*
         * Question must exist.
         */

        if (!currentQuestion) {

            alert(
                "Question is not available."
            );


            return;

        }


        /*
         * Student session must exist.
         */

        if (
            !student
        ) {

            alert(
                "Student session not found."
            );


            window.location.href =
                "login.html?role=student";


            return;

        }


        /*
         * Stop recording first.
         */

        if (isRecording) {

            stopRecording();

        }


        /*
         * Give browser recognition a moment
         * to finalize the last result.
         */

        await new Promise(
            function (resolve) {

                setTimeout(
                    resolve,
                    150
                );

            }
        );


        const transcript =
            getTranscript();


        if (!transcript) {

            alert(
                "Please record your answer first."
            );


            return;

        }


        /*
         * Build payload.
         */

        const payload = {

            /* Student */

            nis:
                student.nis || "",

            nama:
                student.nama || "",

            kelas:
                student.kelas || "",


            /* Token */

            token:
                currentToken,


            /* Question */

            questionId:
                currentQuestion.id || "",

            question:
                currentQuestion.title || "",


            /* Answer */

            transcript:
                transcript,


            /* Time */

            submittedAt:
                new Date().toISOString()

        };


        console.log(
            "SAVE SCORE REQUEST:",
            payload
        );


        isSubmitting = true;


        setRecordStatus(
            "Submitting..."
        );


        try {

            /*
             * Browser → Vercel → Main.gs
             */

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
                result.success !== true
            ) {

                throw new Error(
                    result &&
                    result.message
                        ? result.message
                        : "Answer could not be saved."
                );

            }


            /*
             * SUCCESS
             */

            setRecordStatus(
                "Answer submitted successfully."
            );


            setExamStatus(
                "Answer Submitted"
            );


            /*
             * Save latest result locally
             * if backend returns one.
             */

            try {

                sessionStorage.setItem(
                    "SAF_LAST_RESULT",
                    JSON.stringify(result)
                );

            }

            catch (storageError) {

                console.warn(
                    "Could not save SAF_LAST_RESULT:",
                    storageError
                );

            }


            alert(
                result.message ||
                "Answer submitted successfully."
            );

        }

        catch (error) {

            console.error(
                "SUBMIT ANSWER ERROR:",
                error
            );


            setRecordStatus(
                "Submission failed."
            );


            alert(
                error.message ||
                "Failed to submit answer."
            );

        }

        finally {

            isSubmitting = false;

        }

    }


    /* =====================================================
       RESTORE SAVED TOKEN
    ===================================================== */

    async function restoreSavedToken() {

        const savedToken =
            getStoredToken();


        if (!savedToken) {

            return;

        }


        const input =
            $("token");


        if (input) {

            input.value =
                savedToken;

        }


        /*
         * IMPORTANT:
         *
         * A stored token is NOT automatically
         * considered verified.
         *
         * We revalidate it against backend.
         */

        setExamStatus(
            "Checking Token..."
        );


        await validateToken(
            savedToken
        );

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    async function init() {

        console.log(
            "SAF SPEAKING PAGE INITIALIZING..."
        );


        /*
         * Reset state.
         */

        tokenVerified = false;

        currentToken = "";

        currentQuestion = null;

        recognition = null;

        finalTranscript = "";

        interimTranscript = "";

        isRecording = false;

        isSubmitting = false;


        /*
         * CONFIG is normally loaded by:
         *
         * <script src="js/config.js"></script>
         *
         */

        if (
            typeof CONFIG ===
            "undefined"
        ) {

            console.error(
                "CONFIG is not defined."
            );


            alert(
                "System configuration could not be loaded."
            );


            return;

        }


        /*
         * Student must be logged in.
         */

        const sessionOK =
            loadStudentSession();


        if (!sessionOK) {

            return;

        }


        /*
         * Initial UI.
         */

        hideExamArea();


        setExamStatus(
            "Waiting Token"
        );


        setRecordStatus(
            "Ready"
        );


        /*
         * Restore token if it exists.
         *
         * It will be revalidated against
         * the backend before becoming verified.
         */

        await restoreSavedToken();


        console.log(
            "SAF SPEAKING PAGE READY"
        );

    }


    /* =====================================================
       GLOBAL FUNCTIONS
       ===================================================== */

    /*
     * speaking.html uses:
     *
     * onclick="validateToken()"
     * onclick="startRecording()"
     * onclick="stopRecording()"
     * onclick="submitAnswer()"
     */

    window.validateToken =
        validateToken;


    window.startRecording =
        startRecording;


    window.stopRecording =
        stopRecording;


    window.submitAnswer =
        submitAnswer;


    /* =====================================================
       DOM READY
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            function () {

                init();

            }
        );

    }

    else {

        init();

    }


})();