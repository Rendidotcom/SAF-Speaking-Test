/**
 * ==========================================
 * SAF Speaking Online Test
 * Main Entry Point
 * Version 1.0
 * ==========================================
 */

function doGet(e) {

  return ContentService
    .createTextOutput(
      JSON.stringify({
        success: true,
        app: APP_NAME,
        version: VERSION
      })
    )
    .setMimeType(ContentService.MimeType.JSON);

}

function doPost(e) {

  try {

    const request = JSON.parse(e.postData.contents);

    const action = request.action;
    const data = request.data || {};

    switch (action) {

      case "login":
        return login(data);

      case "insertQuestion":
        return insertQuestion(data);

      case "getQuestion":
        return getQuestion(data);

      case "saveScore":
        return saveScore(data);

      default:
        return failed("Unknown API Action : " + action);

    }

  } catch (err) {

    return failed(err.toString());

  }

}