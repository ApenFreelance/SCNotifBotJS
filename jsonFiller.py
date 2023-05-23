full = {}
while True:
    print(full.keys())
    done = input("Done? ")
    if done in ["done", "y", "yes"]:
        break
    whoDis = input("what channel is this for? ")
    idInput = input(f"[{whoDis}] roleId: ")
    channelidInput = input(f"[{whoDis}] channelId: ")
    imgInput = input(f"[{whoDis}] img: ")

    full[whoDis] = {
        "id":idInput,
        "channelid":channelidInput,
        "img":imgInput
    }
    
print("\n\n\n\n",full)