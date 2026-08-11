/**
 * ==========================================
 * SAF SPEAKING ONLINE TEST
 * Vercel API Gateway
 * api/index.js
 *
 * FINAL STABLE FOUNDATION
 *
 * Frontend
 *    ↓
 * Vercel /api
 *    ↓
 * Main.gs Google Apps Script
 *    ↓
 * Google Spreadsheet
 * ==========================================
 */

const GAS_URL =
  "https://script.google.com/macros/s/AKfycbxaDPvFccT0lsemIjUaAJ4QS1ouJA-6f5-vUWdAYn3_LVHcI1rKCUy7KcuNYuJZDViI/exec";


export default async function handler(req, res) {

  /**
   * ========================================
   * METHOD CHECK
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
     * ========================================
     * REQUEST BODY
     * ========================================
     */

    const payload = req.body || {};


    /**
     * ========================================
     * VALIDATE ACTION
     * ========================================
     */

    if (!payload.action) {

      return res.status(400).json({

        success: false,

        message: "Action tidak ditemukan."

      });

    }


    /**
     * ========================================
     * FORWARD TO GOOGLE APPS SCRIPT
     * ========================================
     */

    const response = await fetch(GAS_URL, {

      method: "POST",

      headers: {

        "Content-Type": "application/json"

      },

      body: JSON.stringify({

        action: payload.action,

        data: payload.data || {}

      })

    });


    /**
     * ========================================
     * READ RESPONSE
     * ========================================
     */

    const text = await response.text();


    /**
     * ========================================
     * PARSE JSON
     * ========================================
     */

    let result;

    try {

      result = JSON.parse(text);

    }

    catch (parseError) {

      console.error(
        "GAS INVALID JSON:",
        text
      );

      return res.status(502).json({

        success: false,

        message:
          "Google Apps Script returned invalid JSON.",

        raw: text

      });

    }


    /**
     * ========================================
     * RETURN GAS RESPONSE
     * ========================================
     */

    return res
      .status(response.ok ? 200 : response.status)
      .json(result);

  }


  /**
   * ========================================
   * ERROR HANDLER
   * ========================================
   */

  catch (err) {

    console.error(
      "VERCEL API ERROR:",
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