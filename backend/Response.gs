/**
 * ==========================================
 * Response Helper
 * ==========================================
 */

function json(data) {

  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);

}

function success(data = {}) {

  return json({

    success: true,

    ...data

  });

}

function failed(message = "Unknown Error") {

  return json({

    success: false,

    message

  });

}