/**
 * ==========================================
 * SAF Speaking Online Test
 * RESULT MODULE
 * Stable Foundation v2.0
 * ==========================================
 *
 * RESPONSIBILITY:
 * - Save speaking result
 * - Get all result
 * - Get result by NIS
 * - Update score
 * - Delete result
 *
 * DATABASE:
 * - Uses Spreadsheet.gs
 * - Uses sheet()
 * - Uses getRows()
 *
 * RESULT SHEET COLUMNS:
 * A  id
 * B  nis
 * C  nama
 * D  kelas
 * E  questionId
 * F  question
 * G  transcript
 * H  score
 * I  feedback
 * J  token
 * K  createdAt
 * L  updatedAt
 *
 * ==========================================
 */


/* ==========================================
   CONFIGURATION
========================================== */

const RESULT_SHEET = "Result";


/* ==========================================
   SAVE RESULT
========================================== */

function saveResult(data) {

  try {

    /* --------------------------------------
       VALIDATE DATA
    -------------------------------------- */

    if (!data) {

      return failed(
        "Data result tidak ditemukan."
      );

    }


    /* --------------------------------------
       GET RESULT SHEET
       
       IMPORTANT:
       Spreadsheet.gs menyediakan:
       sheet(name)

       BUKAN:
       getSheet(name)
    -------------------------------------- */

    const sh = sheet(RESULT_SHEET);


    if (!sh) {

      return failed(
        "Sheet Result tidak ditemukan."
      );

    }


    /* --------------------------------------
       GENERATE ID & TIMESTAMP
    -------------------------------------- */

    const id = uuid();

    const now = new Date();


    /* --------------------------------------
       APPEND RESULT
       
       Column order:
       
       A id
       B nis
       C nama
       D kelas
       E questionId
       F question
       G transcript
       H score
       I feedback
       J token
       K createdAt
       L updatedAt
    -------------------------------------- */

    sh.appendRow([

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


    /* --------------------------------------
       SUCCESS
    -------------------------------------- */

    return success({

      id: id,

      message:
        "Result saved successfully."

    });

  }


  catch (err) {

    Logger.log(
      "saveResult ERROR: " +
      err.toString()
    );

    return failed(
      err.toString()
    );

  }

}


/* ==========================================
   GET ALL RESULT
========================================== */

function getResult() {

  try {

    /* --------------------------------------
       GET ROWS
    -------------------------------------- */

    const rows =
      getRows(RESULT_SHEET);


    /* --------------------------------------
       EMPTY RESULT
       
       Header only = 1 row
    -------------------------------------- */

    if (
      !rows ||
      rows.length <= 1
    ) {

      return success([]);

    }


    /* --------------------------------------
       BUILD RESULT LIST
    -------------------------------------- */

    const result = [];


    for (
      let i = 1;
      i < rows.length;
      i++
    ) {

      const r = rows[i];


      result.push({

        id:
          r[0],

        nis:
          r[1],

        nama:
          r[2],

        kelas:
          r[3],

        questionId:
          r[4],

        question:
          r[5],

        transcript:
          r[6],

        score:
          r[7],

        feedback:
          r[8],

        token:
          r[9],

        createdAt:
          r[10],

        updatedAt:
          r[11]

      });

    }


    /* --------------------------------------
       SUCCESS
    -------------------------------------- */

    return success(
      result
    );

  }


  catch (err) {

    Logger.log(
      "getResult ERROR: " +
      err.toString()
    );

    return failed(
      err.toString()
    );

  }

}


/* ==========================================
   GET RESULT BY NIS
========================================== */

function getStudentResult(data) {

  try {

    /* --------------------------------------
       VALIDATE DATA
    -------------------------------------- */

    if (!data) {

      return failed(
        "Data student tidak ditemukan."
      );

    }


    if (
      data.nis === undefined ||
      data.nis === null ||
      String(data.nis).trim() === ""
    ) {

      return failed(
        "NIS tidak ditemukan."
      );

    }


    /* --------------------------------------
       GET ROWS
    -------------------------------------- */

    const rows =
      getRows(RESULT_SHEET);


    const list = [];


    /* --------------------------------------
       SEARCH BY NIS
    -------------------------------------- */

    for (
      let i = 1;
      i < rows.length;
      i++
    ) {

      const r = rows[i];


      if (
        String(r[1]) ===
        String(data.nis)
      ) {

        list.push({

          id:
            r[0],

          nis:
            r[1],

          nama:
            r[2],

          kelas:
            r[3],

          questionId:
            r[4],

          question:
            r[5],

          transcript:
            r[6],

          score:
            r[7],

          feedback:
            r[8],

          token:
            r[9],

          createdAt:
            r[10],

          updatedAt:
            r[11]

        });

      }

    }


    /* --------------------------------------
       SUCCESS
    -------------------------------------- */

    return success(
      list
    );

  }


  catch (err) {

    Logger.log(
      "getStudentResult ERROR: " +
      err.toString()
    );

    return failed(
      err.toString()
    );

  }

}


/* ==========================================
   UPDATE RESULT SCORE
========================================== */

function updateResultScore(data) {

  try {

    /* --------------------------------------
       VALIDATE DATA
    -------------------------------------- */

    if (!data) {

      return failed(
        "Data update tidak ditemukan."
      );

    }


    if (
      data.id === undefined ||
      data.id === null ||
      String(data.id).trim() === ""
    ) {

      return failed(
        "Result ID tidak ditemukan."
      );

    }


    /* --------------------------------------
       GET SHEET
    -------------------------------------- */

    const sh =
      sheet(RESULT_SHEET);


    if (!sh) {

      return failed(
        "Sheet Result tidak ditemukan."
      );

    }


    /* --------------------------------------
       READ DATA
    -------------------------------------- */

    const rows =
      sh.getDataRange()
        .getValues();


    /* --------------------------------------
       FIND RESULT
    -------------------------------------- */

    for (
      let i = 1;
      i < rows.length;
      i++
    ) {

      if (
        String(rows[i][0]) ===
        String(data.id)
      ) {

        /* ------------------------------
           COLUMN H = SCORE
           Column index 8
        ------------------------------ */

        sh.getRange(
          i + 1,
          8
        ).setValue(
          data.score || 0
        );


        /* ------------------------------
           COLUMN I = FEEDBACK
           Column index 9
        ------------------------------ */

        sh.getRange(
          i + 1,
          9
        ).setValue(
          data.feedback || ""
        );


        /* ------------------------------
           COLUMN L = UPDATED AT
           Column index 12
        ------------------------------ */

        sh.getRange(
          i + 1,
          12
        ).setValue(
          new Date()
        );


        /* ------------------------------
           SUCCESS
        ------------------------------ */

        return success({

          id:
            data.id,

          message:
            "Score updated."

        });

      }

    }


    /* --------------------------------------
       RESULT NOT FOUND
    -------------------------------------- */

    return failed(
      "Result not found."
    );

  }


  catch (err) {

    Logger.log(
      "updateResultScore ERROR: " +
      err.toString()
    );

    return failed(
      err.toString()
    );

  }

}


/* ==========================================
   DELETE RESULT
========================================== */

function deleteResult(data) {

  try {

    /* --------------------------------------
       VALIDATE DATA
    -------------------------------------- */

    if (!data) {

      return failed(
        "Data delete tidak ditemukan."
      );

    }


    if (
      data.id === undefined ||
      data.id === null ||
      String(data.id).trim() === ""
    ) {

      return failed(
        "Result ID tidak ditemukan."
      );

    }


    /* --------------------------------------
       GET SHEET
    -------------------------------------- */

    const sh =
      sheet(RESULT_SHEET);


    if (!sh) {

      return failed(
        "Sheet Result tidak ditemukan."
      );

    }


    /* --------------------------------------
       READ DATA
    -------------------------------------- */

    const rows =
      sh.getDataRange()
        .getValues();


    /* --------------------------------------
       FIND RESULT
       Search from bottom
    -------------------------------------- */

    for (
      let i = rows.length - 1;
      i >= 1;
      i--
    ) {

      if (
        String(rows[i][0]) ===
        String(data.id)
      ) {

        sh.deleteRow(
          i + 1
        );


        return success({

          id:
            data.id,

          message:
            "Result deleted."

        });

      }

    }


    /* --------------------------------------
       RESULT NOT FOUND
    -------------------------------------- */

    return failed(
      "Result not found."
    );

  }


  catch (err) {

    Logger.log(
      "deleteResult ERROR: " +
      err.toString()
    );

    return failed(
      err.toString()
    );

  }

}