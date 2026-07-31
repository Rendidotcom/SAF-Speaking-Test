/**
 * ==========================================
 * STUDENT MODULE
 * SAF Speaking Online Test
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
    return failed("Sheet Student tidak ditemukan.");
  }

  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {

    if (String(values[i][0]) === String(data.nis)) {

      return failed("NIS sudah terdaftar.");

    }

  }

  sheet.appendRow([

    data.nis,

    data.nama,

    data.kelas,

    data.username,

    data.password,

    "Active",

    new Date(),

    new Date()

  ]);

  return success({

    message: "Student berhasil ditambahkan."

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

    return failed("Sheet Student tidak ditemukan.");

  }

  const values = sheet.getDataRange().getValues();

  const result = [];

  for (let i = 1; i < values.length; i++) {

    result.push({

      nis: values[i][0],

      nama: values[i][1],

      kelas: values[i][2],

      username: values[i][3],

      password: values[i][4],

      status: values[i][5],

      createdAt: values[i][6],

      updatedAt: values[i][7]

    });

  }

  return success({

    data: result

  });

}

/* =====================================================
   UPDATE STUDENT
===================================================== */

function updateStudent(data) {

  const sheet =
    SpreadsheetApp
      .openById(CONFIG.SPREADSHEET_ID)
      .getSheetByName(CONFIG.SHEET.STUDENT);

  if (!sheet) {

    return failed("Sheet Student tidak ditemukan.");

  }

  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {

    if (String(values[i][0]) === String(data.nis)) {

      sheet.getRange(i + 1, 2).setValue(data.nama);
      sheet.getRange(i + 1, 3).setValue(data.kelas);
      sheet.getRange(i + 1, 4).setValue(data.username);
      sheet.getRange(i + 1, 5).setValue(data.password);
      sheet.getRange(i + 1, 6).setValue(data.status);
      sheet.getRange(i + 1, 8).setValue(new Date());

      return success({

        message: "Student berhasil diupdate."

      });

    }

  }

  return failed("Student tidak ditemukan.");

}

/* =====================================================
   DELETE STUDENT
===================================================== */

function deleteStudent(data) {

  const sheet =
    SpreadsheetApp
      .openById(CONFIG.SPREADSHEET_ID)
      .getSheetByName(CONFIG.SHEET.STUDENT);

  if (!sheet) {

    return failed("Sheet Student tidak ditemukan.");

  }

  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {

    if (String(values[i][0]) === String(data.nis)) {

      sheet.deleteRow(i + 1);

      return success({

        message: "Student berhasil dihapus."

      });

    }

  }

  return failed("Student tidak ditemukan.");

}