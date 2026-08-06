/**
 * ==========================================
 * SAF Speaking Online Test
 * Code.gs
 * API Router
 * Stable Foundation v3.0
 * ==========================================
 */

/* ==========================================
   GET
========================================== */

function doGet(e) {

  return json({

    success: true,

    app: APP_NAME,

    version: VERSION,

    message: "SAF Speaking Online Test API Running"

  });

}


/* ==========================================
   POST
========================================== */

function doPost(e) {

  Logger.log("========== DOPOST ==========");

  Logger.log(
    e.postData
      ? e.postData.contents
      : ""
  );

  try {

    const request = JSON.parse(
      e.postData.contents || "{}"
    );

    const action = request.action || "";

    const data = request.data || {};

    switch (action) {

      /* =====================================
         AUTH
      ===================================== */

      case "login":
        return json(login(data));


      /* =====================================
         QUESTION
      ===================================== */

      case "insertQuestion":
        return json(insertQuestion(data));

      case "getQuestion":
        return json(getQuestion());

      case "updateQuestion":
        return json(updateQuestion(data));

      case "deleteQuestion":
        return json(deleteQuestion(data));


      /* =====================================
         STUDENT
      ===================================== */

      case "insertStudent":
        return json(insertStudent(data));

      case "getStudent":
        return json(getStudent());

      case "updateStudent":
        return json(updateStudent(data));

      case "deleteStudent":
        return json(deleteStudent(data));


      /* =====================================
         TOKEN
      ===================================== */

      case "createToken":
        return json(createToken(data));

      case "getToken":
        return json(getToken());

      case "validateToken":
        return json(validateToken(data));

      case "disableToken":
        return json(disableToken(data));

      case "deleteToken":
        return json(deleteToken(data));


      /* =====================================
         EXAM
      ===================================== */

      case "startExam":
        return json(startExam(data));

      case "getExam":
        return json(getExam(data));

      case "finishExam":
        return json(finishExam(data));

      case "cancelExam":
        return json(cancelExam(data));


      /* =====================================
         RESULT
      ===================================== */

      case "saveResult":
        return json(saveResult(data));

      case "getResult":
        return json(getResult());

      case "getStudentResult":
        return json(getStudentResult(data));

      case "updateResultScore":
        return json(updateResultScore(data));

      case "deleteResult":
        return json(deleteResult(data));


      /* =====================================
         SCORE
      ===================================== */

      case "saveScore":
        return json(saveScore(data));

      case "getScore":
        return json(getScore());

      case "getStudentScore":
        return json(getStudentScore(data));

      case "deleteScore":
        return json(deleteScore(data));


      /* =====================================
         UNKNOWN ACTION
      ===================================== */

      default:

        return json(

          failed(
            "Unknown action : " + action
          )

        );

    }

  }

  catch (err) {

    Logger.log(err);

    return json({

      success: false,

      message: err.toString(),

      stack: err.stack || ""

    });

  }

}