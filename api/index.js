/**
 * ==========================================
 * SAF Speaking Online Test
 * Vercel API Gateway
 * api/index.js
 * Stable Foundation v5.0
 * ==========================================
 * Frontend
 *      │
 *      ▼
 *      /api
 *      │
 *      ▼
 * Google Apps Script
 *      │
 *      ▼
 * Google Spreadsheet
 * ==========================================
 */

const GAS_URL =
  "https://script.google.com/macros/s/AKfycbz8oMX2172-skeQ9Gv9Cn3bugI__qybA_Vgqf_DCUtDhu870CvDG8fGH7ORvsqg8niB/exec";

export default async function handler(req, res) {

    if (req.method !== "POST") {

        return res.status(405).json({

            success: false,

            message: "Method Not Allowed"

        });

    }

    try {

        const payload = req.body || {};

        const response = await fetch(GAS_URL, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(payload)

        });

        const text = await response.text();

        let result;

        try {

            result = JSON.parse(text);

        }

        catch {

            return res.status(500).json({

                success: false,

                message: "Google Apps Script returned invalid JSON.",

                raw: text

            });

        }

        return res.status(200).json(result);

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: err.message || "Internal Server Error"

        });

    }

}