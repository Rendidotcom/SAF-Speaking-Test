/**
 * =========================================================
 * SAF SPEAKING ONLINE TEST
 * Student Speaking Module
 *
 * FILE:
 * js/speaking.js
 *
 * VERSION:
 * Token → Question Binding FIX
 *
 * RESPONSIBILITY:
 * ---------------------------------------------------------
 * - Student session
 * - Exam token
 * - Token validation
 * - Load question EXACTLY by token questionId
 * - Speech Recognition
 * - Transcript reconstruction
 * - Anti-duplicate recognition
 * - Submit answer
 *
 * LOCKED ARCHITECTURE
 * ---------------------------------------------------------
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
     * Each segment is stored by its real result index.
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
       NORMALIZE QUESTION ID
    ===================================================== */

    function normalizeQuestionId(value) {

        return String(
            value === undefined ||
            value === null
                ? ""
                : value
        )
            .trim();

    }


    /* =====================================================
       FIND QUESTION BY ID
    ===================================================== */

    function findQuestionById(
        questions,
        questionId
    ) {

        const targetId =
            normalizeQuestionId(
                questionId
            );


        if (!targetId) {

            return null;

        }


        if (!Array.isArray(questions)) {

            return null;

        }


        for (
            let i = 0;
            i < questions.length;
            i++
        ) {

            const question =
                questions[i];


            if (!question) {

                continue;

            }


            const id =
                normalizeQuestionId(
                    question.id
                );


            if (
                id === targetId
            ) {

                return question;

            }

        }


        return null;

    }


    /* =====================================================
       VALIDATE TOKEN
    ===================================================== */

    async function validateToken(
        tokenFromRestore
    ) {

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


            /*
             * IMPORTANT:
             *
             * The token must provide the questionId.
             *
             * We NEVER select the first ACTIVE question.
             */

            const questionId =
                normalizeQuestionId(
                    result.questionId ||
                    (
                        result.data &&
                        result.data.questionId
                    ) ||
                    (
                        result.data &&
                        result.data.question &&
                        result.data.question.id
                    )
                );


            console.log(
                "TOKEN QUESTION ID:",
                questionId
            );


            if (!questionId) {

                tokenVerified = false;

                currentQuestion = null;


                setExamStatus(
                    "Token Verified, but question is not linked to this token."
                );


                hideExamArea();


                console.error(
                    "VALID TOKEN WITHOUT QUESTION ID:",
                    result
                );


                alert(
                    "Token verified, but this token has no linked question."
                );


                return false;

            }


            /*
             * Load EXACT question belonging
             * to the validated token.
             */

            const questionLoaded =
                await loadQuestion(
                    questionId
                );


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

            currentQuestion = null;


            setExamStatus(
                error.message ||
                "Unable to validate token."
            );


            hideExamArea();


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
       LOAD EXACT QUESTION BY QUESTION ID
    ===================================================== */

    async function loadQuestion(
        questionId
    ) {

        currentQuestion = null;


        const targetQuestionId =
            normalizeQuestionId(
                questionId
            );


        if (!targetQuestionId) {

            setText(
                "question",
                "Question ID is missing."
            );


            return false;

        }


        setText(
            "question",
            "Loading question..."
        );


        try {

            console.log(
                "GET EXACT QUESTION REQUEST:",
                {
                    questionId:
                        targetQuestionId
                }
            );


            /*
             * IMPORTANT:
             *
             * Send the question ID.
             *
             * We do NOT request all ACTIVE
             * questions and choose [0].
             */

            const result =
                await apiRequest(
                    "getQuestion",
                    {
                        id:
                            targetQuestionId
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


            let question = null;


            /*
             * Supported response:
             *
             * data = object
             */

            if (
                result.data &&
                !Array.isArray(
                    result.data
                )
            ) {

                /*
                 * Sometimes data itself is
                 * the question.
                 */

                if (
                    normalizeQuestionId(
                        result.data.id
                    ) ===
                    targetQuestionId
                ) {

                    question =
                        result.data;

                }


                /*
                 * Or:
                 *
                 * data.question
                 */

                else if (
                    result.data.question
                ) {

                    const nested =
                        result.data.question;


                    if (
                        normalizeQuestionId(
                            nested.id
                        ) ===
                        targetQuestionId
                    ) {

                        question =
                            nested;

                    }

                }

            }


            /*
             * Supported response:
             *
             * data = array
             */

            if (
                !question &&
                Array.isArray(
                    result.data
                )
            ) {

                question =
                    findQuestionById(
                        result.data,
                        targetQuestionId
                    );

            }


            /*
             * Another possible response:
             *
             * result.question
             */

            if (
                !question &&
                result.question
            ) {

                if (
                    normalizeQuestionId(
                        result.question.id
                    ) ===
                    targetQuestionId
                ) {

                    question =
                        result.question;

                }

            }


            /*
             * Another possible response:
             *
             * result.data.questions
             */

            if (
                !question &&
                result.data &&
                Array.isArray(
                    result.data.questions
                )
            ) {

                question =
                    findQuestionById(
                        result.data.questions,
                        targetQuestionId
                    );

            }


            /*
             * HARD SAFETY:
             *
             * Never use the first ACTIVE
             * question as fallback.
             */

            if (!question) {

                throw new Error(
                    "Question ID " +
                    targetQuestionId +
                    " tidak ditemukan."
                );

            }


            /*
             * Verify ID one more time.
             */

            const loadedId =
                normalizeQuestionId(
                    question.id
                );


            if (
                loadedId !==
                targetQuestionId
            ) {

                throw new Error(
                    "Question mismatch. Token question ID tidak sama dengan question yang diterima."
                );

            }


            /*
             * ACTIVE status check.
             *
             * If status exists and is not ACTIVE,
             * reject it.
             */

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
                    "Question linked to this token is not ACTIVE."
                );

            }


            currentQuestion =
                question;


            setText(
                "question",
                currentQuestion.title ||
                currentQuestion.question ||
                ""
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
                "EXACT TOKEN QUESTION LOADED:",
                {
                    token:
                        currentToken,

                    questionId:
                        currentQuestion.id,

                    question:
                        currentQuestion.title ||
                        currentQuestion.question
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

        const value =
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


        if (!value) {

            return [];

        }


        return value
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

    function transcriptWordsEqual(
        a,
        b
    ) {

        const first =
            String(a || "")
                .toLowerCase()
                .replace(
                    /[.,!?;:()[\]{}"“”‘’]/g,
                    ""
                );


        const second =
            String(b || "")
                .toLowerCase()
                .replace(
                    /[.,!?;:()[\]{}"“”‘’]/g,
                    ""
                );


        return (
            first ===
            second
        );

    }


    /* =====================================================
       MERGE TRANSCRIPT SEGMENTS
    ===================================================== */

    function mergeTranscriptSegments(
        segments
    ) {

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
                 * Find maximum overlap.
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


            /*
             * NOTE:
             *
             * rebuildTranscript already contains
             * all indexed segments, including interim.
             *
             * Therefore interim is displayed
             * separately only when it is not already
             * represented by the final reconstruction.
             */

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


        setText(
            "transcript",
            finalText ||
            "Listening..."
        );


        console.log(
            "CLEAN TRANSCRIPT:",
            finalText
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
            String(
                finalTranscript || ""
            ).trim();


        if (internal) {

            return internal;

        }


        const element =
            $("transcript");


        if (!element) {

            return "";

        }


        const text =
            String(
                element.textContent || ""
            ).trim();


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


        /*
         * Stop recording first.
         */

        if (isRecording) {

            stopRecording();

        }


        /*
         * Allow final recognition event.
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


        /*
         * IMPORTANT:
         *
         * Submit the EXACT question ID
         * loaded from the token.
         */

        const questionId =
            normalizeQuestionId(
                currentQuestion.id
            );


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


            /* Exact Question */

            questionId:
                questionId,

            question:
                currentQuestion.title ||
                currentQuestion.question ||
                "",


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


        /*
         * Final safety audit before submit.
         */

        console.log(
            "TOKEN → QUESTION AUDIT:",
            {
                token:
                    currentToken,

                questionId:
                    questionId,

                question:
                    payload.question
            }
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


            /* =================================================
               SUCCESS
            ================================================= */

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