/**
 * ==========================================
 * SAF Speaking Online Test
 * Global Configuration
 * Stable Foundation v4.0
 * ==========================================
 * Frontend : Vercel
 * Backend  : Google Apps Script
 * Architecture : Single API Endpoint
 * ==========================================
 */

const CONFIG = {

    /* ======================================
       APPLICATION
    ====================================== */

    APP_NAME: "SAF Speaking Online Test",

    VERSION: "1.1.0",

    SCHOOL: "SMP Salman Al Farisi Bandung",

    /* ======================================
       API CONFIGURATION
    ======================================

       Browser
           │
           ▼
       /api
           │
           ▼
       Google Apps Script
           │
           ▼
       Google Spreadsheet

       Semua request menggunakan endpoint
       yang sama.

       Contoh:

       login
       insertQuestion
       getQuestion
       updateQuestion
       deleteQuestion

       insertStudent
       getStudent
       updateStudent
       deleteStudent

       createToken
       getToken
       validateToken
       disableToken
       deleteToken

       startExam
       getExam
       finishExam
       cancelExam

       saveResult
       getResult
       getStudentResult
       updateResultScore
       deleteResult

       saveScore
       getScore
       getStudentScore
       deleteScore

    ====================================== */

    API_URL: "/api",

    /* ======================================
       DEBUG MODE
    ====================================== */

    DEBUG: true,

    /* ======================================
       SESSION STORAGE
    ====================================== */

    SESSION_KEY: "SAF_SESSION",

    TOKEN_KEY: "SAF_TOKEN",

    /* ======================================
       REQUEST
    ====================================== */

    TIMEOUT: 30000,

    RETRY: 1

};