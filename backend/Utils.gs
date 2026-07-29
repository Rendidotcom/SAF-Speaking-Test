/**
 * ==========================================
 * Utility Function
 * ==========================================
 */

function now(){

  return new Date();

}

function uuid(){

  return Utilities.getUuid();

}

function timestamp(){

  return Utilities.formatDate(

      new Date(),

      Session.getScriptTimeZone(),

      "yyyy-MM-dd HH:mm:ss"

  );

}

function randomToken(length=6){

  const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let token="";

  for(let i=0;i<length;i++){

      token+=chars.charAt(

          Math.floor(Math.random()*chars.length)

      );

  }

  return token;

}

function writeLog(module,message){

  append(

      CONFIG.SHEET.LOG,

      [

          timestamp(),

          module,

          message

      ]

  );

}