const { default: axios } = require("axios")

async function verifyEmailExists() {
    console.log("Verifying Email")
    const response = await axios.post('https://www.skill-capped.com/lol/admin/users', { email:"julian.sjonfjell@gmail.com"})
   console.log(response)
    console.log("Result: ", response.data.available)
    return response.data.available
  }

verifyEmailExists()