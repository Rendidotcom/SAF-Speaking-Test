/**
 * ==========================================
 * Token.gs
 * SAF Speaking Online Test
 * Stable Foundation v3.0
 * ==========================================
 */

/**
 * Generate random token
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
 * CREATE TOKEN
 * ==========================================
 */
function createToken(data) {

  try {

    const sh = sheet(CONFIG.SHEET.TOKEN);

    if (!sh) {
      return failed("Sheet Token tidak ditemukan.");
    }

    const token = generateToken(6);

    const now = timestamp();

    sh.appendRow([
      token,
      data.kelas || "",
      "ACTIVE",
      Number(data.expired || 30),
      "Teacher",
      now,
      now,
      ""
    ]);

    return success({

      message: "Token berhasil dibuat.",

      token: token

    });

  } catch (err) {

    return failed(err.toString());

  }

}

/**
 * ==========================================
 * GET TOKEN
 * ==========================================
 */
function getToken() {

  try {

    const rows = getRows(CONFIG.SHEET.TOKEN);

    const result = [];

    for (let i = 1; i < rows.length; i++) {

      result.push({

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

      data: result

    });

  } catch (err) {

    return failed(err.toString());

  }

}

/**
 * ==========================================
 * VALIDATE TOKEN
 * ==========================================
 */
function validateToken(data) {

  try {

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

    return failed("Token tidak valid.");

  } catch (err) {

    return failed(err.toString());

  }

}

/**
 * ==========================================
 * DISABLE TOKEN
 * ==========================================
 */
function disableToken(data) {

  try {

    const sh = sheet(CONFIG.SHEET.TOKEN);

    const rows = sh.getDataRange().getValues();

    for (let i = 1; i < rows.length; i++) {

      if (rows[i][0] == data.token) {

        sh.getRange(i + 1, 3).setValue("DISABLED");

        sh.getRange(i + 1, 7).setValue(timestamp());

        return success({

          message: "Token berhasil dinonaktifkan."

        });

      }

    }

    return failed("Token tidak ditemukan.");

  } catch (err) {

    return failed(err.toString());

  }

}

/**
 * ==========================================
 * DELETE TOKEN
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

          message: "Token berhasil dihapus."

        });

      }

    }

    return failed("Token tidak ditemukan.");

  } catch (err) {

    return failed(err.toString());

  }

}