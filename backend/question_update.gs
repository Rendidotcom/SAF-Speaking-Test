/**
 * ==========================================
 * UPDATE SPEAKING QUESTION
 * Stable Foundation v1.0
 * ==========================================
 */

function updateQuestion(data) {

  try {

    const sheet = SpreadsheetApp
      .openById(CONFIG.SPREADSHEET_ID)
      .getSheetByName("Questions");

    if (!sheet) {
      return failed("Sheet Questions tidak ditemukan.");
    }

    const values = sheet.getDataRange().getValues();

    for (let i = 1; i < values.length; i++) {

      if (values[i][0] == data.id) {

        sheet.getRange(i + 1, 2).setValue(data.topic);
        sheet.getRange(i + 1, 3).setValue(data.question);
        sheet.getRange(i + 1, 4).setValue(data.level);
        sheet.getRange(i + 1, 5).setValue(data.timeLimit);
        sheet.getRange(i + 1, 8).setValue(new Date());

        return success(
          null,
          "Question updated successfully."
        );

      }

    }

    return failed("Question not found.");

  } catch (err) {

    return failed(err.toString());

  }

}