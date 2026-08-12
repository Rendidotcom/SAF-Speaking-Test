/**
 * ==========================================
 * Student.gs
 * SAF Speaking Online Test
 *
 * Stable Foundation v2.1
 *
 * MODULE:
 * - Insert Student
 * - Get Student
 * - Update Student
 * - Delete Student
 * - Import Students
 * ==========================================
 */


/* ==========================================
INSERT STUDENT
========================================== */

function insertStudent(data) {

    try {

        if (!data) {

            return failed(
                "Data student tidak ditemukan."
            );

        }


        const sh =
            sheet(
                CONFIG.SHEET.STUDENT
            );


        if (!sh) {

            return failed(
                "Sheet Student tidak ditemukan."
            );

        }


        const rows =
            getRows(
                CONFIG.SHEET.STUDENT
            );


        for (
            let i = 1;
            i < rows.length;
            i++
        ) {

            if (
                String(rows[i][0]) ===
                String(data.nis)
            ) {

                return failed(
                    "NIS sudah terdaftar."
                );

            }

        }


        append(
            CONFIG.SHEET.STUDENT,
            [

                data.nis || "",

                data.nama || "",

                data.kelas || "",

                data.username || "",

                data.password || "",

                data.status || "ACTIVE",

                timestamp(),

                timestamp()

            ]
        );


        return success({

            message:
                "Student berhasil ditambahkan."

        });

    }

    catch (err) {

        return failed(
            err.toString()
        );

    }

}


/* ==========================================
GET STUDENT
========================================== */

function getStudent() {

    try {

        const rows =
            getRows(
                CONFIG.SHEET.STUDENT
            );


        const result =
            [];


        for (
            let i = 1;
            i < rows.length;
            i++
        ) {

            if (
                !rows[i][0] &&
                !rows[i][1]
            ) {

                continue;

            }


            result.push({

                nis:
                    rows[i][0],

                nama:
                    rows[i][1],

                kelas:
                    rows[i][2],

                username:
                    rows[i][3],

                password:
                    rows[i][4],

                status:
                    rows[i][5],

                createdAt:
                    rows[i][6],

                updatedAt:
                    rows[i][7]

            });

        }


        return success({

            data:
                result

        });

    }

    catch (err) {

        return failed(
            err.toString()
        );

    }

}


/* ==========================================
UPDATE STUDENT
========================================== */

function updateStudent(data) {

    try {

        if (
            !data ||
            !data.nis
        ) {

            return failed(
                "NIS wajib diisi."
            );

        }


        const sh =
            sheet(
                CONFIG.SHEET.STUDENT
            );


        if (!sh) {

            return failed(
                "Sheet Student tidak ditemukan."
            );

        }


        const rows =
            sh
                .getDataRange()
                .getValues();


        for (
            let i = 1;
            i < rows.length;
            i++
        ) {

            if (
                String(rows[i][0]) ===
                String(data.nis)
            ) {

                sh
                    .getRange(
                        i + 1,
                        2
                    )
                    .setValue(
                        data.nama ||
                        rows[i][1]
                    );


                sh
                    .getRange(
                        i + 1,
                        3
                    )
                    .setValue(
                        data.kelas ||
                        rows[i][2]
                    );


                sh
                    .getRange(
                        i + 1,
                        4
                    )
                    .setValue(
                        data.username ||
                        rows[i][3]
                    );


                sh
                    .getRange(
                        i + 1,
                        5
                    )
                    .setValue(
                        data.password ||
                        rows[i][4]
                    );


                sh
                    .getRange(
                        i + 1,
                        6
                    )
                    .setValue(
                        data.status ||
                        rows[i][5]
                    );


                sh
                    .getRange(
                        i + 1,
                        8
                    )
                    .setValue(
                        timestamp()
                    );


                return success({

                    message:
                        "Student berhasil diupdate."

                });

            }

        }


        return failed(
            "Student tidak ditemukan."
        );

    }

    catch (err) {

        return failed(
            err.toString()
        );

    }

}


/* ==========================================
DELETE STUDENT
========================================== */

function deleteStudent(data) {

    try {

        if (
            !data ||
            !data.nis
        ) {

            return failed(
                "NIS wajib diisi."
            );

        }


        const sh =
            sheet(
                CONFIG.SHEET.STUDENT
            );


        if (!sh) {

            return failed(
                "Sheet Student tidak ditemukan."
            );

        }


        const rows =
            sh
                .getDataRange()
                .getValues();


        for (
            let i = 1;
            i < rows.length;
            i++
        ) {

            if (
                String(rows[i][0]) ===
                String(data.nis)
            ) {

                sh.deleteRow(
                    i + 1
                );


                return success({

                    message:
                        "Student berhasil dihapus."

                });

            }

        }


        return failed(
            "Student tidak ditemukan."
        );

    }

    catch (err) {

        return failed(
            err.toString()
        );

    }

}


/* ==========================================
IMPORT STUDENTS
==========================================

Expected:

{
    students: [
        {
            nis: "7001",
            nama: "Ahmad Fauzan",
            kelas: "7A",
            username: "ahmad",
            password: "123456"
        }
    ]
}

Behavior:

NIS belum ada -> INSERT

NIS sudah ada -> UPDATE

========================================== */

function importStudents(data) {

    try {

        if (
            !data ||
            !Array.isArray(data.students)
        ) {

            return failed(
                "Data students harus berupa array."
            );

        }


        const students =
            data.students;


        if (
            students.length === 0
        ) {

            return failed(
                "Tidak ada student untuk diimport."
            );

        }


        const sh =
            sheet(
                CONFIG.SHEET.STUDENT
            );


        if (!sh) {

            return failed(
                "Sheet Student tidak ditemukan."
            );

        }


        const rows =
            sh
                .getDataRange()
                .getValues();


        const existing =
            new Map();


        for (
            let i = 1;
            i < rows.length;
            i++
        ) {

            const nis =
                String(
                    rows[i][0] === null ||
                    typeof rows[i][0] ===
                        "undefined"
                        ? ""
                        : rows[i][0]
                ).trim();


            if (nis) {

                existing.set(
                    nis,
                    i + 1
                );

            }

        }


        let inserted =
            0;

        let updated =
            0;

        let failedCount =
            0;

        const errors =
            [];


        for (
            let i = 0;
            i < students.length;
            i++
        ) {

            const item =
                students[i];


            try {

                if (!item) {

                    throw new Error(
                        "Data kosong."
                    );

                }


                const nis =
                    String(
                        item.nis === null ||
                        typeof item.nis ===
                            "undefined"
                            ? ""
                            : item.nis
                    ).trim();


                const nama =
                    String(
                        item.nama === null ||
                        typeof item.nama ===
                            "undefined"
                            ? ""
                            : item.nama
                    ).trim();


                const kelas =
                    String(
                        item.kelas === null ||
                        typeof item.kelas ===
                            "undefined"
                            ? ""
                            : item.kelas
                    ).trim();


                const username =
                    String(
                        item.username === null ||
                        typeof item.username ===
                            "undefined"
                            ? ""
                            : item.username
                    ).trim();


                const password =
                    String(
                        item.password === null ||
                        typeof item.password ===
                            "undefined"
                            ? ""
                            : item.password
                    ).trim();


                if (!nis) {

                    throw new Error(
                        "NIS kosong."
                    );

                }


                if (!nama) {

                    throw new Error(
                        "Nama kosong."
                    );

                }


                if (
                    existing.has(nis)
                ) {

                    const rowNumber =
                        existing.get(
                            nis
                        );


                    const currentRow =
                        sh
                            .getRange(
                                rowNumber,
                                1,
                                1,
                                8
                            )
                            .getValues()[0];


                    sh
                        .getRange(
                            rowNumber,
                            2,
                            1,
                            5
                        )
                        .setValues([

                            [

                                nama,

                                kelas,

                                username,

                                password,

                                currentRow[5] ||
                                    "ACTIVE"

                            ]

                        ]);


                    sh
                        .getRange(
                            rowNumber,
                            8
                        )
                        .setValue(
                            timestamp()
                        );


                    updated++;

                }

                else {

                    const now =
                        timestamp();


                    sh.appendRow([

                        nis,

                        nama,

                        kelas,

                        username,

                        password,

                        "ACTIVE",

                        now,

                        now

                    ]);


                    existing.set(
                        nis,
                        sh.getLastRow()
                    );


                    inserted++;

                }

            }

            catch (err) {

                failedCount++;


                errors.push({

                    row:
                        i + 2,

                    nis:
                        item &&
                        item.nis
                            ? item.nis
                            : "",

                    message:
                        err.toString()

                });

            }

        }


        return success({

            message:
                "Import student selesai.",

            total:
                students.length,

            inserted:
                inserted,

            updated:
                updated,

            failed:
                failedCount,

            errors:
                errors

        });

    }

    catch (err) {

        return failed(
            err.toString()
        );

    }

}


/* ==========================================
END OF FILE
========================================== */