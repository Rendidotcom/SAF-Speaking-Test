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
 * Question.gs
 *      ↓
 * Questions Sheet
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
       SHOW / HIDE
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

        setText("examStatus", message);

    }


    function setRecordStatus(message) {

        setText("recordStatus", message);

    }


    /* ==========================================
       API REQUEST
       Directly through Vercel /api
       ========================================== */

    async function apiRequest(action, data) {

        const response = await fetch("/api", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                action: action,

                data: data || {}

            })

        });


        const text =
            await response.text();


        let result;


        try {

            result =
                JSON.parse(text);

        }

        catch (error) {

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
    ========================================== */

    async function validateToken() {

        const input =
            $("token");


        if (!input) {

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

                tokenVerified = false;

                setStatus(
                    result.message ||
                    "Token is not valid."
                );

                hideExamArea();

                return;

            }


            currentToken =
                token;


            tokenVerified = true;


            sessionStorage.setItem(
                CONFIG.TOKEN_KEY,
                token
            );


            setStatus(
                "Token Verified"
            );


            await loadQuestion();

        }

        catch (error) {

            console.error(
                "TOKEN VALIDATION ERROR:",
                error
            );


            tokenVerified = false;


            setStatus(
                error.message ||
                "Unable to validate token."
            );


            hideExamArea();

        }

    }


    /* ==========================================
       LOAD QUESTION
       FROM TEACHER / QUESTIONS SHEET
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
                    result.message ||
                    "Failed to load question."
                );

            }


            const questions =
                Array.isArray(result.data)
                    ? result.data
                    : [];


            /*
             * Only ACTIVE questions
             */

            const activeQuestions =
                questions.filter(
                    function (question) {

                        return String(
                            question.status || ""
                        ).toUpperCase()
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
             * Current foundation:
             * use the first ACTIVE question.
             *
             * We do NOT invent a new question
             * selection system.
             */

            currentQuestion =
                activeQuestions[0];


            /*
             * Store only necessary
             * question information.
             */

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


            showExamArea();


            setRecordStatus(
                "Ready"
            );


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
         * Prevent duplicate recognition
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


        finalTranscript = "";

        interimTranscript = "";


        recognition.onstart =
            function () {

                isRecording = true;

                setRecordStatus(
                    "Recording..."
                );

            };


        recognition.onresult =
            function (event) {

                let finalText = "";

                let interimText = "";


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

                        finalText +=
                            transcript + " ";

                    }

                    else {

                        interimText +=
                            transcript + " ";

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
                    ).trim();


                setText(
                    "transcript",
                    displayText ||
                    "Listening..."
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


                setRecordStatus(
                    "Recording error: " +
                    event.error
                );

            };


        recognition.onend =
            function () {

                isRecording = false;


                /*
                 * Do not automatically restart.
                 * Student controls Start / Stop.
                 */

                if (
                    finalTranscript.trim()
                ) {

                    setRecordStatus(
                        "Finished"
                    );

                }

            };


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


        isRecording = false;


        setRecordStatus(
            "Finished"
        );

    }


    /* ==========================================
       GET TRANSCRIPT
    ========================================== */

    function getTranscript() {

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


        return (
            finalTranscript || ""
        ).trim();

    }


    /* ==========================================
       SUBMIT ANSWER
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


        /*
         * IMPORTANT:
         *
         * Do NOT call:
         *
         * saveScore(...)
         *
         * directly.
         *
         * saveScore is a GAS backend function.
         *
         * Browser → /api → Main.gs.
         */

        const payload = {

            /*
             * Student information
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
             * Question information
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
             * Additional information
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


            if (!result || !result.success) {

                throw new Error(
                    result.message ||
                    "Answer could not be saved."
                );

            }


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
             * If backend provides a result
             * page, use it.
             *
             * Otherwise stay on this page.
             */

            if (
                result.resultId &&
                window.location
            ) {

                sessionStorage.setItem(
                    "SAF_LAST_RESULT",
                    JSON.stringify(result)
                );

            }

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
         * before this file.
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


        if (
            !loadStudentSession()
        ) {

            return;

        }


        /*
         * Restore token if available.
         */

        const savedToken =
            sessionStorage.getItem(
                CONFIG.TOKEN_KEY
            );


        if (savedToken) {

            const input =
                $("token");


            if (input) {

                input.value =
                    savedToken;

            }

        }


        setStatus(
            "Waiting Token"
        );


        setRecordStatus(
            "Ready"
        );

    }


    /* ==========================================
       GLOBAL FUNCTIONS
       ========================================== */

    /*
     * speaking.html uses onclick=""
     */

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