/**
 * ==========================================
 * Teacher Module
 * ==========================================
 */

/**
 * Menambahkan soal speaking
 */
function insertQuestion(data){

  const id = uuid();

  append(CONFIG.SHEET.QUESTION, [

    id,

    data.title,

    data.answer,

    data.difficulty,

    data.duration,

    "Active",

    data.createdBy,

    timestamp()

  ]);

  // writeLog(
//   "QUESTION",
//   "Insert : " + data.title
// );

  return success({

    message: "Question berhasil ditambahkan.",

    id: id

  });

}

/**
 * Mengambil seluruh soal
 */
function getQuestion(){

  const rows = getRows(CONFIG.SHEET.QUESTION);

  const result = [];

  for(let i = 1; i < rows.length; i++){

    result.push({

      id: rows[i][0],

      title: rows[i][1],

      answer: rows[i][2],

      difficulty: rows[i][3],

      duration: rows[i][4],

      status: rows[i][5],

      createdBy: rows[i][6],

      createdAt: rows[i][7]

    });

  }

  return success({

    data: result

  });

}