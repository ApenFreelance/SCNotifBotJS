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
  const config = {
    headers: { Authorization: `Bearer sl.BawZM3BCoYj32CYVWgeY0FBF9Kv0jyP8779vEPIc0-4_sJDa_Un8jCnvY2j6PAGgLpLwsL7vkIHWr3HLhVicjcid-AeXl764PPpRH1viUNYL0jVm7zBHK-UNdl7pvKbbfj82f4lt` }
};
async function getIt() {
  let a = 1
  let j = {}
  while (a < 14) {
  const response = await axios.get(`https://us.api.blizzard.com/data/wow/playable-class/${a}?namespace=static-us&locale=en_US&access_token=EUwfgdGdAxW8pafZFNEo5fAVOzulXryKTh`)
    f = []
    console.log(response.data)
    response.data.specializations.forEach(spec => {
      f.push(spec.name)
    })
    j[response.data.name] += f

    a+=1
  }
  console.log(j)
}

async function getFile() {
    const response = await axios.post(`https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings`, {
        "path": "/DT end_animation.mp4",
        "settings": {
            "access": "viewer",
            "allow_download": true,
            "audience": "public",
            "requested_visibility": "public"
        }
    },config
    )
    console.log(response.data)
}

getFile()