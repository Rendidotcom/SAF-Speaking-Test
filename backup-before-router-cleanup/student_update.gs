/**
 * ==========================================
 * SAF Speaking Online Test
 * Student Update Module
 * Stable Foundation v1.0
 * ==========================================
 */

/* =====================================================
   UPDATE STUDENT
===================================================== */

function updateStudent(data) {

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

      sheet.getRange(i + 1, 2).setValue(data.nis);

      sheet.getRange(i + 1, 3).setValue(data.name);

      sheet.getRange(i + 1, 4).setValue(data.class);

      sheet.getRange(i + 1, 5).setValue(data.gender);

      sheet.getRange(i + 1, 8).setValue(new Date());

      return success({

        message: "Student updated successfully."

      });

    }

  }

  return failed("Student not found.");

}