/**
 * =====================================
 * SAF Speaking Online Test
 * Global Configuration
 * Stable Foundation v3.0
 * Frontend : Vercel API Proxy
 * Backend  : Google Apps Script
 * =====================================
 */

const CONFIG = {

    APP_NAME: "SAF Speaking Online Test",

    VERSION: "1.0.0",

    SCHOOL: "SMP Salman Al Farisi Bandung",

    /*
      API Proxy Vercel

      Frontend tidak langsung memanggil Google Apps Script
      untuk menghindari masalah CORS.

      Request flow:

      Frontend
          ↓
      Vercel Serverless API
          ↓
      Google Apps Script
          ↓
      Google Spreadsheet
    */

    API_URL: "/api/login",

    DEBUG: true,

    SESSION_KEY: "SAF_SESSION",

    TOKEN_KEY: "SAF_TOKEN"

};