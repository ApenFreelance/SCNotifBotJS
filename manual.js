const { default: axios } = require("axios")
require("dotenv").config();
async function verifyEmailExists() {
    console.log("Verifying Email")
    const response = await axios.post('https://www.skill-capped.com/lol/api/new/loginv2', { email:process.env.mail, password:process.env.pass})
    console.log(response.data)
    if (response.success == false) { 
      return(false, "Wrong email or password")
    }

    
    if(response.data.data.fsData.user.role == "SC_ROLE_PAID_USER") {
      return(true, "User has active account")
    }
    if(response.data.data.fsData.user.role == "SC_ROLE_FREE_USER") {
      return(false, "User has free account")
    }
    else {
      console.log(response.data.data.fsData.user.role)
    }
    return response.data.available
  }

verifyEmailExists()
