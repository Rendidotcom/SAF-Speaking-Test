/**
 * ==========================================
 * Exam.gs
 * SAF Speaking Online Test
 * Stable Foundation v1.0
 * ==========================================
 */

function createExamToken(data) {

  const sheet = SpreadsheetApp
    .openById(CONFIG.SPREADSHEET_ID)
    .getSheetByName(CONFIG.SHEET.TOKEN);

  if (!sheet) {
    return failed("Sheet Token tidak ditemukan.");
  }

  const token = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  sheet.appendRow([
    token,
    data.kelas || "",
    "ACTIVE",
    data.expired || "",
    data.createdBy || "Teacher",
    new Date(),
    new Date(),
    data.note || ""
  ]);

  return {
    success: true,
    token: token,
    message: "Exam token created."
  };

}


function getExamToken() {

  const sheet = SpreadsheetApp
    .openById(CONFIG.SPREADSHEET_ID)
    .getSheetByName(CONFIG.SHEET.TOKEN);

  if (!sheet) {
    return failed("Sheet Token tidak ditemukan.");
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

      token: values[i][0],
      kelas: values[i][1],
      status: values[i][2],
      expired: values[i][3],
      createdBy: values[i][4],
      createdAt: values[i][5],
      updatedAt: values[i][6],
      note: values[i][7]

    });

  }

  return {
    success: true,
    data: result
  };

}


function updateExamToken(data) {

  const sheet = SpreadsheetApp
    .openById(CONFIG.SPREADSHEET_ID)
    .getSheetByName(CONFIG.SHEET.TOKEN);

  if (!sheet) {
    return failed("Sheet Token tidak ditemukan.");
  }

  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {

    if (values[i][0] == data.token) {

      sheet.getRange(i + 1, 2).setValue(data.kelas);
      sheet.getRange(i + 1, 3).setValue(data.status);
      sheet.getRange(i + 1, 4).setValue(data.expired);
      sheet.getRange(i + 1, 7).setValue(new Date());
      sheet.getRange(i + 1, 8).setValue(data.note);

      return {
        success: true,
        message: "Exam token updated."
      };

    }

  }

  return failed("Token tidak ditemukan.");

}


function deleteExamToken(data) {

  const sheet = SpreadsheetApp
    .openById(CONFIG.SPREADSHEET_ID)
    .getSheetByName(CONFIG.SHEET.TOKEN);

  if (!sheet) {
    return failed("Sheet Token tidak ditemukan.");
  }

  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {

    if (values[i][0] == data.token) {

      sheet.deleteRow(i + 1);

      return {
        success: true,
        message: "Exam token deleted."
      };

    }

  }

  return failed("Token tidak ditemukan.");

}


function validateExamToken(data) {

  const sheet = SpreadsheetApp
    .openById(CONFIG.SPREADSHEET_ID)
    .getSheetByName(CONFIG.SHEET.TOKEN);

  if (!sheet) {
    return failed("Sheet Token tidak ditemukan.");
  }

  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {

    if (
      values[i][0] == data.token &&
      values[i][2] == "ACTIVE"
    ) {

      return {
        success: true,
        valid: true,
        kelas: values[i][1],
        expired: values[i][3]
      };

    }

  }

  return {
    success: false,
    valid: false,
    message: "Token tidak valid."
  };

}