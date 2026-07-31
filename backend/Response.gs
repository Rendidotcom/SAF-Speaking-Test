/**
 * ==========================================
 * Response Helper
 * SAF Speaking Online Test
 * Stable Foundation v3.1
 * ==========================================
 */

/**
 * Mengubah Object menjadi JSON Response
 */
function json(data) {

  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);

}

/**
 * Response Success
 * Mengembalikan OBJECT
 * (bukan TextOutput)
 */
function success(data) {

  return Object.assign({

    success: true

  }, data || {});

}

/**
 * Response Failed
 * Mengembalikan OBJECT
 * (bukan TextOutput)
 */
function failed(message) {

  return {

    success: false,

    message: message || "Unknown Error"

  };

}