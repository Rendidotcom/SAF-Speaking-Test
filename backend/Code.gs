/**
 * ==========================================
 * SAF Speaking Online Test
 * API ROUTER
 * Stable Foundation v1.3
 * ==========================================
 */

function doGet(e) {

  return json({

    success: true,

    app: APP_NAME,

    version: VERSION

  });

}

function doPost(e) {

  try {

    const request = JSON.parse(e.postData.contents);

    const action = request.action;

    const data = request.data || {};

    switch (action) {

      /* ==========================
         AUTH
      ========================== */

      case "login":
        return json(login(data));

      /* ==========================
         QUESTION
      ========================== */

      case "insertQuestion":
        return json(insertQuestion(data));

      case "getQuestion":
        return json(getQuestion());

      case "updateQuestion":
        return json(updateQuestion(data));

      case "deleteQuestion":
        return json(deleteQuestion(data));

      /* ==========================
         STUDENT
      ========================== */

      case "insertStudent":
        return json(insertStudent(data));

      case "getStudent":
        return json(getStudent());

      case "updateStudent":
        return json(updateStudent(data));

      case "deleteStudent":
        return json(deleteStudent(data));

      /* ==========================
         EXAM TOKEN
      ========================== */

      case "insertExam":
        return json(insertExam(data));

      case "getExam":
        return json(getExam());

      case "updateExam":
        return json(updateExam(data));

      case "deleteExam":
        return json(deleteExam(data));

      case "validateToken":
        return json(validateToken(data));

      /* ==========================
         RESULT
      ========================== */

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

      /* ==========================
         SCORE (Legacy)
      ========================== */

      case "saveScore":
        return json(saveScore(data));

      /* ==========================
         DEFAULT
      ========================== */

      default:

        return json(

          failed("Unknown API Action : " + action)

        );

    }

  } catch (err) {

    return json(

      failed(err.toString())

    );

  }

}