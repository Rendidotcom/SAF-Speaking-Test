/**
 * ==========================================
 * SAF Speaking Online Test
 * Vercel API Gateway
 * api/index.js
 * Stable Foundation
 * ==========================================
 */

const GAS_URL =
  "https://script.google.com/macros/s/AKfycbz9SwwEx1tTWFVwDZYZwRpTiRt97x20EnK5yO7WUl3XebrFoHPQKQzT7hQOM8bD03rq/exec";


export default async function handler(req, res) {

  /**
   * ========================================
   * METHOD VALIDATION
   * ========================================
   */

  if (req.method !== "POST") {

    return res.status(405).json({

      success: false,

      message: "Method Not Allowed"

    });

  }


  try {

    /**
     * ======================================
     * REQUEST BODY
     * ======================================
     */

    const payload = req.body || {};


    console.log(
      "Vercel → GAS REQUEST:",
      JSON.stringify(payload)
    );


    /**
     * ======================================
     * SEND TO GAS
     * ======================================
     */

    const response = await fetch(

      GAS_URL,

      {

        method: "POST",

        headers: {

          "Content-Type":
            "application/json"

        },

        body:
          JSON.stringify(payload)

      }

    );


    /**
     * ======================================
     * READ RESPONSE
     * ======================================
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
     * ======================================
     * PARSE JSON
     * ======================================
     */

    let result;


    try {

      result =
        JSON.parse(text);

    }

    catch (parseError) {

      return res.status(500).json({

        success: false,

        message:
          "Google Apps Script returned invalid JSON.",

        gasStatus:
          response.status,

        raw:
          text

      });

    }


    /**
     * ======================================
     * RETURN TO FRONTEND
     * ======================================
     */

    return res.status(200).json(
      result
    );


  }

  catch (err) {

    console.error(
      "Vercel API ERROR:",
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