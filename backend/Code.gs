/******************************************************
 * SAF SPEAKING ONLINE TEST
 * MAIN API ROUTER
 *
 * File: backend/Code.gs
 *
 * ROLE:
 * - Satu-satunya doGet()
 * - Satu-satunya doPost()
 * - Routing API
 * - Business logic tetap berada di file masing-masing
 *
 * STABLE FOUNDATION
 ******************************************************/


/******************************************************
 * GET API
 ******************************************************/

function doGet(e) {

  try {

    return json({

      success: true,

      app: CONFIG.APP_NAME,

      version: CONFIG.VERSION,

      message: "SAF Speaking Online Test API is running."

    });

  }

  catch (err) {

    Logger.log(err);

    return json({

      success: false,

      message: err.toString()

    });

  }

}


/******************************************************
 * POST API ROUTER
 ******************************************************/

function doPost(e) {

  try {

    /**************************************************
     * VALIDATE REQUEST
     **************************************************/

    if (
      !e ||
      !e.postData ||
      !e.postData.contents
    ) {

      return json(
        failed("Request body tidak ditemukan.")
      );

    }


    /**************************************************
     * PARSE REQUEST BODY
     **************************************************/

    const body = JSON.parse(
      e.postData.contents
    );

    const action = body.action;

    const data = body.data || {};


    /**************************************************
     * VALIDATE ACTION
     **************************************************/

    if (!action) {

      return json(
        failed("Action tidak ditemukan.")
      );

    }


    /**************************************************
     * ROUTER
     **************************************************/

    switch (action) {


      /* ==========================================
       * AUTH
       * ========================================== */

      case "login":

        return json(
          login(data)
        );


      /* ==========================================
       * QUESTION
       * ========================================== */

      case "insertQuestion":

        return json(
          insertQuestion(data)
        );


      case "getQuestion":

        return json(
          getQuestion()
        );


      case "updateQuestion":

        return json(
          updateQuestion(data)
        );


      case "deleteQuestion":

        return json(
          deleteQuestion(data)
        );


      /* ==========================================
       * STUDENT
       * ========================================== */

      case "insertStudent":

        return json(
          insertStudent(data)
        );


      case "getStudent":

        return json(
          getStudent()
        );


      case "updateStudent":

        return json(
          updateStudent(data)
        );


      case "deleteStudent":

        return json(
          deleteStudent(data)
        );


      /* ==========================================
       * TOKEN
       * ========================================== */

      case "createToken":

        return json(
          createToken(data)
        );


      case "validateToken":

        return json(
          validateToken(data)
        );


      /* ==========================================
       * SCORE / RESULT
       * ========================================== */

      case "saveScore":

        return json(
          saveScore(data)
        );


      case "saveResult":

        return json(
          saveResult(data)
        );


      case "getStudentResult":

        return json(
          getStudentResult(data)
        );


      /* ==========================================
       * UNKNOWN ACTION
       * ========================================== */

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


/******************************************************
 * JSON OUTPUT
 ******************************************************/

function json(obj) {

  return ContentService

    .createTextOutput(
      JSON.stringify(obj)
    )

    .setMimeType(
      ContentService.MimeType.JSON
    );

}