/**
 * ==========================================
 * SAF SPEAKING ONLINE TEST
 * SCORE MODULE
 *
 * Stable Foundation v2.1
 * ==========================================
 *
 * RESPONSIBILITY:
 *
 * - Receive speaking score request
 * - Get answer key from Questions Sheet
 * - Calculate speaking score
 * - Generate grade
 * - Generate feedback
 * - Send final result to Result Module
 *
 * DATABASE WRITE:
 * - Tidak menulis langsung ke Result Sheet
 * - Persistence dilakukan melalui saveResult()
 *
 * FLOW:
 *
 * speaking.js
 *      ↓
 * Main.gs
 *      ↓
 * saveScore()
 *      ↓
 * calculateScore()
 *      ↓
 * saveResult()
 *      ↓
 * Result Sheet
 *
 * ==========================================
 */


/* =====================================================
SAVE SCORE
===================================================== */

function saveScore(data) {

  try {

    /* ================================================
       VALIDATE DATA
    ================================================ */

    if (!data) {

      return failed(
        "Score data tidak ditemukan."
      );

    }


    if (!data.questionId) {

      return failed(
        "Question ID wajib diisi."
      );

    }


    if (!data.transcript) {

      return failed(
        "Transcript kosong."
      );

    }


    /* ================================================
       GET QUESTION
    ================================================ */

    const questionResult =
      getQuestionById({

        id: data.questionId

      });


    if (
      !questionResult ||
      !questionResult.success
    ) {

      return failed(
        questionResult.message ||
        "Question tidak ditemukan."
      );

    }


    const question =
      questionResult.data;


    if (!question) {

      return failed(
        "Question data tidak ditemukan."
      );

    }


    /* ================================================
       GET ANSWER KEY
    ================================================ */

    const answer =
      String(
        question.answer || ""
      ).trim();


    if (!answer) {

      return failed(
        "Answer key untuk question ini kosong."
      );

    }


    /* ================================================
       CALCULATE SCORE
    ================================================ */

    const scoreResult =
      calculateScore({

        answer:
          answer,

        transcript:
          data.transcript

      });


    if (
      !scoreResult ||
      !scoreResult.success
    ) {

      return failed(
        scoreResult.message ||
        "Score calculation failed."
      );

    }


    /* ================================================
       PREPARE RESULT DATA
    ================================================ */

    const resultData = {

      nis:
        data.nis || "",

      nama:
        data.nama || "",

      kelas:
        data.kelas || "",

      questionId:
        data.questionId || "",

      question:
        data.question ||
        question.title ||
        "",

      transcript:
        data.transcript || "",

      score:
        scoreResult.score || 0,

      feedback:
        scoreResult.feedback || "",

      token:
        data.token || ""

    };


    /* ================================================
       SAVE RESULT
    ================================================ */

    const saved =
      saveResult(resultData);


    if (
      !saved ||
      !saved.success
    ) {

      return failed(
        saved.message ||
        "Result could not be saved."
      );

    }


    /* ================================================
       RETURN FINAL RESULT
    ================================================ */

    return success({

      resultId:
        saved.id || "",

      score:
        scoreResult.score,

      grade:
        scoreResult.grade,

      accuracy:
        scoreResult.accuracy,

      pronunciation:
        scoreResult.pronunciation,

      fluency:
        scoreResult.fluency,

      feedback:
        scoreResult.feedback,

      message:
        "Speaking answer submitted successfully."

    });

  }

  catch (err) {

    return failed(
      err.toString()
    );

  }

}


/* =====================================================
CALCULATE SCORE
===================================================== */

function calculateScore(data) {

  try {

    if (!data) {

      return failed(
        "Data score tidak ditemukan."
      );

    }


    const answer =
      String(
        data.answer || ""
      )
      .trim()
      .toLowerCase();


    const transcript =
      String(
        data.transcript || ""
      )
      .trim()
      .toLowerCase();


    if (!answer) {

      return failed(
        "Answer key kosong."
      );

    }


    if (!transcript) {

      return failed(
        "Transcript kosong."
      );

    }


    const accuracy =
      calculateAccuracy(
        answer,
        transcript
      );


    const pronunciation =
      accuracy;


    const fluency =
      accuracy;


    const score =
      Math.round(

        (accuracy * 0.5) +

        (pronunciation * 0.3) +

        (fluency * 0.2)

      );


    return success({

      score:
        score,

      grade:
        calculateGrade(score),

      accuracy:
        accuracy,

      pronunciation:
        pronunciation,

      fluency:
        fluency,

      feedback:
        generateFeedback(score)

    });

  }

  catch (err) {

    return failed(
      err.toString()
    );

  }

}


/* =====================================================
CALCULATE ACCURACY
===================================================== */

function calculateAccuracy(
  answer,
  transcript
) {

  if (
    answer === transcript
  ) {

    return 100;

  }


  const answerWords =
    answer.split(/\s+/);


  const transcriptWords =
    transcript.split(/\s+/);


  let correct = 0;


  answerWords.forEach(
    function(word) {

      if (
        transcriptWords.indexOf(word) !== -1
      ) {

        correct++;

      }

    }
  );


  return Math.round(

    (
      correct /
      answerWords.length
    ) * 100

  );

}


/* =====================================================
GRADE
===================================================== */

function calculateGrade(score) {

  if (score >= 90) {

    return "A";

  }


  if (score >= 80) {

    return "B";

  }


  if (score >= 70) {

    return "C";

  }


  if (score >= 60) {

    return "D";

  }


  return "E";

}


/* =====================================================
FEEDBACK
===================================================== */

function generateFeedback(score) {

  if (score >= 90) {

    return "Excellent pronunciation.";

  }


  if (score >= 80) {

    return "Very good pronunciation.";

  }


  if (score >= 70) {

    return "Good pronunciation.";

  }


  if (score >= 60) {

    return "Fair pronunciation.";

  }


  return "Needs more practice.";

}