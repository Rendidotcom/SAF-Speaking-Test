/**
 * ==========================================
 * SAF Speaking Online Test
 * RESULT MODULE
 * Stable Foundation v2.1
 * ==========================================
 *
 * RESPONSIBILITY:
 *
 * - Save speaking result
 * - Get all result
 * - Get result by NIS
 * - Update score
 * - Delete result
 * - Delete multiple results
 *
 * DATABASE:
 *
 * - Uses Spreadsheet.gs
 * - Uses sheet()
 * - Uses getRows()
 *
 * RESULT SHEET COLUMNS:
 *
 * A  id
 * B  nis
 * C  nama
 * D  kelas
 * E  questionId
 * F  question
 * G  transcript
 * H  score
 * I  feedback
 * J  token
 * K  createdAt
 * L  updatedAt
 *
 * ==========================================
 */

const RESULT_SHEET = "Result";


/* ==========================================
SAVE RESULT
========================================== */

function saveResult(data) {

    try {

        /* --------------------------------------
           VALIDATE DATA
        -------------------------------------- */

        if (!data) {

            return failed(
                "Data result tidak ditemukan."
            );

        }


        /* --------------------------------------
           GET RESULT SHEET
        -------------------------------------- */

        const sh =
            sheet(RESULT_SHEET);


        if (!sh) {

            return failed(
                "Sheet Result tidak ditemukan."
            );

        }


        /* --------------------------------------
           GENERATE ID & TIMESTAMP
        -------------------------------------- */

        const id =
            uuid();


        const now =
            new Date();


        /* --------------------------------------
           APPEND RESULT
        -------------------------------------- */

        sh.appendRow([

            id,

            data.nis || "",

            data.nama || "",

            data.kelas || "",

            data.questionId || "",

            data.question || "",

            data.transcript || "",

            data.score || 0,

            data.feedback || "",

            data.token || "",

            now,

            now

        ]);


        /* --------------------------------------
           SUCCESS
        -------------------------------------- */

        return success({

            id:
                id,

            message:
                "Result saved successfully."

        });

    }

    catch (err) {

        Logger.log(
            "saveResult ERROR: " +
            err.toString()
        );


        return failed(
            err.toString()
        );

    }

}


/* ==========================================
GET ALL RESULT
========================================== */

function getResult() {

    try {

        /* --------------------------------------
           GET ROWS
        -------------------------------------- */

        const rows =
            getRows(
                RESULT_SHEET
            );


        /* --------------------------------------
           EMPTY RESULT
        -------------------------------------- */

        if (
            !rows ||
            rows.length <= 1
        ) {

            return success([]);

        }


        /* --------------------------------------
           BUILD RESULT LIST
        -------------------------------------- */

        const result =
            [];


        for (
            let i = 1;
            i < rows.length;
            i++
        ) {

            const r =
                rows[i];


            result.push({

                id:
                    r[0],

                nis:
                    r[1],

                nama:
                    r[2],

                kelas:
                    r[3],

                questionId:
                    r[4],

                question:
                    r[5],

                transcript:
                    r[6],

                score:
                    r[7],

                feedback:
                    r[8],

                token:
                    r[9],

                createdAt:
                    r[10],

                updatedAt:
                    r[11]

            });

        }


        return success(
            result
        );

    }

    catch (err) {

        Logger.log(
            "getResult ERROR: " +
            err.toString()
        );


        return failed(
            err.toString()
        );

    }

}


/* ==========================================
GET RESULT BY NIS
========================================== */

function getStudentResult(data) {

    try {

        /* --------------------------------------
           VALIDATE DATA
        -------------------------------------- */

        if (!data) {

            return failed(
                "Data student tidak ditemukan."
            );

        }


        if (
            data.nis === undefined ||
            data.nis === null ||
            String(data.nis).trim() === ""
        ) {

            return failed(
                "NIS tidak ditemukan."
            );

        }


        /* --------------------------------------
           GET ROWS
        -------------------------------------- */

        const rows =
            getRows(
                RESULT_SHEET
            );


        const list =
            [];


        /* --------------------------------------
           SEARCH BY NIS
        -------------------------------------- */

        for (
            let i = 1;
            i < rows.length;
            i++
        ) {

            const r =
                rows[i];


            if (
                String(r[1]) ===
                String(data.nis)
            ) {

                list.push({

                    id:
                        r[0],

                    nis:
                        r[1],

                    nama:
                        r[2],

                    kelas:
                        r[3],

                    questionId:
                        r[4],

                    question:
                        r[5],

                    transcript:
                        r[6],

                    score:
                        r[7],

                    feedback:
                        r[8],

                    token:
                        r[9],

                    createdAt:
                        r[10],

                    updatedAt:
                        r[11]

                });

            }

        }


        return success(
            list
        );

    }

    catch (err) {

        Logger.log(
            "getStudentResult ERROR: " +
            err.toString()
        );


        return failed(
            err.toString()
        );

    }

}


/* ==========================================
UPDATE RESULT SCORE
========================================== */

function updateResultScore(data) {

    try {

        /* --------------------------------------
           VALIDATE DATA
        -------------------------------------- */

        if (!data) {

            return failed(
                "Data update tidak ditemukan."
            );

        }


        if (
            data.id === undefined ||
            data.id === null ||
            String(data.id).trim() === ""
        ) {

            return failed(
                "Result ID tidak ditemukan."
            );

        }


        /* --------------------------------------
           GET SHEET
        -------------------------------------- */

        const sh =
            sheet(
                RESULT_SHEET
            );


        if (!sh) {

            return failed(
                "Sheet Result tidak ditemukan."
            );

        }


        /* --------------------------------------
           READ DATA
        -------------------------------------- */

        const rows =
            sh
                .getDataRange()
                .getValues();


        /* --------------------------------------
           FIND RESULT
        -------------------------------------- */

        for (
            let i = 1;
            i < rows.length;
            i++
        ) {

            if (
                String(rows[i][0]) ===
                String(data.id)
            ) {

                /* ------------------------------
                   COLUMN H = SCORE
                   Sheet column 8
                ------------------------------ */

                sh
                    .getRange(
                        i + 1,
                        8
                    )
                    .setValue(
                        data.score || 0
                    );


                /* ------------------------------
                   COLUMN I = FEEDBACK
                   Sheet column 9
                ------------------------------ */

                sh
                    .getRange(
                        i + 1,
                        9
                    )
                    .setValue(
                        data.feedback || ""
                    );


                /* ------------------------------
                   COLUMN L = UPDATED AT
                   Sheet column 12
                ------------------------------ */

                sh
                    .getRange(
                        i + 1,
                        12
                    )
                    .setValue(
                        new Date()
                    );


                return success({

                    id:
                        data.id,

                    message:
                        "Score updated."

                });

            }

        }


        return failed(
            "Result not found."
        );

    }

    catch (err) {

        Logger.log(
            "updateResultScore ERROR: " +
            err.toString()
        );


        return failed(
            err.toString()
        );

    }

}


/* ==========================================
DELETE RESULT
========================================== */

function deleteResult(data) {

    try {

        /* --------------------------------------
           VALIDATE DATA
        -------------------------------------- */

        if (!data) {

            return failed(
                "Data delete tidak ditemukan."
            );

        }


        if (
            data.id === undefined ||
            data.id === null ||
            String(data.id).trim() === ""
        ) {

            return failed(
                "Result ID tidak ditemukan."
            );

        }


        /* --------------------------------------
           GET SHEET
        -------------------------------------- */

        const sh =
            sheet(
                RESULT_SHEET
            );


        if (!sh) {

            return failed(
                "Sheet Result tidak ditemukan."
            );

        }


        /* --------------------------------------
           READ DATA
        -------------------------------------- */

        const rows =
            sh
                .getDataRange()
                .getValues();


        /* --------------------------------------
           FIND RESULT
           Search from bottom
        -------------------------------------- */

        for (
            let i = rows.length - 1;
            i >= 1;
            i--
        ) {

            if (
                String(rows[i][0]) ===
                String(data.id)
            ) {

                sh.deleteRow(
                    i + 1
                );


                return success({

                    id:
                        data.id,

                    message:
                        "Result deleted."

                });

            }

        }


        return failed(
            "Result not found."
        );

    }

    catch (err) {

        Logger.log(
            "deleteResult ERROR: " +
            err.toString()
        );


        return failed(
            err.toString()
        );

    }

}


/* ==========================================
DELETE MULTIPLE RESULTS
========================================== */

/**
 * Delete multiple Result rows by ID.
 *
 * Expected:
 *
 * {
 *     ids: [
 *         "id-1",
 *         "id-2",
 *         "id-3"
 *     ]
 * }
 *
 * Rows are deleted from bottom to top
 * so spreadsheet row positions remain valid.
 */

function deleteResults(data) {

    try {

        /* --------------------------------------
           VALIDATE DATA
        -------------------------------------- */

        if (!data) {

            return failed(
                "Data delete tidak ditemukan."
            );

        }


        if (
            !Array.isArray(data.ids)
        ) {

            return failed(
                "Result IDs harus berupa array."
            );

        }


        /* --------------------------------------
           CLEAN IDS
        -------------------------------------- */

        const ids =
            data.ids
                .map(
                    function (id) {

                        return String(
                            id === null ||
                            typeof id === "undefined"
                                ? ""
                                : id
                        ).trim();

                    }
                )
                .filter(
                    function (id) {

                        return id !== "";

                    }
                );


        /* --------------------------------------
           REMOVE DUPLICATES
        -------------------------------------- */

        const uniqueIds =
            [
                ...new Set(ids)
            ];


        if (
            uniqueIds.length === 0
        ) {

            return failed(
                "Tidak ada Result ID yang dipilih."
            );

        }


        /* --------------------------------------
           GET SHEET
        -------------------------------------- */

        const sh =
            sheet(
                RESULT_SHEET
            );


        if (!sh) {

            return failed(
                "Sheet Result tidak ditemukan."
            );

        }


        /* --------------------------------------
           READ DATA
        -------------------------------------- */

        const rows =
            sh
                .getDataRange()
                .getValues();


        if (
            !rows ||
            rows.length <= 1
        ) {

            return success({

                deleted:
                    0,

                requested:
                    uniqueIds.length,

                message:
                    "Tidak ada result untuk dihapus."

            });

        }


        /* --------------------------------------
           CREATE ID LOOKUP
        -------------------------------------- */

        const idSet =
            new Set(
                uniqueIds
            );


        const rowsToDelete =
            [];


        /* --------------------------------------
           FIND MATCHING ROWS
        -------------------------------------- */

        for (
            let i = 1;
            i < rows.length;
            i++
        ) {

            const rowId =
                String(
                    rows[i][0] === null ||
                    typeof rows[i][0] === "undefined"
                        ? ""
                        : rows[i][0]
                ).trim();


            if (
                rowId &&
                idSet.has(rowId)
            ) {

                rowsToDelete.push(
                    i + 1
                );

            }

        }


        /* --------------------------------------
           NOTHING FOUND
        -------------------------------------- */

        if (
            rowsToDelete.length === 0
        ) {

            return failed(
                "Result yang dipilih tidak ditemukan."
            );

        }


        /* --------------------------------------
           DELETE FROM BOTTOM TO TOP
        -------------------------------------- */

        rowsToDelete
            .sort(
                function (a, b) {

                    return b - a;

                }
            )
            .forEach(
                function (rowNumber) {

                    sh.deleteRow(
                        rowNumber
                    );

                }
            );


        /* --------------------------------------
           SUCCESS
        -------------------------------------- */

        return success({

            deleted:
                rowsToDelete.length,

            requested:
                uniqueIds.length,

            message:
                rowsToDelete.length +
                " result(s) deleted."

        });

    }

    catch (err) {

        Logger.log(
            "deleteResults ERROR: " +
            err.toString()
        );


        return failed(
            err.toString()
        );

    }

}


/* ==========================================
END OF FILE
========================================== */