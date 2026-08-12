/**
 * ==========================================
 * SAF Speaking Online Test
 * Main Router
 * Stable Foundation v4.2
 * ==========================================
 *
 * ROLE:
 *
 * - Satu-satunya doGet()
 * - Satu-satunya doPost()
 * - API Router
 *
 * BUSINESS LOGIC:
 *
 * - Auth.gs
 * - Question.gs
 * - Student.gs
 * - Token.gs
 * - Score.gs
 * - Result.gs
 *
 * NEW:
 *
 * - importStudents
 *
 * ==========================================
 */


/* =====================================================
GET
===================================================== */

function doGet(e) {

    try {

        return json({

            success:
                true,

            app:
                APP_NAME,

            version:
                VERSION,

            message:
                "SAF Speaking Online Test API is running."

        });

    }

    catch (err) {

        return json({

            success:
                false,

            message:
                err.toString()

        });

    }

}


/* =====================================================
POST
===================================================== */

function doPost(e) {

    try {

        /* ================================================
           VALIDATE REQUEST
        ================================================ */

        if (
            !e ||
            !e.postData ||
            !e.postData.contents
        ) {

            return json(
                failed(
                    "Request body tidak ditemukan."
                )
            );

        }


        /* ================================================
           PARSE REQUEST
        ================================================ */

        const request =
            JSON.parse(
                e.postData.contents
            );


        const action =
            request.action || "";


        const data =
            request.data || {};


        /* ================================================
           VALIDATE ACTION
        ================================================ */

        if (!action) {

            return json(
                failed(
                    "Action tidak ditemukan."
                )
            );

        }


        let result;


        /* ================================================
           ROUTER
        ================================================ */

        switch (action) {


            /* ==========================================
               AUTH
            ========================================== */

            case "login":

                result =
                    login(data);

                break;


            /* ==========================================
               QUESTION
            ========================================== */

            case "insertQuestion":

                result =
                    insertQuestion(data);

                break;


            case "getQuestion":

                result =
                    getQuestion();

                break;


            case "updateQuestion":

                result =
                    updateQuestion(data);

                break;


            case "deleteQuestion":

                result =
                    deleteQuestion(data);

                break;


            /* ==========================================
               STUDENT
            ========================================== */

            case "insertStudent":

                result =
                    insertStudent(data);

                break;


            case "getStudent":

                result =
                    getStudent();

                break;


            case "updateStudent":

                result =
                    updateStudent(data);

                break;


            case "deleteStudent":

                result =
                    deleteStudent(data);

                break;


            /* ==========================================
               STUDENT IMPORT
            ========================================== */

            case "importStudents":

                result =
                    importStudents(data);

                break;


            /* ==========================================
               TOKEN
            ========================================== */

            case "createToken":

                result =
                    createToken(data);

                break;


            case "getToken":

                result =
                    getToken();

                break;


            case "validateToken":

                result =
                    validateToken(data);

                break;


            case "disableToken":

                result =
                    disableToken(data);

                break;


            case "deleteToken":

                result =
                    deleteToken(data);

                break;


            /* ==========================================
               SCORE
            ========================================== */

            case "saveScore":

                result =
                    saveScore(data);

                break;


            /* ==========================================
               RESULT
            ========================================== */

            case "saveResult":

                result =
                    saveResult(data);

                break;


            case "getResult":

                result =
                    getResult();

                break;


            case "getStudentResult":

                result =
                    getStudentResult(data);

                break;


            case "updateResultScore":

                result =
                    updateResultScore(data);

                break;


            case "deleteResult":

                result =
                    deleteResult(data);

                break;


            case "deleteResults":

                result =
                    deleteResults(data);

                break;


            /* ==========================================
               UNKNOWN ACTION
            ========================================== */

            default:

                result =
                    failed(
                        "Unknown action : " +
                        action
                    );

                break;

        }


        /* ================================================
           RETURN JSON
        ================================================ */

        return json(
            result
        );

    }

    catch (err) {

        Logger.log(
            err
        );


        return json({

            success:
                false,

            message:
                err.toString(),

            stack:
                err.stack || ""

        });

    }

}


/* =====================================================
JSON OUTPUT
===================================================== */

function json(obj) {

    return ContentService

        .createTextOutput(
            JSON.stringify(obj)
        )

        .setMimeType(
            ContentService.MimeType.JSON
        );

}


/* =====================================================
END OF FILE
===================================================== */