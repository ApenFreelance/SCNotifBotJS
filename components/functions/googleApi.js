const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");

const DEVspreadsheet = process.env.DEVsheet;
const prod = process.env.PRODsheet;

const spreadsheetId = DEVspreadsheet;

async function updateGoogleSheet(data) {
    const auth = new GoogleAuth({
        keyFile: "credentials.json", //the key file
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
    const service = google.sheets({ version: "v4", auth });

    const request = {
        spreadsheetId,
        resource: {
            valueInputOption: "USER_ENTERED",
            data: data,
        },
        auth: auth,
    };

    try {
        const response = (
            await service.spreadsheets.values.batchUpdate(request)
        ).data;
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

function createSheetBody(
    mode,
    submissionPos,
    {
        status = null,
        createdAt = null,
        id = null,
        userID = null,
        userName = null,
        userEmail = null,
        clipLink = null,
        armoryLink = null,
        charClass = null,
        twovtwo = null,
        threevthree = null,
        solo1 = null,
        solo2 = null,
        solo3 = null,
        solo4 = null,
        claimedDate = null,
        claimedByID = null,
        claimedByUsername = null,
        completedAt = null,
        reviewLink = null,
        reviewRating = null,
        reviewComment = null,
    }
) {
    let sheetName = null;
    if (mode == "wowpvp") {
        sheetName = "PVP";
    } else if (mode == "wowpve") {
        sheetName = "PVE";
    }
    const properties = [
        { range: `${sheetName}!A${submissionPos}`, value: createdAt },
        { range: `${sheetName}!B${submissionPos}`, value: id },
        { range: `${sheetName}!C${submissionPos}`, value: userID },
        { range: `${sheetName}!D${submissionPos}`, value: userName },
        { range: `${sheetName}!E${submissionPos}`, value: userEmail },
        { range: `${sheetName}!F${submissionPos}`, value: clipLink },
        { range: `${sheetName}!G${submissionPos}`, value: armoryLink },
        { range: `${sheetName}!H${submissionPos}`, value: charClass },
        { range: `${sheetName}!I${submissionPos}`, value: twovtwo },
        { range: `${sheetName}!J${submissionPos}`, value: threevthree },
        { range: `${sheetName}!K${submissionPos}`, value: solo1 },
        { range: `${sheetName}!L${submissionPos}`, value: solo2 },
        { range: `${sheetName}!M${submissionPos}`, value: solo3 },
        { range: `${sheetName}!N${submissionPos}`, value: solo4 },
        { range: `${sheetName}!O${submissionPos}`, value: status },
        { range: `${sheetName}!P${submissionPos}`, value: claimedDate },
        { range: `${sheetName}!Q${submissionPos}`, value: claimedByID },
        { range: `${sheetName}!R${submissionPos}`, value: claimedByUsername },
        { range: `${sheetName}!S${submissionPos}`, value: completedAt },
        { range: `${sheetName}!T${submissionPos}`, value: reviewLink },
        { range: `${sheetName}!U${submissionPos}`, value: reviewRating },
        { range: `${sheetName}!V${submissionPos}`, value: reviewComment },
    ];

    const sheetBody = properties
        .filter(({ value }) => value !== null)
        .map(({ range, value }) => ({ range, values: [[value]] }));

    return sheetBody;
}
module.exports = { updateGoogleSheet, authorize, createSheetBody };
