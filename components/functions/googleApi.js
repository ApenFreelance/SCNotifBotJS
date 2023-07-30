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

function createSheetBody(submissionPos, {status=null, createdAt=null, id=null, userID=null, userName=null, userEmail=null, clipLink=null, armoryLink=null,charClass=null, twovtwo=null, threevthree=null, solo1=null, solo2=null, solo3=null, solo4=null, claimedDate=null, claimedByID=null, claimedByUsername=null, completedAt=null, reviewLink=null, reviewRating=null, reviewComment=null}) {
  const properties = [
    {range: `A${submissionPos}`, value: createdAt},
    {range: `B${submissionPos}`, value: id},
    {range: `C${submissionPos}`, value: userID},
    {range: `D${submissionPos}`, value: userName},
    {range: `E${submissionPos}`, value: userEmail},
    {range: `F${submissionPos}`, value: clipLink},
    {range: `G${submissionPos}`, value: armoryLink},
    {range: `H${submissionPos}`, value: charClass},
    {range: `I${submissionPos}`, value: twovtwo},
    {range: `J${submissionPos}`, value: threevthree},
    {range: `K${submissionPos}`, value: solo1},
    {range: `L${submissionPos}`, value: solo2},
    {range: `M${submissionPos}`, value: solo3},
    {range: `N${submissionPos}`, value: solo4},
    {range: `O${submissionPos}`, value: status},
    {range: `P${submissionPos}`, value: claimedDate},
    {range: `Q${submissionPos}`, value: claimedByID},
    {range: `R${submissionPos}`, value: claimedByUsername},
    {range: `S${submissionPos}`, value: completedAt},
    {range: `T${submissionPos}`, value: reviewLink},
    {range: `U${submissionPos}`, value: reviewRating},
    {range: `V${submissionPos}`, value: reviewComment},

  ];

  const sheetBody = properties
    .filter(({value}) => value !== null)
    .map(({range, value}) => ({range, values: [[value]]}));

  return sheetBody;
}
module.exports = { updateGoogleSheet, authorize, createSheetBody };
