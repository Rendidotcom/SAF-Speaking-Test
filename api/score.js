/**
 * ==========================================
 * SAF Speaking Online Test
 * score.js
 * Stable Foundation v1.0
 * Frontend Score API
 * ==========================================
 *
 * Flow
 * Frontend
 *      ↓
 * api/login (Vercel)
 *      ↓
 * Google Apps Script
 *      ↓
 * Score.gs / Result.gs
 *
 * ==========================================
 */


/* ==========================================
   SAVE SCORE
========================================== */

async function apiSaveScore(data) {

    return await apiRequest("saveScore", data);

}


/* ==========================================
   SAVE RESULT
========================================== */

async function apiSaveResult(data) {

    return await apiRequest("saveResult", data);

}


/* ==========================================
   GET RESULT
========================================== */

async function apiGetResult() {

    return await apiRequest("getResult");

}


/* ==========================================
   GET STUDENT RESULT
========================================== */

async function apiGetStudentResult(nis) {

    return await apiRequest("getStudentResult", {

        nis

    });

}


/* ==========================================
   UPDATE RESULT SCORE
========================================== */

async function apiUpdateResultScore(data) {

    return await apiRequest("updateResultScore", data);

}


/* ==========================================
   DELETE RESULT
========================================== */

async function apiDeleteResult(id) {

    return await apiRequest("deleteResult", {

        id

    });

}


/* ==========================================
   SCORE TO GRADE
========================================== */

function scoreToGrade(score) {

    score = Number(score);

    if (score >= 90) return "A";

    if (score >= 80) return "B";

    if (score >= 70) return "C";

    if (score >= 60) return "D";

    return "E";

}


/* ==========================================
   FORMAT SCORE
========================================== */

function formatScore(score) {

    return Number(score).toFixed(0);

}


/* ==========================================
   PASSING STATUS
========================================== */

function isPassed(score) {

    return Number(score) >= 75;

}


/* ==========================================
   RESULT SUMMARY
========================================== */

function buildResultSummary(score) {

    return {

        score: Number(score),

        grade: scoreToGrade(score),

        passed: isPassed(score)

    };

}