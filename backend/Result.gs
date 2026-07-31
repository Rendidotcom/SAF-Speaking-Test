/**
 * ==========================================
 * SAF Speaking Online Test
 * RESULT MODULE
 * Stable Foundation v1.0
 * ==========================================
 */

const RESULT_SHEET = "Result";

/* ==========================================
   SAVE RESULT
========================================== */

function saveResult(data) {

  try {

    const sheet = getSheet(RESULT_SHEET);

    const now = new Date();

    const id = uuid();

    sheet.appendRow([

      id,

      data.nis || "",

      data.nama || "",

      data.kelas || "",

      data.questionId || "",

      data.question || "",

      data.transcript || "",

      data.score || 0,

      data.feedback || "",

      data.token || "",

      now,

      now

    ]);

    return success({

      id: id,

      message: "Result saved successfully."

    });

  } catch (err) {

    return failed(err.toString());

  }

}

/* ==========================================
   GET ALL RESULT
========================================== */

function getResult() {

  try {

    const rows = getRows(RESULT_SHEET);

    if (rows.length <= 1) {

      return success([]);

    }

    const result = [];

    for (let i = 1; i < rows.length; i++) {

      const r = rows[i];

      result.push({

        id: r[0],

        nis: r[1],

        nama: r[2],

        kelas: r[3],

        questionId: r[4],

        question: r[5],

        transcript: r[6],

        score: r[7],

        feedback: r[8],

        token: r[9],

        createdAt: r[10],

        updatedAt: r[11]

      });

    }

    return success(result);

  } catch (err) {

    return failed(err.toString());

  }

}

/* ==========================================
   GET RESULT BY NIS
========================================== */

function getStudentResult(data) {

  try {

    const rows = getRows(RESULT_SHEET);

    const list = [];

    for (let i = 1; i < rows.length; i++) {

      const r = rows[i];

      if (String(r[1]) === String(data.nis)) {

        list.push({

          id: r[0],

          nis: r[1],

          nama: r[2],

          kelas: r[3],

          questionId: r[4],

          question: r[5],

          transcript: r[6],

          score: r[7],

          feedback: r[8],

          token: r[9],

          createdAt: r[10],

          updatedAt: r[11]

        });

      }

    }

    return success(list);

  } catch (err) {

    return failed(err.toString());

  }

}

/* ==========================================
   UPDATE SCORE
========================================== */

function updateResultScore(data) {

  try {

    const sheet = getSheet(RESULT_SHEET);

    const rows = sheet.getDataRange().getValues();

    for (let i = 1; i < rows.length; i++) {

      if (rows[i][0] == data.id) {

        sheet.getRange(i + 1, 8).setValue(data.score);
        sheet.getRange(i + 1, 9).setValue(data.feedback);
        sheet.getRange(i + 1, 12).setValue(new Date());

        return success({

          message: "Score updated."

        });

      }

    }

    return failed("Result not found.");

  } catch (err) {

    return failed(err.toString());

  }

}

/* ==========================================
   DELETE RESULT
========================================== */

function deleteResult(data) {

  try {

    const sheet = getSheet(RESULT_SHEET);

    const rows = sheet.getDataRange().getValues();

    for (let i = rows.length - 1; i >= 1; i--) {

      if (rows[i][0] == data.id) {

        sheet.deleteRow(i + 1);

        return success({

          message: "Result deleted."

        });

      }

    }

    return failed("Result not found.");

  } catch (err) {

    return failed(err.toString());

  }

}