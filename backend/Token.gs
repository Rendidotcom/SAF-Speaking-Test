/**
 * ==========================================
 * Token.gs
 * SAF Speaking Online Test
 * Stable Foundation v3.1
 * ------------------------------------------
 * Module :
 * - Generate Exam Token
 * - Get Token
 * - Validate Token
 * - Disable Token
 * - Delete Token
 * ==========================================
 */

/**
 * ==========================================
 * Generate Random Token
 * ==========================================
 */
function generateToken(length) {

  length = length || 6;

  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let token = "";

  while (token.length < length) {

    token += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );

  }

  return token;

}

/**
 * ==========================================
 * Create Exam Token
 * ==========================================
 */
function createToken(data) {

  try {

    if (!data) {
      return failed("Data token tidak ditemukan.");
    }

    const sh = sheet(CONFIG.SHEET.TOKEN);

    if (!sh) {
      return failed("Sheet Token tidak ditemukan.");
    }

    const token = generateToken(6);

    const now = new Date();

    sh.appendRow([
      token,
      data.kelas || "",
      "ACTIVE",
      Number(data.expired || 30),
      data.createdBy || "Teacher",
      now,
      now,
      data.note || ""
    ]);

    return success({

      message: "Exam token created.",

      token: token

    });

  }

  catch (err) {

    return failed(err.toString());

  }

}

/**
 * ==========================================
 * Get All Token
 * ==========================================
 */
function getToken() {

  try {

    const rows = getRows(CONFIG.SHEET.TOKEN);

    if (rows.length <= 1) {

      return success({

        data: []

      });

    }

    const data = [];

    for (let i = 1; i < rows.length; i++) {

      data.push({

        token: rows[i][0],

        kelas: rows[i][1],

        status: rows[i][2],

        expired: rows[i][3],

        createdBy: rows[i][4],

        createdAt: rows[i][5],

        updatedAt: rows[i][6],

        note: rows[i][7]

      });

    }

    return success({

      data: data

    });

  }

  catch (err) {

    return failed(err.toString());

  }

}

/**
 * ==========================================
 * Validate Token
 * ==========================================
 */
function validateToken(data) {

  try {

    if (!data || !data.token) {

      return failed("Token tidak ditemukan.");

    }

    const rows = getRows(CONFIG.SHEET.TOKEN);

    for (let i = 1; i < rows.length; i++) {

      if (

        rows[i][0] == data.token &&

        rows[i][2] == "ACTIVE"

      ) {

        return success({

          valid: true,

          token: rows[i][0],

          kelas: rows[i][1],

          expired: rows[i][3]

        });

      }

    }

    return {

      success: false,

      valid: false,

      message: "Token tidak valid."

    };

  }

  catch (err) {

    return failed(err.toString());

  }

}

/**
 * ==========================================
 * Disable Token
 * ==========================================
 */
function disableToken(data) {

  try {

    const sh = sheet(CONFIG.SHEET.TOKEN);

    const rows = sh.getDataRange().getValues();

    for (let i = 1; i < rows.length; i++) {

      if (rows[i][0] == data.token) {

        sh.getRange(i + 1, 3).setValue("DISABLED");

        sh.getRange(i + 1, 7).setValue(new Date());

        return success({

          message: "Token disabled."

        });

      }

    }

    return failed("Token tidak ditemukan.");

  }

  catch (err) {

    return failed(err.toString());

  }

}

/**
 * ==========================================
 * Delete Token
 * ==========================================
 */
function deleteToken(data) {

  try {

    const sh = sheet(CONFIG.SHEET.TOKEN);

    const rows = sh.getDataRange().getValues();

    for (let i = 1; i < rows.length; i++) {

      if (rows[i][0] == data.token) {

        sh.deleteRow(i + 1);

        return success({

          message: "Token deleted."

        });

      }

    }

    return failed("Token tidak ditemukan.");

  }

  catch (err) {

    return failed(err.toString());

  }

}