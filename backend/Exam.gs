/**
 * ==========================================
 * Exam.gs
 * SAF Speaking Online Test
 * Stable Foundation v4.0
 * ------------------------------------------
 * Module :
 * - Start Speaking Exam
 * - Get Exam Session
 * ------------------------------------------
 * Token  : Token.gs
 * Result : Result.gs
 * Score  : Score.gs
 * ==========================================
 */


/**
 * ==========================================
 * START EXAM
 * ==========================================
 */
function startExam(data) {

  try {

    if (!data) {
      return failed("Data exam tidak ditemukan.");
    }

    if (!data.studentId) {
      return failed("Student ID wajib diisi.");
    }

    if (!data.token) {
      return failed("Exam token wajib diisi.");
    }

    if (!data.questionId) {
      return failed("Question ID wajib diisi.");
    }


    /* =====================================
       VALIDATE TOKEN
    ===================================== */

    const token = validateToken({
      token: data.token
    });

    if (!token.success) {
      return token;
    }


    /* =====================================
       VALIDATE STUDENT
    ===================================== */

    const students = getRows(CONFIG.SHEET.STUDENT);

    let student = null;

    for (let i = 1; i < students.length; i++) {

      if (String(students[i][0]) === String(data.studentId)) {

        student = {

          nis: students[i][0],
          nama: students[i][1],
          kelas: students[i][2],
          username: students[i][3]

        };

        break;

      }

    }

    if (!student) {
      return failed("Student tidak ditemukan.");
    }


    /* =====================================
       VALIDATE QUESTION
    ===================================== */

    const questions = getRows(CONFIG.SHEET.QUESTION);

    let question = null;

    for (let i = 1; i < questions.length; i++) {

      if (

        String(questions[i][0]) === String(data.questionId) &&
        String(questions[i][5]) === "Active"

      ) {

        question = {

          id: questions[i][0],
          title: questions[i][1],
          answer: questions[i][2],
          difficulty: questions[i][3],
          duration: questions[i][4]

        };

        break;

      }

    }

    if (!question) {
      return failed("Question tidak ditemukan atau tidak aktif.");
    }


    /* =====================================
       SUCCESS
    ===================================== */

    return success({

      message: "Exam started.",

      exam: {

        studentId: student.nis,
        studentName: student.nama,
        kelas: student.kelas,

        token: token.token,

        questionId: question.id,
        title: question.title,
        difficulty: question.difficulty,
        duration: question.duration,

        status: "STARTED",

        startedAt: timestamp()

      }

    });

  }

  catch (err) {

    return failed(err.toString());

  }

}



/**
 * ==========================================
 * GET EXAM SESSION
 * ==========================================
 */
function getExam(data) {

  try {

    if (!data) {
      return failed("Data exam tidak ditemukan.");
    }

    if (!data.questionId) {
      return failed("Question ID wajib diisi.");
    }

    const rows = getRows(CONFIG.SHEET.QUESTION);

    for (let i = 1; i < rows.length; i++) {

      if (

        String(rows[i][0]) === String(data.questionId) &&
        String(rows[i][5]) === "Active"

      ) {

        return success({

          exam: {

            id: rows[i][0],
            title: rows[i][1],
            answer: rows[i][2],
            difficulty: rows[i][3],
            duration: rows[i][4],
            status: rows[i][5]

          }

        });

      }

    }

    return failed("Question tidak ditemukan.");

  }

  catch (err) {

    return failed(err.toString());

  }

}

/**
 * ==========================================
 * FINISH EXAM
 * ==========================================
 */
function finishExam(data) {

  try {

    if (!data) {
      return failed("Data exam tidak ditemukan.");
    }

    if (!data.studentId) {
      return failed("Student ID wajib diisi.");
    }

    if (!data.questionId) {
      return failed("Question ID wajib diisi.");
    }

    if (!data.token) {
      return failed("Exam token wajib diisi.");
    }


    /* =====================================
       VALIDATE TOKEN
    ===================================== */

    const token = validateToken({
      token: data.token
    });

    if (!token.success) {
      return token;
    }


    /* =====================================
       FINISH EXAM
    ===================================== */

    return success({

      message: "Exam finished.",

      exam: {

        studentId: data.studentId,
        questionId: data.questionId,
        token: data.token,

        status: "FINISHED",

        finishedAt: timestamp()

      }

    });

  }

  catch (err) {

    return failed(err.toString());

  }

}



/**
 * ==========================================
 * CANCEL EXAM
 * ==========================================
 */
function cancelExam(data) {

  try {

    if (!data) {
      return failed("Data exam tidak ditemukan.");
    }

    if (!data.studentId) {
      return failed("Student ID wajib diisi.");
    }

    return success({

      message: "Exam cancelled.",

      exam: {

        studentId: data.studentId,

        status: "CANCELLED",

        cancelledAt: timestamp()

      }

    });

  }

  catch (err) {

    return failed(err.toString());

  }

}
