const API_URL =
  "https://script.google.com/macros/s/AKfycbz8oMX2172-skeQ9Gv9Cn3bugI__qybA_Vgqf_DCUtDhu870CvDG8fGH7ORvsqg8niB/exec";

export default async function handler(req, res) {
   
    if (req.method !== "POST") {

        return res.status(405).json({

            success: false,

            message: "Method Not Allowed"

        });

    }

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(req.body)

        });

        const text = await response.text();

        let data;

        try {

            data = JSON.parse(text);

        } catch {

            return res.status(500).json({

                success: false,

                message: "Invalid JSON from Google Apps Script",

                raw: text

            });

        }

        return res.status(200).json(data);

    }

    catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

}