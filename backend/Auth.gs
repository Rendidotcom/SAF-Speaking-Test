/**
 * ==========================================
 * SAF Speaking Online Test
 * Authentication Module
 * Stable Foundation v3.1
 * ==========================================
 */


/**
 * ==========================================
 * LOGIN ROUTER
 * ==========================================
 */

function login(data) {

  try {

    const username = String(data.username || "").trim();
    const password = String(data.password || "").trim();
    const role = String(data.role || "").trim().toLowerCase();


    if (!username || !password) {

      return failed(
        "Username dan password wajib diisi."
      );

    }


    switch(role) {


      case "teacher":

        return teacherLogin(
          username,
          password
        );


      case "student":

        return studentLogin(
          username,
          password
        );


      default:

        return failed(
          "Role tidak valid."
        );

    }


  } catch(err) {


    try {

      writeLog(
        "LOGIN ERROR",
        err.toString()
      );

    } catch(e){}


    return failed(
      err.toString()
    );


  }

}


/**
 * ==========================================
 * TEACHER LOGIN
 * Sheet : Teacher
 *
 * Struktur:
 * id
 * nama
 * username
 * password
 * role
 * ==========================================
 */

function teacherLogin(username, password) {


  const rows = getRows("Teacher");


  if (!rows || rows.length <= 1) {

    return failed(
      "Data Teacher kosong atau tidak ditemukan."
    );

  }


  for (
    let i = 1;
    i < rows.length;
    i++
  ) {


    const row = rows[i];


    const dbUsername =
      String(row[2] || "").trim();


    const dbPassword =
      String(row[3] || "").trim();



    if (

      dbUsername === username &&

      dbPassword === password

    ) {


      return success({

        message:
          "Login teacher berhasil.",


        token:
          uuid(),


        user: {

          id:
            row[0],

          nama:
            row[1],

          username:
            row[2],

          role:
            row[4]

        }

      });


    }


  }


  return failed(
    "Username atau password teacher salah."
  );


}


/**
 * ==========================================
 * STUDENT LOGIN
 * Sheet : Student
 *
 * Struktur:
 * id
 * nama
 * kelas
 * username
 * password
 * ==========================================
 */

function studentLogin(username, password) {


  const rows = getRows("Student");


  if (!rows || rows.length <= 1) {

    return failed(
      "Data Student kosong atau tidak ditemukan."
    );

  }


  for (
    let i = 1;
    i < rows.length;
    i++
  ) {


    const row = rows[i];


    const dbUsername =
      String(row[3] || "").trim();


    const dbPassword =
      String(row[4] || "").trim();



    if (

      dbUsername === username &&

      dbPassword === password

    ) {


      return success({

        message:
          "Login student berhasil.",


        token:
          uuid(),


        user: {

          nis:
            row[0],

          nama:
            row[1],

          kelas:
            row[2],

          username:
            row[3],

          role:
            "student"

        }

      });


    }


  }


  return failed(
    "Username atau password student salah."
  );


}