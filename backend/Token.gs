/******************************************************
 * SAF SPEAKING ONLINE TEST
 * TOKEN MODULE
 *
 * File: backend/Token.gs
 *
 * ROLE:
 * - Generate Exam Token
 * - Create Exam Token
 * - Get All Token
 * - Validate Token
 * - Disable Token
 * - Delete Token
 *
 * STABLE FOUNDATION
 ******************************************************/


/******************************************************
 * GENERATE RANDOM TOKEN
 ******************************************************/

function generateToken(length) {

  length = length || 6;

  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let token = "";

  while (token.length < length) {

    token += chars.charAt(
      Math.floor(
        Math.random() * chars.length
      )
    );

  }

  return token;

}


/******************************************************
 * CREATE EXAM TOKEN
 ******************************************************/

function createToken(data) {

  try {

    /**************************************************
     * VALIDATE DATA
     **************************************************/

    if (!data) {

      return failed(
        "Data token tidak ditemukan."
      );

    }


    /**************************************************
     * GET TOKEN SHEET
     **************************************************/

    const sh = sheet(
      CONFIG.SHEET.TOKEN
    );


    if (!sh) {

      return failed(
        "Sheet Token tidak ditemukan."
      );

    }


    /**************************************************
     * GENERATE TOKEN
     **************************************************/

    const token = generateToken(6);

    const now = new Date();


    /**************************************************
     * SAVE TOKEN
     **************************************************/

    sh.appendRow([

      token,

      data.kelas || "",

      "ACTIVE",

      Number(
        data.expired || 30
      ),

      data.createdBy || "Teacher",

      now,

      now,

      data.note || ""

    ]);


    /**************************************************
     * SUCCESS
     **************************************************/

    return success({

      message:
        "Exam token created.",

      token:
        token

    });

  }

  catch (err) {

    return failed(
      err.toString()
    );

  }

}


/******************************************************
 * GET ALL TOKEN
 ******************************************************/

function getToken() {

  try {

    /**************************************************
     * GET DATA
     **************************************************/

    const rows = getRows(
      CONFIG.SHEET.TOKEN
    );


    /**************************************************
     * EMPTY DATA
     **************************************************/

    if (
      !rows ||
      rows.length <= 1
    ) {

      return success({

        data: []

      });

    }


    /**************************************************
     * BUILD RESPONSE
     **************************************************/

    const data = [];


    for (
      let i = 1;
      i < rows.length;
      i++
    ) {

      data.push({

        token:
          rows[i][0],

        kelas:
          rows[i][1],

        status:
          rows[i][2],

        expired:
          rows[i][3],

        createdBy:
          rows[i][4],

        createdAt:
          rows[i][5],

        updatedAt:
          rows[i][6],

        note:
          rows[i][7]

      });

    }


    /**************************************************
     * SUCCESS
     **************************************************/

    return success({

      data:
        data

    });

  }

  catch (err) {

    return failed(
      err.toString()
    );

  }

}


/******************************************************
 * VALIDATE TOKEN
 ******************************************************/

function validateToken(data) {

  try {

    /**************************************************
     * VALIDATE INPUT
     **************************************************/

    if (
      !data ||
      !data.token
    ) {

      return failed(
        "Token tidak ditemukan."
      );

    }


    /**************************************************
     * GET TOKEN DATA
     **************************************************/

    const rows = getRows(
      CONFIG.SHEET.TOKEN
    );


    /**************************************************
     * SEARCH TOKEN
     **************************************************/

    for (
      let i = 1;
      i < rows.length;
      i++
    ) {

      if (

        rows[i][0] == data.token &&

        rows[i][2] == "ACTIVE"

      ) {

        return success({

          valid:
            true,

          token:
            rows[i][0],

          kelas:
            rows[i][1],

          expired:
            rows[i][3]

        });

      }

    }


    /**************************************************
     * TOKEN INVALID
     **************************************************/

    return {

      success:
        false,

      valid:
        false,

      message:
        "Token tidak valid."

    };

  }

  catch (err) {

    return failed(
      err.toString()
    );

  }

}


/******************************************************
 * DISABLE TOKEN
 ******************************************************/

function disableToken(data) {

  try {

    /**************************************************
     * VALIDATE INPUT
     **************************************************/

    if (
      !data ||
      !data.token
    ) {

      return failed(
        "Token tidak ditemukan."
      );

    }


    /**************************************************
     * GET TOKEN SHEET
     **************************************************/

    const sh = sheet(
      CONFIG.SHEET.TOKEN
    );


    if (!sh) {

      return failed(
        "Sheet Token tidak ditemukan."
      );

    }


    /**************************************************
     * GET ROWS
     **************************************************/

    const rows =
      sh.getDataRange()
        .getValues();


    /**************************************************
     * SEARCH TOKEN
     **************************************************/

    for (
      let i = 1;
      i < rows.length;
      i++
    ) {

      if (
        rows[i][0] == data.token
      ) {

        /**********************************************
         * STATUS
         **********************************************/

        sh
          .getRange(i + 1, 3)
          .setValue("DISABLED");


        /**********************************************
         * UPDATED AT
         **********************************************/

        sh
          .getRange(i + 1, 7)
          .setValue(new Date());


        /**********************************************
         * SUCCESS
         **********************************************/

        return success({

          message:
            "Token disabled."

        });

      }

    }


    /**************************************************
     * TOKEN NOT FOUND
     **************************************************/

    return failed(
      "Token tidak ditemukan."
    );

  }

  catch (err) {

    return failed(
      err.toString()
    );

  }

}


/******************************************************
 * DELETE TOKEN
 ******************************************************/

function deleteToken(data) {

  try {

    /**************************************************
     * VALIDATE INPUT
     **************************************************/

    if (
      !data ||
      !data.token
    ) {

      return failed(
        "Token tidak ditemukan."
      );

    }


    /**************************************************
     * GET TOKEN SHEET
     **************************************************/

    const sh = sheet(
      CONFIG.SHEET.TOKEN
    );


    if (!sh) {

      return failed(
        "Sheet Token tidak ditemukan."
      );

    }


    /**************************************************
     * GET ROWS
     **************************************************/

    const rows =
      sh.getDataRange()
        .getValues();


    /**************************************************
     * SEARCH TOKEN
     **************************************************/

    for (
      let i = 1;
      i < rows.length;
      i++
    ) {

      if (
        rows[i][0] == data.token
      ) {

        /**********************************************
         * DELETE ROW
         **********************************************/

        sh.deleteRow(
          i + 1
        );


        /**********************************************
         * SUCCESS
         **********************************************/

        return success({

          message:
            "Token deleted."

        });

      }

    }


    /**************************************************
     * TOKEN NOT FOUND
     **************************************************/

    return failed(
      "Token tidak ditemukan."
    );

  }

  catch (err) {

    return failed(
      err.toString()
    );

  }

}