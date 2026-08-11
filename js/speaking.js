/**
 * =========================================================
 * SAF SPEAKING ONLINE TEST
 * Student Speaking Module
 *
 * File:
 * js/speaking.js
 *
 * VERSION:
 * Token → Question Binding + Anti-Duplicate Speech Recognition
 *
 * RESPONSIBILITY:
 * - Student session
 * - Exam token
 * - Token validation
 * - Load QUESTION BELONGING TO TOKEN
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
     * SpeechRecognition result segments.
     *
     * Each result is stored according to
     * its SpeechRecognition result index.
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

        currentQuestion = null;

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

                return false;

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

            currentQuestion = null;


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

        currentQuestion = null;


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

                currentQuestion = null;


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


            /* =================================================
               CRITICAL:
               LOAD QUESTION USING TOKEN
            ================================================= */

            const questionLoaded =
                await loadQuestion(
                    currentToken
                );


            if (!questionLoaded) {

                tokenVerified = false;

                currentToken = "";

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

            currentQuestion = null;


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
       
       CRITICAL TOKEN BINDING
       
       The question request MUST include:
       
       {
           token: currentToken
       }
       
       We no longer request:
       
       getQuestion({})
       
       because that can return the first ACTIVE
       question instead of the question assigned
       to the current exam token.
    ===================================================== */

    async function loadQuestion(token) {

        currentQuestion = null;


        const normalizedToken =
            String(
                token || ""
            )
                .trim()
                .toUpperCase();


        if (!normalizedToken) {

            console.error(
                "LOAD QUESTION: TOKEN EMPTY"
            );


            setText(
                "question",
                "Exam token is required."
            );


            return false;

        }


        setText(
            "question",
            "Loading question..."
        );


        try {

            console.log(
                "GET QUESTION REQUEST:",
                {
                    token:
                        normalizedToken
                }
            );


            /*
             * IMPORTANT:
             *
             * Token is explicitly sent to backend.
             *
             * Backend must resolve:
             *
             * token → questionId → question
             */

            const result =
                await apiRequest(
                    "getQuestion",
                    {
                        token:
                            normalizedToken
                    }
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


            /* =================================================
               EXTRACT QUESTION
               
               Supported backend response:
               
               1. result.data = question object
               
               2. result.data = [question]
               
               3. result.question = question object
            ================================================= */

            let question = null;


            if (
                result.data &&
                !Array.isArray(result.data) &&
                typeof result.data === "object"
            ) {

                question =
                    result.data;

            }

            else if (
                Array.isArray(result.data)
            ) {

                /*
                 * If backend returns an array, do NOT blindly
                 * use activeQuestions[0].
                 *
                 * First try to identify the question by token.
                 */

                const questions =
                    result.data;


                const tokenMatchedQuestion =
                    questions.find(
                        function (item) {

                            if (!item) {
                                return false;
                            }


                            const itemToken =
                                String(
                                    item.token ||
                                    item.examToken ||
                                    item.tokenCode ||
                                    ""
                                )
                                    .trim()
                                    .toUpperCase();


                            return (
                                itemToken ===
                                normalizedToken
                            );

                        }
                    );


                if (tokenMatchedQuestion) {

                    question =
                        tokenMatchedQuestion;

                }

                /*
                 * If backend returns exactly one question,
                 * it is safe to use it.
                 */

                else if (
                    questions.length === 1
                ) {

                    question =
                        questions[0];

                }

                else {

                    /*
                     * DO NOT choose the first ACTIVE question.
                     *
                     * That was the source of the mismatch.
                     */

                    throw new Error(
                        "Backend returned multiple questions without token binding."
                    );

                }

            }

            else if (
                result.question &&
                typeof result.question === "object"
            ) {

                question =
                    result.question;

            }


            /* =================================================
               VALIDATE QUESTION OBJECT
            ================================================= */

            if (
                !question ||
                typeof question !== "object"
            ) {

                throw new Error(
                    "Question data tidak ditemukan."
                );

            }


            const questionId =
                String(
                    question.id ||
                    question.questionId ||
                    ""
                )
                    .trim();


            const questionTitle =
                String(
                    question.title ||
                    question.question ||
                    question.text ||
                    ""
                )
                    .trim();


            if (!questionId) {

                throw new Error(
                    "Question ID tidak ditemukan."
                );

            }


            if (!questionTitle) {

                throw new Error(
                    "Question text tidak ditemukan."
                );

            }


            /* =================================================
               OPTIONAL TOKEN SAFETY CHECK
               
               If backend sends token metadata,
               verify that it belongs to current token.
            ================================================= */

            const returnedToken =
                String(
                    question.token ||
                    question.examToken ||
                    question.tokenCode ||
                    ""
                )
                    .trim()
                    .toUpperCase();


            if (
                returnedToken &&
                returnedToken !==
                    normalizedToken
            ) {

                console.error(
                    "TOKEN / QUESTION MISMATCH:",
                    {
                        requestedToken:
                            normalizedToken,

                        returnedToken:
                            returnedToken,

                        question:
                            question
                    }
                );


                throw new Error(
                    "Question does not belong to this exam token."
                );

            }


            /* =================================================
               QUESTION STATUS
            ================================================= */

            const status =
                String(
                    question.status || ""
                )
                    .trim()
                    .toUpperCase();


            if (
                status &&
                status !== "ACTIVE"
            ) {

                throw new Error(
                    "Question assigned to this token is not ACTIVE."
                );

            }


            /* =================================================
               SET CURRENT QUESTION
            ================================================= */

            currentQuestion =
                question;


            /*
             * Normalize essential properties locally.
             *
             * This guarantees submitAnswer() always has:
             *
             * currentQuestion.id
             * currentQuestion.title
             */

            currentQuestion.id =
                questionId;


            currentQuestion.title =
                questionTitle;


            /* =================================================
               DISPLAY QUESTION
            ================================================= */

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
                "TOKEN-BOUND QUESTION:",
                {
                    token:
                        normalizedToken,

                    questionId:
                        currentQuestion.id,

                    question:
                        currentQuestion.title
                }
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

        const normalized =
            String(
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
                .trim();


        if (!normalized) {

            return [];

        }


        return normalized
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
                .replace(
                    /[.,!?;:()[\]{}"“”‘’]/g,
                    ""
                ) ===
            String(b || "")
                .toLowerCase()
                .replace(
                    /[.,!?;:()[\]{}"“”‘’]/g,
                    ""
                )
        );

    }


    /* =====================================================
       MERGE TRANSCRIPT SEGMENTS

       Prevent recognition overlap:

       "there"
       +
       "there are"

       becoming:

       "there there are"

       Result:

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


                if (
                    words.length === 0
                ) {

                    words =
                        segmentWords.slice();

                    return;

                }


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

                    let same = true;


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

                            same = false;

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


                        changed = true;


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


            /*
             * Only confirmed/final segments are
             * included in final reconstruction.
             */

            if (
                segment.final !== true
            ) {

                continue;

            }


            segments.push(
                segment.text
            );

        }


        let merged =
            mergeTranscriptSegments(
                segments
            );


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


                    recognitionSegments[i] = {

                        text:
                            text,

                        final:
                            result.isFinal === true

                    };

                }


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

        const reconstructed =
            rebuildTranscript();


        if (reconstructed) {

            finalTranscript =
                reconstructed;


            return reconstructed;

        }


        const internal =
            finalTranscript
                .trim();


        if (internal) {

            return internal;

        }


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

        if (isSubmitting) {

            return;

        }


        if (
            tokenVerified !== true ||
            !currentToken
        ) {

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


        if (!student) {

            alert(
                "Student session not found."
            );


            window.location.href =
                "login.html?role=student";


            return;

        }


        if (isRecording) {

            stopRecording();

        }


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
           FINAL QUESTION SAFETY
           
           Ensure the question being submitted
           is the question loaded for the token.
        ================================================= */

        const questionId =
            String(
                currentQuestion.id ||
                ""
            )
                .trim();


        if (!questionId) {

            alert(
                "Question ID is missing."
            );


            return;

        }


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


            /* Token-bound Question */

            questionId:
                questionId,

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


            setRecordStatus(
                "Answer submitted successfully."
            );


            setExamStatus(
                "Answer Submitted"
            );


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


        const sessionOK =
            loadStudentSession();


        if (!sessionOK) {

            return;

        }


        hideExamArea();


        setExamStatus(
            "Waiting Token"
        );


        setRecordStatus(
            "Ready"
        );


        await restoreSavedToken();


        console.log(
            "SAF SPEAKING PAGE READY"
        );

    }


    /* =====================================================
       GLOBAL FUNCTIONS
    ===================================================== */

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