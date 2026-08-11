/**
 * ==========================================
 * SAF Speaking Online Test
 * Student Delete Module
 * Stable Foundation v1.0
 * ==========================================
 */

/* =====================================================
   DELETE STUDENT
===================================================== */

function deleteStudent(data) {

  const sheet =
    SpreadsheetApp
      .openById(CONFIG.SPREADSHEET_ID)
      .getSheetByName(CONFIG.SHEET.STUDENT);

  if (!sheet) {

    return failed("Sheet 'Student' not found.");

  }

  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {

    if (values[i][0] == data.id) {

      sheet.deleteRow(i + 1);

      return success({

        message: "Student deleted successfully."

      });

    }

  }

  return failed("Student not found.");

}