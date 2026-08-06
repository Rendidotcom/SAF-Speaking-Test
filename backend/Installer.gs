/**
 * ==========================================
 * SAF Speaking Online Test
 * Installer.gs
 * Stable Foundation v4.0
 * ==========================================
 *
 * Database Initializer
 *
 * NOTE:
 * Menjalankan installDatabase()
 * akan menghapus seluruh isi sheet.
 *
 * Jalankan hanya saat pertama kali
 * membuat database atau reset sistem.
 * ==========================================
 */


/* ==========================================
   INSTALL DATABASE
========================================== */

function installDatabase() {

  const ss = SpreadsheetApp.openById(
    CONFIG.SPREADSHEET_ID
  );

  const tables = [

    /* ======================================
       TEACHER
    ====================================== */

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


    /* ======================================
       STUDENT
    ====================================== */

    {

      name: CONFIG.SHEET.STUDENT,

      header: [

        "nis",

        "nama",

        "kelas",

        "username",

        "password",

        "status",

        "createdAt",

        "updatedAt"

      ]

    },


    /* ======================================
       QUESTION
    ====================================== */

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


    /* ======================================
       TOKEN
    ====================================== */

    {

      name: CONFIG.SHEET.TOKEN,

      header: [

        "token",

        "kelas",

        "status",

        "expired",

        "createdBy",

        "createdAt",

        "updatedAt",

        "note"

      ]

    },


    /* ======================================
       RESULT
    ====================================== */

    {

      name: CONFIG.SHEET.RESULT,

      header: [

        "id",

        "nis",

        "nama",

        "kelas",

        "questionId",

        "question",

        "transcript",

        "score",

        "feedback",

        "token",

        "createdAt",

        "updatedAt"

      ]

    },


    /* ======================================
       LOG
    ====================================== */

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

    sh.getRange(

      1,

      1,

      1,

      table.header.length

    ).setValues([table.header]);

    sh.setFrozenRows(1);

  });

}



/* ==========================================
   INSTALL DEFAULT ADMIN
========================================== */

function installAdmin() {

  const rows = getRows(
    CONFIG.SHEET.TEACHER
  );

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



/* ==========================================
   SETUP DATABASE
========================================== */

function setup() {

  installDatabase();

  installAdmin();

  Logger.log("=================================");

  Logger.log(APP_NAME);

  Logger.log("Database Installation Success");

  Logger.log("Version : " + VERSION);

  Logger.log("=================================");

}