const { default: axios } = require("axios")
require("dotenv").config();
async function verifyEmailExists() {
    console.log("Verifying Email")
    const response = await axios.post('https://www.skill-capped.com/lol/api/new/loginv2', { email:process.env.mail, password:process.env.pass})
    if (response.success == false) { 
      return(false, "Wrong email or password")
    }

    
    if(response.data.data.fsData.user.role == "SC_ROLE_PAID_USER") {
      return(true, "user has active account")
    }
    else {
      console.log(response.data.data.fsData.user.role)
    }
    return response.data.available
  }

verifyEmailExists()

switch(verifyEmailExists) {
  case "Wrong email or password":
  case "user has active account":
  case ""
}