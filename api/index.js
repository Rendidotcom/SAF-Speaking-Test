/**
 * ==========================================
 * SAF Speaking Online Test
 * Vercel API Gateway
 * api/index.js
 *
 * STABLE FOUNDATION v5.1
 * ==========================================
 *
 * Frontend
 *    ↓
 * /api
 *    ↓
 * Google Apps Script
 *    ↓
 * Google Spreadsheet
 *
 * ==========================================
 */

/**
 * ==========================================
 * GOOGLE APPS SCRIPT WEB APP
 * ACTIVE / CURRENT DEPLOYMENT
 * ==========================================
 */

const GAS_URL =
  "https://script.google.com/macros/s/AKfycbz9SwwEx1tTWFVwDZYZwRpTiRt97x20EnK5yO7WUl3XebrFoHPQKQzT7hQOM8bD03rq/exec";


/**
 * ==========================================
 * VERCEL SERVERLESS API
 * ==========================================
 */

export default async function handler(req, res) {

  /**
   * ----------------------------------------
   * ONLY POST
   * ----------------------------------------
   */

  if (req.method !== "POST") {

    return res.status(405).json({

      success: false,

      message: "Method Not Allowed"

    });

  }


  try {

    /**
     * --------------------------------------
     * GET FRONTEND PAYLOAD
     * --------------------------------------
     */

    const payload = req.body || {};


    /**
     * --------------------------------------
     * DEBUG
     * --------------------------------------
     */

    console.log(
      "SAF API REQUEST:",
      JSON.stringify(payload)
    );


    /**
     * --------------------------------------
     * SEND TO GAS
     * --------------------------------------
     */

    const response = await fetch(GAS_URL, {

      method: "POST",

      headers: {

        "Content-Type":
          "application/json"

      },

      body:
        JSON.stringify(payload)

    });


    /**
     * --------------------------------------
     * GET RAW RESPONSE
     * --------------------------------------
     */

    const text =
      await response.text();


    console.log(
      "GAS STATUS:",
      response.status
    );


    console.log(
      "GAS RESPONSE:",
      text
    );


    /**
     * --------------------------------------
     * PARSE JSON
     * --------------------------------------
     */

    let result;

    try {

      result =
        JSON.parse(text);

    }

    catch (parseError) {

      console.error(
        "GAS INVALID JSON:",
        text
      );

      return res.status(500).json({

        success: false,

        message:
          "Google Apps Script returned invalid JSON.",

        raw:
          text

      });

    }


    /**
     * --------------------------------------
     * RETURN GAS RESULT
     * --------------------------------------
     */

    return res.status(200).json(result);

  }


  /**
   * ========================================
   * ERROR HANDLER
   * ========================================
   */

  catch (err) {

    console.error(
      "SAF API ERROR:",
      err
    );


    return res.status(500).json({

      success: false,

      message:
        err.message ||
        "Internal Server Error"

    });

  }

}