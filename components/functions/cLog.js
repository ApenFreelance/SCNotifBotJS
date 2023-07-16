const colors = require('colors');
const colorCodes = require("../../colorCodes.json")
function cLog(args=[], {guild= "System", oneLine= true, spacings=0, subProcess=null}={}){
    let game
    if(guild == "System") {
        game = colors.yellow("System")
        subProcess = colorSubProcess(subProcess, "yellow")
    }
    
    else if(guild.id== "855206452771684382"|| guild== "855206452771684382") { // Valorant
        game = colors.magenta("VALORANT")
        subProcess = colorSubProcess(subProcess, "magenta")
    }
    else if(guild.id== "294958471953252353" ||guild== "294958471953252353") { // WoW
        game = colors.blue("WoW")
        subProcess = colorSubProcess(subProcess, "blue")
    }
    else if(guild.id== "1024961321768329246"||guild== "1024961321768329246") { // Dev
        game = colors.yellow("Dev")
        subProcess = colorSubProcess(subProcess, "yellow")
    }
    else { // WHO DIS?!
        game = colors.red(guild.name)
        subProcess = colorSubProcess(subProcess, "red")
    }
    
    

    if(oneLine == true){
        console.log(`[ ${game} ]${subProcess} ${args.join(" ")} ${"\n".repeat(spacings)}`);
        return;
    } else {
        for(let i = 0; i < args.length; i++){
            console.log(`[ ${game} ]${subProcess} ${args[i]}${"\n".repeat(spacings)}`);
        }
    }
    
    
}

function colorSubProcess(subProcess, color){
    if(subProcess!= null){
        return subProcess = `=>[${subProcess[color]}]`
    }
    return ""

}

module.exports = { cLog }


