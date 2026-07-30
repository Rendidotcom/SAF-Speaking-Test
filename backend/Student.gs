/**
 * ==========================================
 * SAF Speaking Online Test
 * Student Module
 * Stable Foundation v1.0
 * ==========================================
 */

/* =====================================================
   INSERT STUDENT
===================================================== */

function insertStudent(data) {

  const sheet =
    SpreadsheetApp
      .openById(CONFIG.SPREADSHEET_ID)
      .getSheetByName(CONFIG.SHEET.STUDENT);

  if (!sheet) {

    return failed("Sheet 'Student' not found.");

  }

  const id = Utilities.getUuid();

  sheet.appendRow([

    id,
    data.nis,
    data.name,
    data.class,
    data.gender,
    "active",
    new Date(),
    new Date()

  ]);

  return success({

    message: "Student added successfully."

  });

}

/* =====================================================
   GET STUDENT
===================================================== */

function getStudent() {

  const sheet =
    SpreadsheetApp
      .openById(CONFIG.SPREADSHEET_ID)
      .getSheetByName(CONFIG.SHEET.STUDENT);

  if (!sheet) {

    return failed("Sheet 'Student' not found.");

  }

  const values = sheet.getDataRange().getValues();

  if (values.length <= 1) {

    return success([]);

  }

  const result = [];

  for (let i = 1; i < values.length; i++) {

    result.push({

      id: values[i][0],

      nis: values[i][1],

      name: values[i][2],

      class: values[i][3],

      gender: values[i][4],

      status: values[i][5],

      createdAt: values[i][6],

      updatedAt: values[i][7]

    });

  }

  return success(result);

}