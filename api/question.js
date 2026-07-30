const API_URL="https://script.google.com/macros/s/AKfycbzYttnrs2zFuvMdELWr8dH_Bj9a6166UpK19SuBCBgvTAsJEUyKSugIxgND37P0GySt/exec";

export default async function handler(req, res) {

    if (req.method !== "POST") {

        return res.status(405).json({
            success:false,
            message:"Method Not Allowed"
        });

    }

    try{

        const response = await fetch(GAS,{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify(req.body)

        });

        const text = await response.text();

        let data;

        try{

            data = JSON.parse(text);

        }catch(err){

            return res.status(500).json({

                success:false,
                message:"Invalid JSON Response",
                raw:text

            });

        }

        return res.status(200).json(data);

    }catch(err){

        return res.status(500).json({

            success:false,
            message:err.message

        });

    }

}