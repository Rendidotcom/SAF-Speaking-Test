/**
 * ==========================================
 * SAF Speaking Online Test
 * Database Installer
 * Version 1.0
 * ==========================================
 */

/**
 * Membuat seluruh sheet database
 */
function installDatabase() {

  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);

  const tables = [

    // =========================
    // Teacher
    // =========================
    {
      name: CONFIG.SHEET.TEACHER,
      header: [
        "id",
        "nama",
        "username",
        "password",
        "role",
        "createdAt"
      ]
    },

    // =========================
    // Student
    // =========================
    {
      name: CONFIG.SHEET.STUDENT,
      header: [
        "nis",
        "nama",
        "kelas",
        "username",
        "password",
        "createdAt"
      ]
    },

    // =========================
    // Speaking Question
    // =========================
    {
      name: CONFIG.SHEET.QUESTION,
      header: [
        "id",
        "title",
        "answer",
        "difficulty",
        "duration",
        "status",
        "createdBy",
        "createdAt"
      ]
    },

    // =========================
    // Exam Token
    // =========================
    {
      name: CONFIG.SHEET.TOKEN,
      header: [
        "token",
        "examName",
        "expiredAt",
        "status"
      ]
    },

    // =========================
    // Result
    // =========================
    {
      name: CONFIG.SHEET.RESULT,
      header: [
        "timestamp",
        "nis",
        "nama",
        "kelas",
        "questionId",
        "recognizedText",
        "answer",
        "accuracy",
        "score"
      ]
    },

    // =========================
    // Log
    // =========================
    {
      name: CONFIG.SHEET.LOG,
      header: [
        "timestamp",
        "module",
        "message"
      ]
    }

  ];

  tables.forEach(table => {

    let sh = ss.getSheetByName(table.name);

    if (!sh) {
      sh = ss.insertSheet(table.name);
    }

    sh.clearContents();

    sh.getRange(1, 1, 1, table.header.length)
      .setValues([table.header]);

    sh.setFrozenRows(1);

  });

}

/**
 * Membuat akun administrator pertama
 */
function installAdmin() {

  const rows = getRows(CONFIG.SHEET.TEACHER);

  if (rows.length === 1) {

    append(
      CONFIG.SHEET.TEACHER,
      [
        "T001",
        "Administrator",
        "admin",
        "admin123",
        "teacher",
        timestamp()
      ]
    );

  }

}

/**
 * Setup Database
 */
function setup() {

  installDatabase();

  installAdmin();

  Logger.log("=================================");
  Logger.log(APP_NAME);
  Logger.log("Database Installation Success");
  Logger.log("Version : " + VERSION);
  Logger.log("=================================");

}