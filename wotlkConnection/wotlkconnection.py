import asyncio

import json
from multiprocessing.sharedctypes import Value

import requests
import discord
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import os
from selenium.webdriver.common.by import By

import re
from discord.embeds import Embed
from selenium.webdriver.support.ui import WebDriverWait

import time

WoWDC = "294958471953252353" #Wow server ID
DevDC = "1024961321768329246" #DEV SERVER ID
 # The oldest dump, will update itself
global WoWDump
WoWDump = ""
# instantiate a chrome options object so you can set the size and headless preference
chrome_options = Options()
chrome_options.add_argument("--headless") 
chrome_options.add_argument("--window-size=1920x1080")


# Finds driver in current directory
chrome_driver = os.getcwd() +"\\chromedriver.exe"

roleDict = {"Academy": {"id": 1042505315326898236, "channelid": 1029817668083130459, "img": "", },
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

# Creates driver to go to correct site
driver = webdriver.Chrome(chrome_options=chrome_options, executable_path=chrome_driver)
 

class MyClient(discord.Client):
    async def on_ready(self): # Starts code when bot is started
        print(f'Logged on as {self.user}!')
        channel2 = client.get_channel(1025384994077679616) # Fetch specific channel depending on roleDict
        await channel2.send("Bot started!")
        driver.get("https://www.skill-capped.com/wrath/browse3/course/t1j8zhsx8c/tzvytv5bnj") # Grab site with headless browser
        
        info = driver.find_element(By.XPATH, "/html/body/script[2]") # Find the dump's script
        link = re.findall("https://lol-content-dumps.s3.amazonaws.com/courses_v2/wrath/course_dump_[0-9]+.json", info.get_attribute('innerHTML')) # Grab whatever link that matches anything except unix numbers
        global WoWDump
        WoWDump = link[0]
        await channel2.send(WoWDump)
        while True:
            try:
                await siteCheck(WoWDump, "", WoWDC, "wow") # Start initial function:
            except Exception as e:
                await channel2.send(f"failed site check: {e}")
                print("Failed to perform siteCheck initial function ", e) # Start initial function:

            finally:
                for i in range(40):
                    print("heartbeat\n\n")
                    await asyncio.sleep(5)
      



intents = discord.Intents.default()
intents.message_content = True

client = MyClient(intents=intents)




async def messageOnNewContent(newContent): # The embed sending
    channel2 = client.get_channel(1025384994077679616) 
    await channel2.send(f"MessageOnNewContent initiated")
    await channel2.send(newContent.keys())
    for key, vids in newContent.items():
        role = roleDict[key]
        await channel2.send(f"-------------------------------------------------------------------------------")
        print(f"Working on {newContent}")
        await channel2.send(f"Working on {vids[0]['vTitle']}")
        while True:
                driver.get(vids[0]["link"])
                info = driver.find_element(By.XPATH, "/html/body/script[2]") # Find the dump's script
                link = re.findall("https://lol-content-dumps.s3.amazonaws.com/courses_v2/wrath/course_dump_[0-9]+.json", info.get_attribute('innerHTML')) # Grab whatever link that matches anything except unix numbers
                link = link[0]
                await channel2.send(f"Checking link")
                if link == WoWDump:
                    await channel2.send(f"Link works!")
                    print("mBroke out")
                    await asyncio.sleep(30)
                    break
                else:
                    await channel2.send(f"Link not working, checking again after waiting")
                    print("not ready yet")
                    for i in range(20):
                        print("heartbeat\n\n")
                        await asyncio.sleep(5)
                    

        channel = client.get_channel(role["channelid"]) # Fetch specific channel depending on roleDict
        await channel.send(content=f"<@&{role['id']}>")
        for value in vids:

            if role == "":
                print("Role not in dict")
                channel = 0
            notifEmbed = discord.Embed(title=value["cTitle"]) # Set to course title
            notifEmbed.description = f"{value['vTitle']}\n[Click here to watch!]({value['link']})" #give description a link
            notifEmbed.set_image(url=f"https://skillcappedzencoder.s3.amazonaws.com/{value['vuuid']}/thumbnails/thumbnail_medium_{value['tId']}.jpg") # Image to the saved course image
            
            notifEmbed.set_author(name="A new Skill-Capped video has been released!", icon_url="https://media.discordapp.net/attachments/991013102688555069/994302850580631622/unknown.png") # first read message + picture of game
            if role["img"] == "":
                notifEmbed.set_thumbnail(url=f"https://media.discordapp.net/attachments/991013102688555069/994302850580631622/unknown.png") # same as above
            else:
                notifEmbed.set_thumbnail(url=role["img"])
            
            
            await channel.send(embed=notifEmbed) # Send embed to specified channel 
            await channel2.send(f"Completed {value}")
            print("Sent new video to channel")

    await channel2.send("Done")


async def checkIfContainsAsync(newLink, oldLink, server, game, channel2):
    dict1 = dict()
    channel2 = await client.get_channel(1025384994077679616) # Fetch specific channel depending on roleDict
    oldResponse = requests.get(oldLink) # Grab the old links json data
    oldJSON = json.loads(oldResponse.text) # Make the old JSON readable 
    
    
    newResponse = requests.get(newLink) # Grab the new links json data
    newJSON = json.loads(newResponse.text) # Make the new JSON readable 

    for video in newJSON["videos"]: # Grab only "Videos"

        if video not in oldJSON["videos"]: # Check if the videos match between old and new. Same key level as "videosToCourses" and "courses"
            print("\n\nNew video detected")
            tId = video["tId"]
            videoTitle = video["title"] # Saves title and UUID if it does not match
            videoUUID = video["uuid"]
            await channel2.send(f"-------------------------------------------------------------------------------")
            await channel2.send(f"Found {videoTitle}")
            print(videoTitle, videoUUID, "*new data*") 

            try:
                
                for key, course in newJSON["videosToCourses"].items(): # Grab the title of course and videos within the courses. Same key level as "videos" and "courses"
                    
                    for cpter,  vids in course.items(): # go within chapters and prepare to grab video UUID
                        for subchapter in vids:
                            for vid in subchapter["vids"]: # Step inside vids list and go through
                                if vid["uuid"] == videoUUID: # If UUID from videos list matches the one within videosToCourses you found the right spot
                                    for courses in newJSON["courses"]: # Grabs the courses. Same key level as "videos" and "videosToCourses"
                                        if courses["title"] == key: # course title matches key for videosToCourses
                                            tag = courses["tags"]
                                            
                                            for tags, value in roleDict.items():
                                                if tags in tag[0]:
                                                    role = tags
                                                    await channel2.send(role)
                                                    break
                                            if role == "":
                                                break
                                                
                                            

                                            link = (f"https://www.skill-capped.com/wrath/browse3/course/{videoUUID}/{courses['uuid']}".lower().replace("|", "").replace("'","").replace(" ", "-").replace("--", "-"))
                                            # ^ saves link then reshapes into a matching format that SC uses
                                            print(link, "\n\n")
                                            
                                            
                                            # ^ starts function to send message to specified channel
                                            if role in ["General", "Academy"]:
                                                role = "General"

                                            if [{"cTitle": courses["title"],"vTitle": videoTitle,"vuuid": videoUUID,"link":link,"tag": tag,"tId": tId}] in dict1[role]:
                                                await channel2.send(f"---------\nPOSSIBLE DOUBLEUP ON {videoTitle}\n---------")
                                                break

                                            try: 
                                                dict1[role] +=  [{"cTitle": courses["title"],"vTitle": videoTitle,"vuuid": videoUUID,"link":link,"tag": tag,"tId": tId}]
                                            except:
                                                dict1[role] =  [{"cTitle": courses["title"],"vTitle": videoTitle,"vuuid": videoUUID,"link":link,"tag": tag,"tId": tId}]

                                            finally:
                                                await channel2.send(f"Added to dict {videoTitle}")


                                    
                                  
            except Exception as e:
                print("Failure", e)  # Any error within this function will return here 
                await channel2.send(e)

    try:
        await channel2.send(f"MessageOnNewContent initiating")
        await messageOnNewContent(dict1)
        
    except Exception as e:
        print(e)
        await channel2.send(f"Failed during checkIfContains: {e}")




            
async def siteCheck(url, file, server, game):

    global WoWDump
    channel2 = client.get_channel(1025384994077679616) # Fetch specific channel depending on roleDict

    try:
        driver.get("https://www.skill-capped.com/wrath/browse3/course/t1j8zhsx8c/tzvytv5bnj") # Grab site with headless browser



        info = driver.find_element(By.XPATH, "/html/body/script[2]") # Find the dump's script
        link = re.findall("https://lol-content-dumps.s3.amazonaws.com/courses_v2/wrath/course_dump_[0-9]+.json", info.get_attribute('innerHTML')) # Grab whatever link that matches anything except unix numbers
        link = link[0]
        print(link, "              new link\n", url, "              old link")
        if link != url: # If link is not the same as the url saved
            await channel2.send(f"Found new link {link}")
            await channel2.send(f"Old link is {WoWDump}")
            print("Found new link")
            WoWDump = link
            await channel2.send(f"Set WoW dump to {WoWDump}")
            await checkIfContainsAsync(link, url, server, game, channel2) # allow it to start checkng for videos
            
            
            
            

        else:
            
            print("no update") 
            
        
        
    except Exception as e:
        print(e) #Any errors get posted by this
        await channel2.send(f"Failed during siteCheck: {e}")
        
        
        
        
                    

def main():
    client.run('MTAyMDQwNDUwNDQzMDEzMzI2OQ.Go4dhZ.1oY_BfVSEJDm2pIGsIbvv0NybjtUEsubz8lpbY') # Bot token

if __name__ == '__main__':
    main()