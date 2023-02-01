from mainscript import scriptRunner


roleDict = {"Academy": {"id": 995049041429790730, "channelid": 1029817668083130459, "img": "", },
"General": {"id": 1042505315326898236, "channelid": 978414879604113458, "img": ""},
"DK": {"id": 545374754950086656, "channelid": 994063573242351696, "img": "https://media.discordapp.net/attachments/1024961321768329249/1037086131134668900/unknown.png"},
"Demon Hunter": {"id": 545374756816289794, "channelid": 994063638660907109, "img": "https://media.discordapp.net/attachments/1024961321768329249/1037086456537174046/unknown.png"}, 
"Druid": {"id": 545374771026853889, "channelid": 994063899617931335, "img": "https://media.discordapp.net/attachments/1024961321768329249/1037087043651649619/unknown.png"}, 
"Hunter": {"id": 545374762403233832, "channelid":994064056791072768, "img": "https://media.discordapp.net/attachments/1024961321768329249/1037087249097052180/unknown.png"}, 
"Mage": {"id": 545374758473302019, "channelid":994064534912380998, "img": "https://media.discordapp.net/attachments/1024961321768329249/1037087323407527996/unknown.png"}, 
"Monk": {"id": 545374785454997509,"channelid":994064678483402863, "img": "https://media.discordapp.net/attachments/1024961321768329249/1037087436632756345/unknown.png"}, 
"Paladin": {"id": 545374776781438986, "channelid": 994064784490238053, "img": "https://media.discordapp.net/attachments/1024961321768329249/1037087546867466270/unknown.png"}, 
"Priest": {"id": 545374779050295296, "channelid":994064892095119370, "img": "https://media.discordapp.net/attachments/1024961321768329249/1037087630334099506/unknown.png",}, 
"Rogue": {"id": 545374701544013826, "channelid":994065023762694166, "img": "https://media.discordapp.net/attachments/1024961321768329249/1037087715356844032/unknown.png"}, 
"Shaman": {"id": 545374752500482053, "channelid":  994065205573189662, "img": "https://media.discordapp.net/attachments/1024961321768329249/1037087788627132426/unknown.png"}, 
"Warlock": {"id": 545374760939421710, "channelid":994065301148799017, "img": "https://media.discordapp.net/attachments/1024961321768329249/1037087889999265862/unknown.png"}, 
"Warrior": {"id": 545374692903485440, "channelid":994065408338448414, "img": "https://media.discordapp.net/attachments/1024961321768329249/1037087977064648745/unknown.png"}}


originLink = "https://www.skill-capped.com/wrath/browse3/course/t1j8zhsx8c/tzvytv5bnj"

findLink = "https://lol-content-dumps.s3.amazonaws.com/courses_v2/wrath/course_dump_[0-9]+.json"

game = "wrath"

logChannelID = 1025384994077679616

scriptRunner(roleDict, originLink, findLink, game, logChannelID)
