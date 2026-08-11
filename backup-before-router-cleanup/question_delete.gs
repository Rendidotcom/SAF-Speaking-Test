/**
 * ==========================================
 * DELETE SPEAKING QUESTION
 * Stable Foundation v1.0
 * ==========================================
 */

function deleteQuestion(data) {

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

        sheet.deleteRow(i + 1);

        return success(
          null,
          "Question deleted successfully."
        );

      }

    }

    return failed("Question not found.");

  } catch (err) {

    return failed(err.toString());

  }

}