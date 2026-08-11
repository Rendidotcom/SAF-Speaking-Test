/**
 * ==========================================
 * Question.gs
 * SAF Speaking Online Test
 * Stable Foundation v4.0
 * ------------------------------------------
 * CRUD Speaking Question
 * ------------------------------------------
 * Sheet :
 * Questions
 *
 * Header :
 * id
 * title
 * answer
 * difficulty
 * duration
 * status
 * createdBy
 * createdAt
 * updatedAt
 * ==========================================
 */


/* ==========================================
   INSERT QUESTION
========================================== */

function insertQuestion(data) {

  try {

    if (!data) {
      return failed("Question data tidak ditemukan.");
    }

    if (!data.title) {
      return failed("Title wajib diisi.");
    }

    if (!data.answer) {
      return failed("Answer wajib diisi.");
    }

    const id = uuid();

    append(CONFIG.SHEET.QUESTION, [

      id,
      data.title.trim(),
      data.answer.trim(),
      data.difficulty || "Easy",
      Number(data.duration || 60),
      data.status || "ACTIVE",
      data.createdBy || "Teacher",
      timestamp(),
      timestamp()

    ]);

    return success({

      id: id,

      message: "Question berhasil ditambahkan."

    });

  }

  catch(err){

    return failed(err.toString());

  }

}


/* ==========================================
   GET ALL QUESTION
========================================== */

function getQuestion() {

  try {

    const rows = getRows(CONFIG.SHEET.QUESTION);

    const result = [];

    for (let i = 1; i < rows.length; i++) {

      result.push({

        id: rows[i][0],

        title: rows[i][1],

        answer: rows[i][2],

        difficulty: rows[i][3],

        duration: Number(rows[i][4]),

        status: rows[i][5],

        createdBy: rows[i][6],

        createdAt: rows[i][7],

        updatedAt: rows[i][8]

      });

    }

    return success({

      data: result

    });

  }

  catch(err){

    return failed(err.toString());

  }

}


/* ==========================================
   GET QUESTION BY ID
========================================== */

function getQuestionById(data){

  try{

    if(!data || !data.id){

      return failed("Question ID tidak ditemukan.");

    }

    const rows = getRows(CONFIG.SHEET.QUESTION);

    for(let i=1;i<rows.length;i++){

      if(String(rows[i][0])===String(data.id)){

        return success({

          data:{

            id: rows[i][0],

            title: rows[i][1],

            answer: rows[i][2],

            difficulty: rows[i][3],

            duration: Number(rows[i][4]),

            status: rows[i][5],

            createdBy: rows[i][6],

            createdAt: rows[i][7],

            updatedAt: rows[i][8]

          }

        });

      }

    }

    return failed("Question tidak ditemukan.");

  }

  catch(err){

    return failed(err.toString());

  }

}


/* ==========================================
   UPDATE QUESTION
========================================== */

function updateQuestion(data){

  try{

    if(!data){

      return failed("Question data tidak ditemukan.");

    }

    if(!data.id){

      return failed("Question ID wajib diisi.");

    }

    const sh = sheet(CONFIG.SHEET.QUESTION);

    const rows = sh.getDataRange().getValues();

    for(let i=1;i<rows.length;i++){

      if(String(rows[i][0])===String(data.id)){

        sh.getRange(i+1,2).setValue(data.title);
        sh.getRange(i+1,3).setValue(data.answer);
        sh.getRange(i+1,4).setValue(data.difficulty);
        sh.getRange(i+1,5).setValue(Number(data.duration));
        sh.getRange(i+1,6).setValue(data.status || "ACTIVE");
        sh.getRange(i+1,7).setValue(data.createdBy || rows[i][6]);
        sh.getRange(i+1,9).setValue(timestamp());

        return success({

          message:"Question berhasil diperbarui."

        });

      }

    }

    return failed("Question tidak ditemukan.");

  }

  catch(err){

    return failed(err.toString());

  }

}


/* ==========================================
   DELETE QUESTION
========================================== */

function deleteQuestion(data){

  try{

    if(!data){

      return failed("Question data tidak ditemukan.");

    }

    if(!data.id){

      return failed("Question ID wajib diisi.");

    }

    const sh = sheet(CONFIG.SHEET.QUESTION);

    const rows = sh.getDataRange().getValues();

    for(let i=1;i<rows.length;i++){

      if(String(rows[i][0])===String(data.id)){

        sh.deleteRow(i+1);

        return success({

          message:"Question berhasil dihapus."

        });

      }

    }

    return failed("Question tidak ditemukan.");

  }

  catch(err){

    return failed(err.toString());

  }

}