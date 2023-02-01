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
chrome_options = webdriver.ChromeOptions()
chrome_options.add_argument("--headless") 
chrome_options.add_argument("--window-size=1920x1080")
chrome_options.add_experimental_option("excludeSwitches", ["enable-logging"])
currentVersionDump = "C:\\Users\julia\\Desktop\\wotlkConnection\\dumps.json"
# Finds driver in current directory
chrome_driver = "C:\\Users\\julia\\Desktop\\wotlkConnection\\chromedriver.exe"


# Creates driver to go to correct site
driver = webdriver.Chrome(executable_path=chrome_driver, options=chrome_options)

def scriptRunner(roleDict, originLink, findLink, game, logChannelID):

    class MyClient(discord.Client):
        async def on_ready(self): # Starts code when bot is started
            channel2 = client.get_channel(logChannelID) # Fetch specific channel depending on roleDict
            await channel2.send("Bot started!")
            driver.get(originLink) # Grab site with headless browser
            with open(currentVersionDump, "r") as jsonFile:
                data = json.load(jsonFile) # Grab data
            print(data)
            
            global WoWDump
            WoWDump = data[game]
            
            await channel2.send(WoWDump)
            while True:
                try:
                    await siteCheck(WoWDump, WoWDC) # Start initial function:
                except Exception as e:
                    await channel2.send(f"failed site check: {e}")
                    # Start initial function:

                finally:
                    for i in range(40):
                        print(f"heartbeat {game}\n\n")
                        await asyncio.sleep(5)
        



    intents = discord.Intents.default()
    intents.message_content = True

    client = MyClient(intents=intents)




    async def messageOnNewContent(newContent): # The embed sending
        channel2 = client.get_channel(logChannelID) 
        await channel2.send(f"MessageOnNewContent initiated")
        await channel2.send(newContent.keys())
        maxFullContentRepetitions = 0 # start value of counter
        for key, vids in newContent.items():
            role = roleDict[key]
            await channel2.send(f"-------------------------------------------------------------------------------")
            
            await channel2.send(f"Working on {vids[0]['vTitle']}\n{vids[0]['link']}")
            c = 0
            while True:

                driver.get(vids[0]["link"])
                info = driver.find_element(By.XPATH, "/html/body/script[2]") # Find the dump's script
                link = re.findall(findLink, info.get_attribute('innerHTML')) # Grab whatever link that matches anything except unix numbers
                link = link[0]
                await channel2.send(f"Checking link")
                if link == WoWDump or c >= 36 or maxFullContentRepetitions >= 180: # max 1 hour per category, after 5 hours all videos are posted. This is to avoid it getting stuck due to multiple dumps
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
                    c+=1
                        

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
        await channel2.send("All Videos Posted")


    async def checkIfContainsAsync(newLink, oldLink, server, game, channel2):
        dict1 = dict()
        channel2 = client.get_channel(logChannelID) # Fetch specific channel depending on roleDict
        oldResponse = requests.get(oldLink) # Grab the old links json data
        oldJSON = json.loads(oldResponse.text) # Make the old JSON readable 
        
        
        newResponse = requests.get(newLink) # Grab the new links json data
        newJSON = json.loads(newResponse.text) # Make the new JSON readable 

        for video in newJSON["videos"]: # Grab only "Videos"

            if video not in oldJSON["videos"]: # Check if the videos match between old and new. Same key level as "videosToCourses" and "courses"
                print("\n\nNew video detected")
                double = False
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
                                                    await channel2.send("No role for video")
                                                    break
                                                if role in ["General", "Academy"]:
                                                    role = "General"
                                                

                                                link = (f"https://www.skill-capped.com/{game}/browse3/course/{videoUUID}/{courses['uuid']}".lower().replace("|", "").replace("'","").replace(" ", "-").replace("--", "-"))
                                                # ^ saves link then reshapes into a matching format that SC uses
                                                try:

                                                    if dict1[role][-1]["vTitle"] == videoTitle:
                                                        await channel2.send(f"---------\nPOSSIBLE DOUBLEUP ON {videoTitle}\n---------")
                                                        double = True
                                                except Exception as e:
                                                    print(e)
                                                finally:
                                                    if double == True:
                                                        break
                                                    
                                                    # ^ starts function to send message to specified channel
                                                    
                                                    try: 
                                                        dict1[role] +=  [{"cTitle": courses["title"],"vTitle": videoTitle,"vuuid": videoUUID,"link":link,"tag": tag,"tId": tId}]
                                                    except:
                                                        dict1[role] =  [{"cTitle": courses["title"],"vTitle": videoTitle,"vuuid": videoUUID,"link":link,"tag": tag,"tId": tId}]

                                                    finally:
                                                        await channel2.send(f"Added to dict {videoTitle}")


                                        
                                    
                except Exception as e:
                    print("Failure", e)  # Any error within this function will return here 
                    await channel2.send(f"An error has occured during looping: {e}")

        try:
            await channel2.send(f"MessageOnNewContent initiating")
            await messageOnNewContent(dict1)
            
        except Exception as e:
            print(e)
            await channel2.send(f"Failed during checkIfContains: {e}")




                
    async def siteCheck(url,server):

        global WoWDump
        channel2 = client.get_channel(logChannelID) # Fetch specific channel depending on roleDict

        try:
            driver.get(originLink) # Grab site with headless browser



            info = driver.find_element(By.XPATH, "/html/body/script[2]") # Find the dump's script
            link = re.findall(findLink, info.get_attribute('innerHTML')) # Grab whatever link that matches anything except unix numbers
            link = link[0]
            print(link, "              new link\n", url, "              old link")
            if link != url: # If link is not the same as the url saved
                try:
                    with open(currentVersionDump, "r") as jsonFile:
                        data = json.load(jsonFile)
                    data[game] = link
                except Exception as e:
                    await channel2.send(f"Failed to read file\n{e}")
                
                try:
                    with open(currentVersionDump, "w") as jsonFile:
                        json.dump(data, jsonFile)
                except Exception as e:
                    await channel2.send(f"Failed to write file\n{e}")

                await channel2.send(f"Found new link {link}")
                await channel2.send(f"Old link is {WoWDump}")
                print("Found new link")
                
                WoWDump = link
                await channel2.send(f"Set {game} dump to {WoWDump}")
                await checkIfContainsAsync(link, url, server, game, channel2) # allow it to start checkng for videos
                
                
                
                

            else:
                
                print("no update") 
                
            
            
        except Exception as e:
            print(e) #Any errors get posted by this
            await channel2.send(f"Failed during siteCheck: {e}")
            
            
            
            
                        


    client.run() # Bot token

    