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
        return getQuestion();

      case "saveScore":
        return saveScore(data);

      default:
        return failed("Unknown API Action : " + action);

    }

  } catch (err) {

    return failed(err.toString());

  }

}

/* =====================================================
   QUESTIONS
===================================================== */

function insertQuestion(data) {

    const sheet =
      SpreadsheetApp
      .openById(SPREADSHEET_ID)
      .getSheetByName("Questions");

  if (!sheet) {

    return failed("Sheet 'Questions' tidak ditemukan.");

  }

  const id = Utilities.getUuid();

  sheet.appendRow([
    id,
    data.topic,
    data.question,
    data.level,
    data.timeLimit,
    "active",
    new Date(),
    new Date()
  ]);

  return {
    success: true,
    message: "Question added successfully."
  };

}

function getQuestion() {

  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName("Questions");

  if (!sheet) {

    return failed("Sheet 'Questions' tidak ditemukan.");

  }

  const values = sheet.getDataRange().getValues();

  if (values.length <= 1) {

    return {
      success: true,
      data: []
    };

  }

  const result = [];

  for (let i = 1; i < values.length; i++) {

    result.push({

      id: values[i][0],
      topic: values[i][1],
      question: values[i][2],
      level: values[i][3],
      timeLimit: values[i][4],
      status: values[i][5]

    });

  }

  return {

    success: true,
    data: result

  };

}