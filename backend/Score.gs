/**
 * ==========================================
 * SAF Speaking Online Test
 * Score Module
 * Stable Foundation v1.0
 * ==========================================
 */

/* =====================================================
   SAVE SCORE
===================================================== */

function saveScore(data) {

  const sheet =
    SpreadsheetApp
      .openById(CONFIG.SPREADSHEET_ID)
      .getSheetByName(CONFIG.SHEET.RESULT);

  if (!sheet) {

    return failed("Sheet 'Result' not found.");

  }

  const id = Utilities.getUuid();

  const score = Number(data.score);

  let grade = "E";

  if (score >= 90) {

    grade = "A";

  } else if (score >= 80) {

    grade = "B";

  } else if (score >= 70) {

    grade = "C";

  } else if (score >= 60) {

    grade = "D";

  }

  sheet.appendRow([

    id,

    data.studentId || "",

    data.studentName || "",

    data.class || "",

    data.questionId || "",

    data.topic || "",

    score,

    grade,

    data.audioUrl || "",

    data.transcript || "",

    data.feedback || "",

    new Date()

  ]);

  return success({

    id: id,

    score: score,

    grade: grade,

    message: "Score saved successfully."

  });

}

/* =====================================================
   GET ALL SCORE
===================================================== */

function getScore() {

  const sheet =
    SpreadsheetApp
      .openById(CONFIG.SPREADSHEET_ID)
      .getSheetByName(CONFIG.SHEET.RESULT);

  if (!sheet) {

    return failed("Sheet 'Result' not found.");

  }

  const values = sheet.getDataRange().getValues();

  if (values.length <= 1) {

    return success([]);

  }

  const result = [];

  for (let i = 1; i < values.length; i++) {

    result.push({

      id: values[i][0],

      studentId: values[i][1],

      studentName: values[i][2],

      class: values[i][3],

      questionId: values[i][4],

      topic: values[i][5],

      score: values[i][6],

      grade: values[i][7],

      audioUrl: values[i][8],

      transcript: values[i][9],

      feedback: values[i][10],

      createdAt: values[i][11]

    });

  }

  return success(result);

}

/* =====================================================
   GET SCORE BY STUDENT
===================================================== */

function getStudentScore(studentId) {

  const scores = getScore();

  if (!scores.success) {

    return scores;

  }

  const result = scores.data.filter(function(item) {

    return item.studentId == studentId;

  });

  return success(result);

}

/* =====================================================
   DELETE SCORE
===================================================== */

function deleteScore(data) {

  const sheet =
    SpreadsheetApp
      .openById(CONFIG.SPREADSHEET_ID)
      .getSheetByName(CONFIG.SHEET.RESULT);

  if (!sheet) {

    return failed("Sheet 'Result' not found.");

  }

  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {

    if (values[i][0] == data.id) {

      sheet.deleteRow(i + 1);

      return success({

        message: "Score deleted successfully."

      });

    }

  }

  return failed("Score not found.");

}