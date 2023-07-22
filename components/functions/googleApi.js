const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");
async function updateGoogleSheet(data) {
  const auth = new GoogleAuth({
    keyFile: "credentials.json", //the key file
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });
  const service = google.sheets({ version: "v4", auth });

  const request = {
    spreadsheetId: "10k1pqpUUShnibEsNaRE219ICdB-Aspb0JgIrkKuvJp8",
    resource: {
      valueInputOption: "USER_ENTERED",
      data: data,
    },
    auth: auth,
  };

  try {
    const response = (await service.spreadsheets.values.batchUpdate(request))
      .data;
  } catch (err) {
    console.error(err);
  }
}
async function authorize() {
  let authClient = new google.auth.GoogleAuth({
    keyFile: "credentials.json", //the key file
    //url to spreadsheets API
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });
  if (authClient == null) {
    throw Error("authentication failed");
  }
  return authClient;
}
module.exports = { updateGoogleSheet, authorize };
