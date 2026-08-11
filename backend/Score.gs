/**
 * ============================================================
 * SAF SPEAKING ONLINE TEST
 * SCORE MODULE
 *
 * Stable Foundation v4.0
 * CLEAN FINAL
 *
 * RESPONSIBILITY:
 * ------------------------------------------------------------
 * - Receive speaking score request
 * - Get answer key from Questions Sheet
 * - Normalize answer key and transcript
 * - Align spoken transcript with answer key
 * - Detect matches
 * - Detect substitutions
 * - Detect deletions
 * - Detect insertions
 * - Detect repeated Speech Recognition tokens
 * - Calculate lexical accuracy
 * - Calculate sequence accuracy
 * - Calculate character similarity
 * - Calculate completeness
 * - Calculate order score
 * - Calculate pronunciation proxy
 * - Calculate fluency proxy
 * - Calculate final score
 * - Generate grade
 * - Generate evidence-based feedback
 * - Send final result to Result Module
 *
 * IMPORTANT:
 * ------------------------------------------------------------
 * Browser SpeechRecognition menghasilkan TRANSCRIPT.
 *
 * Transcript != acoustic pronunciation analysis.
 *
 * pronunciation = pronunciation/transcript proxy
 *
 * Bukan:
 * - phoneme-level acoustic pronunciation score
 * - true acoustic pronunciation assessment
 *
 * ============================================================
 */


/* ============================================================
   SAVE SCORE
============================================================ */

function saveScore(data) {

  try {

    /* --------------------------------------------------------
       VALIDATE INPUT
    -------------------------------------------------------- */

    if (!data) {
      return failed("Score data tidak ditemukan.");
    }

    if (!data.questionId) {
      return failed("Question ID wajib diisi.");
    }

    if (
      data.transcript === undefined ||
      data.transcript === null ||
      String(data.transcript).trim() === ""
    ) {
      return failed("Transcript kosong.");
    }


    /* --------------------------------------------------------
       GET QUESTION
    -------------------------------------------------------- */

    const questionResult = getQuestionById({
      id: data.questionId
    });

    if (
      !questionResult ||
      questionResult.success !== true
    ) {

      return failed(
        questionResult &&
        questionResult.message
          ? questionResult.message
          : "Question tidak ditemukan."
      );

    }


    const question = questionResult.data;


    if (!question) {
      return failed("Question data tidak ditemukan.");
    }


    /* --------------------------------------------------------
       GET ANSWER KEY
    -------------------------------------------------------- */

    const answer =
      String(question.answer || "").trim();


    if (!answer) {
      return failed(
        "Answer key untuk question ini kosong."
      );
    }


    /* --------------------------------------------------------
       CALCULATE SCORE
    -------------------------------------------------------- */

    const scoreResult = calculateScore({

      answer: answer,

      transcript:
        String(data.transcript || ""),

      confidence:
        data.confidence,

      duration:
        data.duration,

      speechDuration:
        data.speechDuration,

      pauseCount:
        data.pauseCount

    });


    if (
      !scoreResult ||
      scoreResult.success !== true
    ) {

      return failed(
        scoreResult &&
        scoreResult.message
          ? scoreResult.message
          : "Score calculation failed."
      );

    }


    /* --------------------------------------------------------
       PREPARE RESULT DATA
    -------------------------------------------------------- */

    const resultData = {

      nis:
        data.nis || "",

      nama:
        data.nama || "",

      kelas:
        data.kelas || "",

      questionId:
        data.questionId || "",

      question:
        data.question ||
        question.title ||
        "",

      transcript:
        data.transcript || "",

      score:
        scoreResult.score || 0,

      feedback:
        scoreResult.feedback || "",

      token:
        data.token || ""

    };


    /* --------------------------------------------------------
       SAVE RESULT
    -------------------------------------------------------- */

    const saved =
      saveResult(resultData);


    if (
      !saved ||
      saved.success !== true
    ) {

      return failed(
        saved &&
        saved.message
          ? saved.message
          : "Result could not be saved."
      );

    }


    /* --------------------------------------------------------
       RETURN FINAL RESULT
    -------------------------------------------------------- */

    return success({

      resultId:
        saved.id || "",

      score:
        scoreResult.score,

      grade:
        scoreResult.grade,

      accuracy:
        scoreResult.accuracy,

      pronunciation:
        scoreResult.pronunciation,

      fluency:
        scoreResult.fluency,

      feedback:
        scoreResult.feedback,

      metrics:
        scoreResult.metrics,

      message:
        "Speaking answer submitted successfully."

    });

  }

  catch (err) {

    Logger.log(
      "saveScore ERROR: " +
      err.toString()
    );

    return failed(
      err.toString()
    );

  }

}


/* ============================================================
   CALCULATE SCORE
============================================================ */

function calculateScore(data) {

  try {

    /* --------------------------------------------------------
       VALIDATE
    -------------------------------------------------------- */

    if (!data) {
      return failed(
        "Data score tidak ditemukan."
      );
    }


    const rawAnswer =
      String(data.answer || "").trim();


    const rawTranscript =
      String(data.transcript || "").trim();


    if (!rawAnswer) {
      return failed(
        "Answer key kosong."
      );
    }


    if (!rawTranscript) {
      return failed(
        "Transcript kosong."
      );
    }


    /* --------------------------------------------------------
       NORMALIZE
    -------------------------------------------------------- */

    const answer =
      normalizeSpeakingText(rawAnswer);


    const transcript =
      normalizeSpeakingText(rawTranscript);


    if (!answer.tokens.length) {
      return failed(
        "Answer key tidak memiliki kata yang dapat dinilai."
      );
    }


    if (!transcript.tokens.length) {
      return failed(
        "Transcript tidak memiliki kata yang dapat dinilai."
      );
    }


    /* --------------------------------------------------------
       EXACT MATCH
    -------------------------------------------------------- */

    const exactNormalizedMatch =
      answer.normalized ===
      transcript.normalized;


    /* --------------------------------------------------------
       WORD ALIGNMENT
    -------------------------------------------------------- */

    const alignment =
      alignWordSequences(
        answer.tokens,
        transcript.tokens
      );


    /* --------------------------------------------------------
       INSERTION / REPETITION ANALYSIS
    -------------------------------------------------------- */

    const repetitionAnalysis =
      analyzeInsertions(
        alignment.operations
      );


    /* --------------------------------------------------------
       ACCURACY
    -------------------------------------------------------- */

    const lexicalAccuracy =
      calculateLexicalAccuracy(
        alignment,
        answer.tokens.length,
        repetitionAnalysis
      );


    /* --------------------------------------------------------
       SEQUENCE
    -------------------------------------------------------- */

    const sequenceAccuracy =
      calculateSequenceAccuracy(
        alignment,
        answer.tokens.length
      );


    /* --------------------------------------------------------
       CHARACTER SIMILARITY
    -------------------------------------------------------- */

    const characterSimilarity =
      calculateCharacterSimilarity(
        answer.normalized,
        transcript.normalized
      );


    /* --------------------------------------------------------
       COMPLETENESS
    -------------------------------------------------------- */

    const completeness =
      calculateCompleteness(
        alignment,
        answer.tokens.length
      );


    /* --------------------------------------------------------
       ORDER
    -------------------------------------------------------- */

    const orderScore =
      calculateOrderScore(
        alignment,
        answer.tokens.length
      );


    /* --------------------------------------------------------
       SPEECH RECOGNITION CONFIDENCE
    -------------------------------------------------------- */

    const confidenceScore =
      normalizeConfidence(
        data.confidence
      );


    /* ========================================================
       PRONUNCIATION PROXY
    ======================================================== */

    let pronunciation;


    if (confidenceScore !== null) {

      pronunciation =
        Math.round(

          (lexicalAccuracy * 0.55) +

          (characterSimilarity * 0.25) +

          (confidenceScore * 0.20)

        );

    }

    else {

      pronunciation =
        Math.round(

          (lexicalAccuracy * 0.65) +

          (characterSimilarity * 0.35)

        );

    }


    /* ========================================================
       FLUENCY PROXY
    ======================================================== */

    let fluency =
      Math.round(

        (sequenceAccuracy * 0.45) +

        (completeness * 0.30) +

        (orderScore * 0.25)

      );


    /* --------------------------------------------------------
       PAUSE ADJUSTMENT
    -------------------------------------------------------- */

    if (
      data.pauseCount !== undefined &&
      data.pauseCount !== null
    ) {

      const pauseScore =
        calculatePauseScore(
          data.pauseCount,
          answer.tokens.length
        );


      fluency =
        Math.round(

          (fluency * 0.80) +
          (pauseScore * 0.20)

        );

    }


    /* ========================================================
       FINAL SCORE
       
       Accuracy       = 50%
       Pronunciation  = 30%
       Fluency        = 20%
    ======================================================== */

    let score =
      Math.round(

        (lexicalAccuracy * 0.50) +

        (pronunciation * 0.30) +

        (fluency * 0.20)

      );


    /* --------------------------------------------------------
       INSERTION PENALTY
    -------------------------------------------------------- */

    const insertionPenalty =
      calculateInsertionPenalty(
        repetitionAnalysis,
        answer.tokens.length
      );


    score =
      Math.round(
        score - insertionPenalty
      );


    /* --------------------------------------------------------
       EXACT MATCH OVERRIDE
       
       Hanya transcript yang benar-benar identik
       setelah normalization boleh mendapatkan 100.
    -------------------------------------------------------- */

    if (exactNormalizedMatch) {

      score = 100;

    }

    else {

      if (score >= 100) {
        score = 99;
      }

    }


    /* --------------------------------------------------------
       SAFETY CLAMP
    -------------------------------------------------------- */

    score =
      clampScore(score);


    pronunciation =
      clampScore(pronunciation);


    fluency =
      clampScore(fluency);


    /* --------------------------------------------------------
       GRADE
    -------------------------------------------------------- */

    const grade =
      calculateGrade(score);


    /* --------------------------------------------------------
       FEEDBACK
    -------------------------------------------------------- */

    const feedback =
      generateFeedback({

        score:
          score,

        accuracy:
          lexicalAccuracy,

        pronunciation:
          pronunciation,

        fluency:
          fluency,

        completeness:
          completeness,

        order:
          orderScore,

        characterSimilarity:
          characterSimilarity,

        exactNormalizedMatch:
          exactNormalizedMatch,

        repetitionAnalysis:
          repetitionAnalysis

      });


    /* --------------------------------------------------------
       AUDIT METRICS
    -------------------------------------------------------- */

    const metrics = {

      answerWords:
        answer.tokens.length,

      transcriptWords:
        transcript.tokens.length,

      matchedWords:
        alignment.matched,

      substitutions:
        alignment.substitutions,

      insertions:
        alignment.insertions,

      deletions:
        alignment.deletions,

      artifactInsertions:
        repetitionAnalysis.artifactInsertions,

      meaningfulInsertions:
        repetitionAnalysis.meaningfulInsertions,

      repeatedTokens:
        repetitionAnalysis.repeatedTokens,

      insertionPenalty:
        insertionPenalty,

      lexicalAccuracy:
        lexicalAccuracy,

      sequenceAccuracy:
        sequenceAccuracy,

      characterSimilarity:
        characterSimilarity,

      completeness:
        completeness,

      orderScore:
        orderScore,

      pronunciationProxy:
        pronunciation,

      fluencyProxy:
        fluency,

      speechRecognitionConfidence:
        confidenceScore,

      exactNormalizedMatch:
        exactNormalizedMatch,

      finalScore:
        score

    };


    /* --------------------------------------------------------
       RETURN
    -------------------------------------------------------- */

    return success({

      score:
        score,

      grade:
        grade,

      accuracy:
        lexicalAccuracy,

      pronunciation:
        pronunciation,

      fluency:
        fluency,

      feedback:
        feedback,

      metrics:
        metrics

    });

  }

  catch (err) {

    Logger.log(
      "calculateScore ERROR: " +
      err.toString()
    );

    return failed(
      err.toString()
    );

  }

}


/* ============================================================
   NORMALIZE SPEAKING TEXT
============================================================ */

function normalizeSpeakingText(text) {

  let value =
    String(text || "")
      .toLowerCase()
      .trim();


  /* --------------------------------------------------------
     SMART APOSTROPHE
  -------------------------------------------------------- */

  value =
    value.replace(
      /[’‘]/g,
      "'"
    );


  /* --------------------------------------------------------
     CONTRACTIONS
  -------------------------------------------------------- */

  const contractions = {

    "i'm": "i am",
    "you're": "you are",
    "he's": "he is",
    "she's": "she is",
    "it's": "it is",
    "we're": "we are",
    "they're": "they are",

    "i've": "i have",
    "you've": "you have",
    "we've": "we have",
    "they've": "they have",

    "i'll": "i will",
    "you'll": "you will",
    "he'll": "he will",
    "she'll": "she will",
    "we'll": "we will",
    "they'll": "they will",

    "can't": "cannot",
    "won't": "will not",

    "don't": "do not",
    "doesn't": "does not",
    "didn't": "did not",

    "isn't": "is not",
    "aren't": "are not",

    "wasn't": "was not",
    "weren't": "were not",

    "haven't": "have not",
    "hasn't": "has not",
    "hadn't": "had not",

    "wouldn't": "would not",
    "couldn't": "could not",
    "shouldn't": "should not",
    "mustn't": "must not",

    "what's": "what is",
    "that's": "that is",
    "there's": "there is",
    "who's": "who is"

  };


  Object.keys(contractions)
    .forEach(function(key) {

      const replacement =
        contractions[key];

      const regex =
        new RegExp(
          "\\b" +
          escapeRegExp(key) +
          "\\b",
          "g"
        );

      value =
        value.replace(
          regex,
          replacement
        );

    });


  /* --------------------------------------------------------
     REMOVE PUNCTUATION
  -------------------------------------------------------- */

  value =
    value.replace(
      /[.,!?;:()[\]{}"“”‘’]/g,
      " "
    );


  /* --------------------------------------------------------
     DASHES
  -------------------------------------------------------- */

  value =
    value.replace(
      /[-–—]/g,
      " "
    );


  /* --------------------------------------------------------
     COLLAPSE WHITESPACE
  -------------------------------------------------------- */

  value =
    value
      .replace(
        /\s+/g,
        " "
      )
      .trim();


  const tokens =
    value
      ? value.split(/\s+/)
      : [];


  return {

    normalized:
      value,

    tokens:
      tokens

  };

}


/* ============================================================
   WORD SEQUENCE ALIGNMENT
============================================================ */

function alignWordSequences(
  answerTokens,
  transcriptTokens
) {

  const n =
    answerTokens.length;

  const m =
    transcriptTokens.length;


  const dp = [];


  /* --------------------------------------------------------
     CREATE MATRIX
  -------------------------------------------------------- */

  for (
    let i = 0;
    i <= n;
    i++
  ) {

    dp[i] = [];

    for (
      let j = 0;
      j <= m;
      j++
    ) {

      dp[i][j] = 0;

    }

  }


  /* --------------------------------------------------------
     INITIALIZATION
  -------------------------------------------------------- */

  for (
    let i = 0;
    i <= n;
    i++
  ) {

    dp[i][0] = i;

  }


  for (
    let j = 0;
    j <= m;
    j++
  ) {

    dp[0][j] = j;

  }


  /* --------------------------------------------------------
     LEVENSHTEIN WORD ALIGNMENT
  -------------------------------------------------------- */

  for (
    let i = 1;
    i <= n;
    i++
  ) {

    for (
      let j = 1;
      j <= m;
      j++
    ) {

      const answerWord =
        answerTokens[i - 1];


      const transcriptWord =
        transcriptTokens[j - 1];


      const cost =
        answerWord === transcriptWord
          ? 0
          : wordSubstitutionCost(
              answerWord,
              transcriptWord
            );


      const deletion =
        dp[i - 1][j] + 1;


      const insertion =
        dp[i][j - 1] + 1;


      const substitution =
        dp[i - 1][j - 1] + cost;


      dp[i][j] =
        Math.min(
          deletion,
          insertion,
          substitution
        );

    }

  }


  /* --------------------------------------------------------
     BACKTRACE
  -------------------------------------------------------- */

  let i = n;
  let j = m;


  const operations = [];


  let matched = 0;
  let substitutions = 0;
  let insertions = 0;
  let deletions = 0;


  while (
    i > 0 ||
    j > 0
  ) {

    /* ------------------------------------------------------
       MATCH / SUBSTITUTION
    ------------------------------------------------------ */

    if (
      i > 0 &&
      j > 0
    ) {

      const answerWord =
        answerTokens[i - 1];


      const transcriptWord =
        transcriptTokens[j - 1];


      const cost =
        answerWord === transcriptWord
          ? 0
          : wordSubstitutionCost(
              answerWord,
              transcriptWord
            );


      if (
        dp[i][j] ===
        dp[i - 1][j - 1] + cost
      ) {

        if (
          answerWord ===
          transcriptWord
        ) {

          matched++;

          operations.unshift({

            type:
              "match",

            answer:
              answerWord,

            transcript:
              transcriptWord

          });

        }

        else {

          substitutions++;

          operations.unshift({

            type:
              "substitution",

            answer:
              answerWord,

            transcript:
              transcriptWord

          });

        }


        i--;
        j--;

        continue;

      }

    }


    /* ------------------------------------------------------
       DELETION
    ------------------------------------------------------ */

    if (
      i > 0 &&
      dp[i][j] ===
      dp[i - 1][j] + 1
    ) {

      deletions++;


      operations.unshift({

        type:
          "deletion",

        answer:
          answerTokens[i - 1],

        transcript:
          ""

      });


      i--;

      continue;

    }


    /* ------------------------------------------------------
       INSERTION
    ------------------------------------------------------ */

    if (
      j > 0 &&
      dp[i][j] ===
      dp[i][j - 1] + 1
    ) {

      insertions++;


      operations.unshift({

        type:
          "insertion",

        answer:
          "",

        transcript:
          transcriptTokens[j - 1]

      });


      j--;

      continue;

    }


    break;

  }


  return {

    operations:
      operations,

    matched:
      matched,

    substitutions:
      substitutions,

    insertions:
      insertions,

    deletions:
      deletions,

    distance:
      dp[n][m]

  };

}


/* ============================================================
   ANALYZE INSERTIONS
============================================================ */

function analyzeInsertions(
  operations
) {

  const repeatedTokens = [];

  let artifactInsertions = 0;

  let meaningfulInsertions = 0;


  for (
    let i = 0;
    i < operations.length;
    i++
  ) {

    const operation =
      operations[i];


    if (
      operation.type !==
      "insertion"
    ) {

      continue;

    }


    const token =
      String(
        operation.transcript || ""
      )
        .toLowerCase()
        .trim();


    if (!token) {
      continue;
    }


    const previous =
      i > 0
        ? operations[i - 1]
        : null;


    const next =
      i + 1 < operations.length
        ? operations[i + 1]
        : null;


    /* ------------------------------------------------------
       PATTERN:
       insertion -> match same word
    ------------------------------------------------------ */

    const repeatedBeforeMatch =
      next &&
      next.type === "match" &&
      String(next.answer || "")
        .toLowerCase()
        .trim() === token;


    /* ------------------------------------------------------
       PATTERN:
       match -> insertion same word
    ------------------------------------------------------ */

    const repeatedAfterMatch =
      previous &&
      previous.type === "match" &&
      String(previous.answer || "")
        .toLowerCase()
        .trim() === token;


    if (
      repeatedBeforeMatch ||
      repeatedAfterMatch
    ) {

      artifactInsertions++;


      repeatedTokens.push(
        token
      );

    }

    else {

      meaningfulInsertions++;

    }

  }


  return {

    artifactInsertions:
      artifactInsertions,

    meaningfulInsertions:
      meaningfulInsertions,

    repeatedTokens:
      repeatedTokens

  };

}


/* ============================================================
   INSERTION PENALTY
============================================================ */

function calculateInsertionPenalty(
  repetitionAnalysis,
  answerLength
) {

  if (
    !repetitionAnalysis ||
    answerLength <= 0
  ) {

    return 0;

  }


  const artifactCount =
    Number(
      repetitionAnalysis.artifactInsertions || 0
    );


  const meaningfulCount =
    Number(
      repetitionAnalysis.meaningfulInsertions || 0
    );


  /* --------------------------------------------------------
     RECOGNITION ARTIFACT
     Light penalty.
  -------------------------------------------------------- */

  const artifactPenalty =
    artifactCount * 1;


  /* --------------------------------------------------------
     MEANINGFUL EXTRA WORD
     Stronger penalty.
  -------------------------------------------------------- */

  const meaningfulPenalty =
    meaningfulCount * 4;


  const total =
    artifactPenalty +
    meaningfulPenalty;


  const maximumPenalty =
    Math.max(
      1,
      Math.round(
        answerLength * 20
      )
    );


  return Math.min(
    total,
    maximumPenalty
  );

}


/* ============================================================
   WORD SUBSTITUTION COST
============================================================ */

function wordSubstitutionCost(
  answerWord,
  transcriptWord
) {

  if (
    answerWord ===
    transcriptWord
  ) {

    return 0;

  }


  const similarity =
    calculateCharacterSimilarity(
      answerWord,
      transcriptWord
    );


  if (similarity >= 90) {
    return 0.25;
  }


  if (similarity >= 75) {
    return 0.50;
  }


  if (similarity >= 60) {
    return 0.75;
  }


  return 1;

}


/* ============================================================
   LEXICAL ACCURACY
============================================================ */

function calculateLexicalAccuracy(
  alignment,
  answerLength,
  repetitionAnalysis
) {

  if (
    !answerLength
  ) {

    return 0;

  }


  const matched =
    Number(
      alignment.matched || 0
    );


  const substitutions =
    Number(
      alignment.substitutions || 0
    );


  const deletions =
    Number(
      alignment.deletions || 0
    );


  let insertionPenalty =
    0;


  if (
    repetitionAnalysis
  ) {

    insertionPenalty +=
      Number(
        repetitionAnalysis.artifactInsertions || 0
      ) * 0.25;


    insertionPenalty +=
      Number(
        repetitionAnalysis.meaningfulInsertions || 0
      );

  }


  const effectiveCorrect =
    Math.max(
      0,
      matched -
      insertionPenalty -
      substitutions -
      deletions
    );


  const score =
    (
      effectiveCorrect /
      answerLength
    ) * 100;


  return clampScore(
    Math.round(score)
  );

}


/* ============================================================
   SEQUENCE ACCURACY
============================================================ */

function calculateSequenceAccuracy(
  alignment,
  answerLength
) {

  if (
    !answerLength
  ) {

    return 0;

  }


  const errors =
    Number(
      alignment.substitutions || 0
    ) +
    Number(
      alignment.deletions || 0
    ) +
    Number(
      alignment.insertions || 0
    );


  const penalty =
    (
      errors /
      answerLength
    ) * 100;


  return clampScore(
    Math.round(
      100 - penalty
    )
  );

}


/* ============================================================
   CHARACTER SIMILARITY
============================================================ */

function calculateCharacterSimilarity(
  textA,
  textB
) {

  const a =
    String(textA || "")
      .trim();


  const b =
    String(textB || "")
      .trim();


  if (
    !a &&
    !b
  ) {

    return 100;

  }


  if (
    !a ||
    !b
  ) {

    return 0;

  }


  if (
    a === b
  ) {

    return 100;

  }


  const distance =
    levenshteinStringDistance(
      a,
      b
    );


  const maxLength =
    Math.max(
      a.length,
      b.length
    );


  if (
    !maxLength
  ) {

    return 100;

  }


  return clampScore(

    Math.round(

      (
        1 -
        (
          distance /
          maxLength
        )
      ) * 100

    )

  );

}


/* ============================================================
   STRING LEVENSHTEIN
============================================================ */

function levenshteinStringDistance(
  a,
  b
) {

  const n =
    a.length;

  const m =
    b.length;


  let previous = [];

  let current = [];


  for (
    let j = 0;
    j <= m;
    j++
  ) {

    previous[j] =
      j;

  }


  for (
    let i = 1;
    i <= n;
    i++
  ) {

    current = [];

    current[0] =
      i;


    for (
      let j = 1;
      j <= m;
      j++
    ) {

      const cost =
        a.charAt(i - 1) ===
        b.charAt(j - 1)
          ? 0
          : 1;


      current[j] =
        Math.min(

          current[j - 1] + 1,

          previous[j] + 1,

          previous[j - 1] + cost

        );

    }


    previous =
      current;

  }


  return previous[m];

}


/* ============================================================
   COMPLETENESS
============================================================ */

function calculateCompleteness(
  alignment,
  answerLength
) {

  if (
    !answerLength
  ) {

    return 0;

  }


  const coverage =
    (
      Number(
        alignment.matched || 0
      ) /
      answerLength
    ) * 100;


  return clampScore(
    Math.round(
      coverage
    )
  );

}


/* ============================================================
   ORDER SCORE
============================================================ */

function calculateOrderScore(
  alignment,
  answerLength
) {

  if (
    !answerLength
  ) {

    return 0;

  }


  let correctOrder =
    0;


  alignment.operations.forEach(
    function(operation) {

      if (
        operation.type ===
        "match"
      ) {

        correctOrder++;

      }

    }
  );


  const insertionCount =
    Number(
      alignment.insertions || 0
    );


  const substitutionCount =
    Number(
      alignment.substitutions || 0
    );


  const deletionCount =
    Number(
      alignment.deletions || 0
    );


  const orderErrors =
    insertionCount +
    substitutionCount +
    deletionCount;


  const rawScore =
    (
      correctOrder /
      answerLength
    ) * 100;


  const penalty =
    (
      orderErrors /
      answerLength
    ) * 25;


  return clampScore(
    Math.round(
      rawScore -
      penalty
    )
  );

}


/* ============================================================
   SPEECH RECOGNITION CONFIDENCE
============================================================ */

function normalizeConfidence(
  confidence
) {

  if (
    confidence === null ||
    confidence === undefined ||
    confidence === ""
  ) {

    return null;

  }


  let value =
    Number(confidence);


  if (
    Number.isNaN(value)
  ) {

    return null;

  }


  /* --------------------------------------------------------
     Browser SpeechRecognition:
     normally 0 - 1
  -------------------------------------------------------- */

  if (
    value >= 0 &&
    value <= 1
  ) {

    value =
      value * 100;

  }


  return clampScore(
    Math.round(value)
  );

}


/* ============================================================
   PAUSE SCORE
============================================================ */

function calculatePauseScore(
  pauseCount,
  answerWords
) {

  const pauses =
    Number(pauseCount);


  if (
    Number.isNaN(pauses) ||
    pauses < 0
  ) {

    return 100;

  }


  if (
    answerWords <= 1
  ) {

    return 100;

  }


  const expected =
    Math.max(
      1,
      Math.round(
        answerWords / 8
      )
    );


  if (
    pauses <= expected
  ) {

    return 100;

  }


  const excess =
    pauses -
    expected;


  const penalty =
    excess * 10;


  return clampScore(
    Math.round(
      100 -
      penalty
    )
  );

}


/* ============================================================
   GRADE
============================================================ */

function calculateGrade(
  score
) {

  if (
    score >= 90
  ) {

    return "A";

  }


  if (
    score >= 80
  ) {

    return "B";

  }


  if (
    score >= 70
  ) {

    return "C";

  }


  if (
    score >= 60
  ) {

    return "D";

  }


  return "E";

}


/* ============================================================
   FEEDBACK
============================================================ */

function generateFeedback(
  data
) {

  const score =
    Number(
      data.score || 0
    );


  const accuracy =
    Number(
      data.accuracy || 0
    );


  const pronunciation =
    Number(
      data.pronunciation || 0
    );


  const fluency =
    Number(
      data.fluency || 0
    );


  const completeness =
    Number(
      data.completeness || 0
    );


  const order =
    Number(
      data.order || 0
    );


  const exact =
    data.exactNormalizedMatch === true;


  const repetitionAnalysis =
    data.repetitionAnalysis || {};


  const artifactInsertions =
    Number(
      repetitionAnalysis.artifactInsertions || 0
    );


  const meaningfulInsertions =
    Number(
      repetitionAnalysis.meaningfulInsertions || 0
    );


  /* --------------------------------------------------------
     EXACT 100
  -------------------------------------------------------- */

  if (
    exact &&
    score === 100
  ) {

    return (
      "Excellent. The recognized response exactly matches " +
      "the expected answer after normalization. " +
      "Accuracy is 100%."
    );

  }


  /* --------------------------------------------------------
     90+
  -------------------------------------------------------- */

  if (
    score >= 90
  ) {

    if (
      artifactInsertions > 0 &&
      meaningfulInsertions === 0
    ) {

      return (
        "Excellent answer accuracy. The response closely " +
        "matches the expected answer, with minor possible " +
        "Speech Recognition repetition artifacts."
      );

    }


    return (
      "Excellent speaking performance. The recognized " +
      "response closely matches the expected answer."
    );

  }


  /* --------------------------------------------------------
     80+
  -------------------------------------------------------- */

  if (
    score >= 80
  ) {

    if (
      accuracy < 80
    ) {

      return (
        "Very good speaking performance, but some expected " +
        "words were not recognized exactly. Practice saying " +
        "the complete answer clearly."
      );

    }


    if (
      meaningfulInsertions > 0
    ) {

      return (
        "Very good answer accuracy. Some additional recognized " +
        "words reduced the final accuracy."
      );

    }


    return (
      "Very good speaking performance. The response closely " +
      "matches the expected answer with minor differences."
    );

  }


  /* --------------------------------------------------------
     70+
  -------------------------------------------------------- */

  if (
    score >= 70
  ) {

    if (
      completeness < 70
    ) {

      return (
        "Good effort, but the response is incomplete. " +
        "Try to say the full expected answer."
      );

    }


    if (
      meaningfulInsertions > 0
    ) {

      return (
        "Good speaking performance. Additional or repeated " +
        "words reduced the answer accuracy."
      );

    }


    if (
      order < 70
    ) {

      return (
        "Good speaking performance. Most expected words were " +
        "recognized, but the sequence differed from the answer."
      );

    }


    return (
      "Good speaking performance with some differences " +
      "in accuracy, sequence, or recognition."
    );

  }


  /* --------------------------------------------------------
     60+
  -------------------------------------------------------- */

  if (
    score >= 60
  ) {

    if (
      completeness < 60
    ) {

      return (
        "The response is incomplete. Try to say the full " +
        "expected answer clearly and completely."
      );

    }


    if (
      meaningfulInsertions > 0
    ) {

      return (
        "Fair speaking performance. Additional or repeated " +
        "words reduced the answer accuracy."
      );

    }


    return (
      "Fair speaking performance. Several expected words " +
      "or sequences differ from the expected answer."
    );

  }


  /* --------------------------------------------------------
     BELOW 60
  -------------------------------------------------------- */

  return (
    "Needs more practice. The recognized response differs " +
    "substantially from the expected answer. Focus on saying " +
    "the complete answer clearly and in the expected sequence."
  );

}


/* ============================================================
   SCORE CLAMP
============================================================ */

function clampScore(
  value
) {

  let score =
    Number(value);


  if (
    Number.isNaN(score)
  ) {

    score = 0;

  }


  if (
    score < 0
  ) {

    score = 0;

  }


  if (
    score > 100
  ) {

    score = 100;

  }


  return Math.round(score);

}


/* ============================================================
   ESCAPE REGEXP
============================================================ */

function escapeRegExp(
  value
) {

  return String(value)
    .replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

}


/* ============================================================
   END OF SCORE.GS
   SAF Speaking Online Test
   Stable Foundation v4.0
============================================================ */