/**
 * =========================================================
 * SAF SPEAKING ONLINE TEST
 * Student Speaking Module
 *
 * File:
 * js/speaking.js
 *
 * VERSION:
 * Anti-Duplicate Speech Recognition Fix
 *
 * RESPONSIBILITY:
 * - Student session
 * - Exam token
 * - Token validation
 * - Load ACTIVE question
 * - Speech Recognition
 * - Transcript reconstruction
 * - Anti-duplicate recognition
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
 * Browser NEVER calls GAS directly.
 * Browser communicates only through /api.
 *
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


    /*
     * IMPORTANT:
     *
     * SpeechRecognition may send multiple result events.
     *
     * We DO NOT append every event blindly.
     *
     * Each recognition result is stored by its index.
     */

    let recognitionSegments = [];


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

        const response =
            await fetch(
                "/api",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            action:
                                action,

                            data:
                                data || {}

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


            return false;

        }


        if (input) {

            input.value =
                token;

        }


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
                    token:
                        token
                }
            );


            const result =
                await apiRequest(
                    "validateToken",
                    {
                        token:
                            token
                    }
                );


            console.log(
                "VALIDATE TOKEN RESPONSE:",
                result
            );


            if (
                !result ||
                result.success !== true ||
                result.valid !== true
            ) {

                tokenVerified = false;

                currentToken = "";


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
               TOKEN VALID
            ================================================= */

            currentToken =
                token;


            tokenVerified =
                true;


            saveToken(
                currentToken
            );


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
             * Keep stored token during
             * temporary network/API errors.
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


            const questions =
                Array.isArray(result.data)
                    ? result.data
                    : [];


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
             * first ACTIVE question.
             */

            currentQuestion =
                activeQuestions[0];


            setText(
                "question",
                currentQuestion.title
            );


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
       NORMALIZE TRANSCRIPT WORDS
    ===================================================== */

    function normalizeTranscriptWords(text) {

        return String(
            text || ""
        )
            .toLowerCase()
            .replace(
                /[.,!?;:()[\]{}"“”‘’]/g,
                " "
            )
            .replace(
                /[-–—]/g,
                " "
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    }


    /* =====================================================
       NORMALIZE TRANSCRIPT DISPLAY
    ===================================================== */

    function normalizeTranscriptDisplay(text) {

        return String(
            text || ""
        )
            .replace(
                /\s+/g,
                " "
            )
            .trim();

    }


    /* =====================================================
       WORDS EQUAL
    ===================================================== */

    function transcriptWordsEqual(a, b) {

        return (
            String(a || "")
                .toLowerCase()
                .replace(/[.,!?;:()[\]{}"“”‘’]/g, "") ===
            String(b || "")
                .toLowerCase()
                .replace(/[.,!?;:()[\]{}"“”‘’]/g, "")
        );

    }


    /* =====================================================
       MERGE TRANSCRIPT SEGMENTS
       
       Purpose:
       Prevent recognition overlap such as:
       
       "there"
       +
       "there are"
       
       becoming:
       
       "there there are"
       
       Instead:
       
       "there are"
       ===================================================== */

    function mergeTranscriptSegments(segments) {

        let words = [];


        segments.forEach(
            function (segment) {

                const segmentWords =
                    normalizeTranscriptWords(
                        segment
                    );


                if (
                    segmentWords.length === 0
                ) {

                    return;

                }


                /*
                 * First segment.
                 */

                if (
                    words.length === 0
                ) {

                    words =
                        segmentWords.slice();

                    return;

                }


                /*
                 * Find maximum overlap:
                 *
                 * end of existing transcript
                 * ==
                 * beginning of new segment
                 */

                let maxOverlap = 0;


                const maximum =
                    Math.min(
                        words.length,
                        segmentWords.length
                    );


                for (
                    let overlap = maximum;
                    overlap >= 1;
                    overlap--
                ) {

                    let same = true;


                    for (
                        let i = 0;
                        i < overlap;
                        i++
                    ) {

                        const existingWord =
                            words[
                                words.length -
                                overlap +
                                i
                            ];


                        const incomingWord =
                            segmentWords[i];


                        if (
                            !transcriptWordsEqual(
                                existingWord,
                                incomingWord
                            )
                        ) {

                            same = false;

                            break;

                        }

                    }


                    if (same) {

                        maxOverlap =
                            overlap;

                        break;

                    }

                }


                /*
                 * Append only the part that
                 * is not already present.
                 */

                words =
                    words.concat(
                        segmentWords.slice(
                            maxOverlap
                        )
                    );

            }
        );


        return words.join(" ");

    }


    /* =====================================================
       REMOVE OBVIOUS DUPLICATE PHRASES
       
       Conservative:
       only removes immediately repeated
       identical phrases.
       
       Example:
       
       there are there are
       
       →
       
       there are
       ===================================================== */

    function removeRepeatedPhrases(text) {

        let words =
            normalizeTranscriptWords(
                text
            );


        if (
            words.length < 2
        ) {

            return words.join(" ");

        }


        /*
         * Repeat detection from 1 to 4 words.
         *
         * We intentionally keep this conservative.
         */

        let changed = true;


        while (changed) {

            changed = false;


            for (
                let phraseLength = 4;
                phraseLength >= 1;
                phraseLength--
            ) {

                if (
                    words.length <
                    phraseLength * 2
                ) {

                    continue;

                }


                for (
                    let i = 0;
                    i <=
                    words.length -
                    phraseLength * 2;
                    i++
                ) {

                    let same =
                        true;


                    for (
                        let j = 0;
                        j < phraseLength;
                        j++
                    ) {

                        if (
                            !transcriptWordsEqual(
                                words[
                                    i + j
                                ],
                                words[
                                    i +
                                    phraseLength +
                                    j
                                ]
                            )
                        ) {

                            same =
                                false;

                            break;

                        }

                    }


                    if (same) {

                        words =
                            words.slice(
                                0,
                                i +
                                phraseLength
                            ).concat(
                                words.slice(
                                    i +
                                    phraseLength * 2
                                )
                            );


                        changed =
                            true;


                        break;

                    }

                }


                if (changed) {

                    break;

                }

            }

        }


        return words.join(" ");

    }


    /* =====================================================
       REBUILD TRANSCRIPT
    ===================================================== */

    function rebuildTranscript() {

        const segments = [];


        for (
            let i = 0;
            i < recognitionSegments.length;
            i++
        ) {

            const segment =
                recognitionSegments[i];


            if (
                !segment ||
                !segment.text
            ) {

                continue;

            }


            segments.push(
                segment.text
            );

        }


        /*
         * First merge recognition segments
         * using overlap detection.
         */

        let merged =
            mergeTranscriptSegments(
                segments
            );


        /*
         * Then remove only obvious
         * immediately repeated phrases.
         */

        merged =
            removeRepeatedPhrases(
                merged
            );


        return normalizeTranscriptDisplay(
            merged
        );

    }


    /* =====================================================
       UPDATE TRANSCRIPT DISPLAY
    ===================================================== */

    function updateTranscriptDisplay() {

        const finalText =
            rebuildTranscript();


        const interimParts = [];


        for (
            let i = 0;
            i < recognitionSegments.length;
            i++
        ) {

            const segment =
                recognitionSegments[i];


            if (
                segment &&
                segment.final !== true &&
                segment.text
            ) {

                interimParts.push(
                    segment.text
                );

            }

        }


        /*
         * Interim is only visual.
         *
         * It must NOT become part of
         * finalTranscript until recognition
         * confirms it.
         */

        interimTranscript =
            normalizeTranscriptDisplay(
                interimParts.join(" ")
            );


        if (finalText) {

            finalTranscript =
                finalText;

        }


        const display =
            normalizeTranscriptDisplay(
                finalText +
                (
                    interimTranscript
                        ? " " +
                          interimTranscript
                        : ""
                )
            );


        setText(
            "transcript",
            display ||
            "Listening..."
        );


        console.log(
            "CLEAN TRANSCRIPT:",
            display
        );

    }


    /* =====================================================
       START RECORDING
    ===================================================== */

    function startRecording() {

        /*
         * Check internal state.
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


        if (isRecording) {

            return;

        }


        /*
         * Fresh recognition instance.
         */

        const recognitionInstance =
            new SpeechRecognition();


        recognition =
            recognitionInstance;


        recognition.lang =
            "en-US";


        recognition.continuous =
            true;


        recognition.interimResults =
            true;


        recognition.maxAlternatives =
            1;


        /*
         * RESET TRANSCRIPT STATE
         */

        finalTranscript = "";

        interimTranscript = "";

        recognitionSegments = [];


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

        recognitionInstance.onstart =
            function () {

                if (
                    recognition !==
                    recognitionInstance
                ) {

                    return;

                }


                isRecording =
                    true;


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

        recognitionInstance.onresult =
            function (event) {

                if (
                    recognition !==
                    recognitionInstance
                ) {

                    return;

                }


                console.log(
                    "RAW SPEECH RESULT:",
                    event
                );


                /*
                 * IMPORTANT:
                 *
                 * Do not append event text.
                 *
                 * Update the result at its
                 * actual SpeechRecognition index.
                 */

                for (
                    let i =
                        event.resultIndex;
                    i <
                        event.results.length;
                    i++
                ) {

                    const result =
                        event.results[i];


                    if (!result) {

                        continue;

                    }


                    const alternative =
                        result[0];


                    if (!alternative) {

                        continue;

                    }


                    const text =
                        normalizeTranscriptDisplay(
                            alternative.transcript
                        );


                    /*
                     * Store / replace the segment.
                     */

                    recognitionSegments[i] = {

                        text:
                            text,

                        final:
                            result.isFinal === true

                    };

                }


                /*
                 * Reconstruct the entire transcript
                 * from stored result indexes.
                 */

                updateTranscriptDisplay();

            };


        /* =================================================
           ON ERROR
        ================================================= */

        recognitionInstance.onerror =
            function (event) {

                if (
                    recognition !==
                    recognitionInstance
                ) {

                    return;

                }


                console.error(
                    "SPEECH RECOGNITION ERROR:",
                    event
                );


                isRecording =
                    false;


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

        recognitionInstance.onend =
            function () {

                if (
                    recognition !==
                    recognitionInstance
                ) {

                    return;

                }


                isRecording =
                    false;


                /*
                 * Final reconstruction.
                 */

                const cleanText =
                    rebuildTranscript();


                finalTranscript =
                    cleanText;


                interimTranscript =
                    "";


                if (cleanText) {

                    setText(
                        "transcript",
                        cleanText
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
                    "FINAL CLEAN TRANSCRIPT:",
                    cleanText
                );


                console.log(
                    "SPEECH RECOGNITION ENDED"
                );

            };


        /* =================================================
           START
        ================================================= */

        try {

            recognitionInstance.start();

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


        isRecording =
            false;


        /*
         * Reconstruct current transcript
         * immediately as a safe fallback.
         */

        const text =
            rebuildTranscript();


        finalTranscript =
            text;


        interimTranscript =
            "";


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
         * Always reconstruct from recognition
         * segments first.
         */

        const reconstructed =
            rebuildTranscript();


        if (reconstructed) {

            finalTranscript =
                reconstructed;


            return reconstructed;

        }


        /*
         * Fallback to internal transcript.
         */

        const internal =
            finalTranscript
                .trim();


        if (internal) {

            return internal;

        }


        /*
         * Final fallback to DOM.
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


        return removeRepeatedPhrases(
            text
        );

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

        if (!student) {

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
         * Allow SpeechRecognition
         * to finalize the last event.
         */

        await new Promise(
            function (resolve) {

                setTimeout(
                    resolve,
                    250
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


        /* =================================================
           BUILD PAYLOAD
        ================================================= */

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


        isSubmitting =
            true;


        setRecordStatus(
            "Submitting..."
        );


        try {

            /*
             * Browser
             * ↓
             * Vercel /api
             * ↓
             * Main.gs
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


            /* =================================================
               SUCCESS
            ================================================= */

            setRecordStatus(
                "Answer submitted successfully."
            );


            setExamStatus(
                "Answer Submitted"
            );


            /*
             * Save latest result locally.
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

            isSubmitting =
                false;

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
         * Stored token is NOT automatically verified.
         *
         * It must be revalidated by backend.
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

        tokenVerified =
            false;

        currentToken =
            "";

        currentQuestion =
            null;

        recognition =
            null;

        finalTranscript =
            "";

        interimTranscript =
            "";

        recognitionSegments =
            [];

        isRecording =
            false;

        isSubmitting =
            false;


        /*
         * CONFIG must exist.
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
         * Student login required.
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
         * Restore saved token.
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
     * speaking.html:
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