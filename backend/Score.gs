/**
 * ==========================================
 * SAF Speaking Online Test
 * Score Module
 * Stable Foundation v2.0
 * ------------------------------------------
 * Responsibility :
 * - Calculate Speaking Score
 * - Generate Grade
 * - Generate Feedback
 * - NO Database Access
 * ==========================================
 */


/* =====================================================
   CALCULATE SCORE
===================================================== */

function calculateScore(data) {

  try {

    if (!data) {
      return failed("Data score tidak ditemukan.");
    }

    const answer =
      String(data.answer || "")
        .trim()
        .toLowerCase();

    const transcript =
      String(data.transcript || "")
        .trim()
        .toLowerCase();

    if (!answer) {
      return failed("Answer key kosong.");
    }

    if (!transcript) {
      return failed("Transcript kosong.");
    }

    const accuracy =
      calculateAccuracy(answer, transcript);

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

      score: score,

      grade: calculateGrade(score),

      accuracy: accuracy,

      pronunciation: pronunciation,

      fluency: fluency,

      feedback: generateFeedback(score)

    });

  }

  catch(err){

    return failed(err.toString());

  }

}


/* =====================================================
   CALCULATE ACCURACY
===================================================== */

function calculateAccuracy(answer, transcript){

  if(answer === transcript){

    return 100;

  }

  const answerWords =
    answer.split(/\s+/);

  const transcriptWords =
    transcript.split(/\s+/);

  let correct = 0;

  answerWords.forEach(function(word){

    if(transcriptWords.indexOf(word) !== -1){

      correct++;

    }

  });

  return Math.round(

    (correct / answerWords.length) * 100

  );

}


/* =====================================================
   GRADE
===================================================== */

function calculateGrade(score){

  if(score >= 90) return "A";

  if(score >= 80) return "B";

  if(score >= 70) return "C";

  if(score >= 60) return "D";

  return "E";

}


/* =====================================================
   FEEDBACK
===================================================== */

function generateFeedback(score){

  if(score >= 90){

    return "Excellent pronunciation.";

  }

  if(score >= 80){

    return "Very good pronunciation.";

  }

  if(score >= 70){

    return "Good pronunciation.";

  }

  if(score >= 60){

    return "Fair pronunciation.";

  }

  return "Needs more practice.";

}