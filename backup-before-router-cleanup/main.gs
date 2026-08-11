/**
 * ==========================================
 * SAF Speaking Online Test
 * Main Router
 * Stable Foundation v3.0
 * ==========================================
 */

/* =====================================================
   GET
===================================================== */

function doGet(e) {

  return ContentService
    .createTextOutput(
      JSON.stringify({

        success: true,

        app: APP_NAME,

        version: VERSION,

        message: "SAF Speaking Online Test API Running"

      })
    )
    .setMimeType(ContentService.MimeType.JSON);

}

/* =====================================================
   POST
===================================================== */

function doPost(e) {

  try {

    const request = JSON.parse(e.postData.contents);

    const action = request.action || "";

    const data = request.data || {};

    let result;

    switch (action) {

      /* ==========================
         LOGIN
      ========================== */

      case "login":

        result = login(data);

        break;

      /* ==========================
         QUESTION
      ========================== */

      case "insertQuestion":

        result = insertQuestion(data);

        break;

      case "getQuestion":

        result = getQuestion();

        break;

      case "updateQuestion":

        result = updateQuestion(data);

        break;

      case "deleteQuestion":

        result = deleteQuestion(data);

        break;

      /* ==========================
         STUDENT
      ========================== */

      case "insertStudent":

        result = insertStudent(data);

        break;

      case "getStudent":

        result = getStudent();

        break;

      case "updateStudent":

        result = updateStudent(data);

        break;

      case "deleteStudent":

        result = deleteStudent(data);

        break;

      /* ==========================
         SCORE
      ========================== */

      case "saveScore":

        result = saveScore(data);

        break;

      /* ==========================
         DEFAULT
      ========================== */

      default:

        result = failed("Unknown action : " + action);

    }

    return json(result);

  }

  catch (err) {

    return json({

      success: false,

      message: err.toString()

    });

  }

}

/* =====================================================
   JSON OUTPUT
===================================================== */

function json(obj) {

  return ContentService
    .createTextOutput(
      JSON.stringify(obj)
    )
    .setMimeType(ContentService.MimeType.JSON);

}