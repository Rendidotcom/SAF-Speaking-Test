/**
 * ==========================================
 * Spreadsheet Service
 * SAF Speaking Online Test
 * ==========================================
 */

function db() {

  return SpreadsheetApp.openById(
    CONFIG.SPREADSHEET_ID
  );

}

function sheet(name) {

  return db().getSheetByName(name);

}

function getRows(sheetName) {

  const sh = sheet(sheetName);

  return sh.getDataRange().getValues();

}

function append(sheetName, row) {

  sheet(sheetName).appendRow(row);

}

function lastRow(sheetName) {

  return sheet(sheetName).getLastRow();

}

function clearSheet(sheetName){

  sheet(sheetName).clearContents();

}