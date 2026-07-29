/**
 * ==========================================
 * SAF Speaking Online Test
 * Authentication Module
 * Version 1.0
 * ==========================================
 */

/**
 * Login
 */
function login(data) {

  try {

    const username = (data.username || "").trim();
    const password = (data.password || "").trim();
    const role = (data.role || "").trim();

    if (!username || !password) {
      return failed("Username dan password wajib diisi.");
    }

    if (role === "teacher") {
      return teacherLogin(username, password);
    }

    if (role === "student") {
      return studentLogin(username, password);
    }

    return failed("Role tidak valid.");

  } catch (err) {

    writeLog("LOGIN", err.toString());

    return failed(err.toString());

  }

}

/**
 * ==========================================
 * Teacher Login
 * ==========================================
 */

function teacherLogin(username, password) {

  const rows = getRows(CONFIG.SHEET.TEACHER);

  for (let i = 1; i < rows.length; i++) {

    const row = rows[i];

    if (
      row[2] === username &&
      row[3] === password
    ) {

      return success({

        message: "Login berhasil.",

        token: uuid(),

        user: {

          id: row[0],

          nama: row[1],

          username: row[2],

          role: row[4]

        }

      });

    }

  }

  return failed("Username atau password salah.");

}

/**
 * ==========================================
 * Student Login
 * ==========================================
 */

function studentLogin(username, password) {

  const rows = getRows(CONFIG.SHEET.STUDENT);

  for (let i = 1; i < rows.length; i++) {

    const row = rows[i];

    if (
      row[3] === username &&
      row[4] === password
    ) {

      return success({

        message: "Login berhasil.",

        token: uuid(),

        user: {

          nis: row[0],

          nama: row[1],

          kelas: row[2],

          username: row[3],

          role: "student"

        }

      });

    }

  }

  return failed("Username atau password salah.");

}