full = {}

l =  {'Astra': 'Controller', 'Breach': 'Initiator', 'Brimstone': 'Controller', 'Chamber': 'Sentinel', 'Cypher': 'Sentinel', 'Jett': 'Dualist', 'Kayo': 'Initiator', 'Killjoy': 'Sentinel', 'Neon': 'Dualist', 'Omen': 'Controller', 'Pheonix': 'Dualist', 'Raze': 'Dualist', 'Reyna': 'Dualist', 'Sage': 'Sentinel', 'Skye': 'Initiator', 'Sova': 'Initiator', 'Viper': 'Controller', 'Yoru': 'Dualist', 'Harbor': 'Controller', 'Fade': 'Initiator', 'Gekko': 'Initiator'}
print(str(l).replace("'", '"'))

while True:
    whoDis = input("agent ")
    if whoDis in ["done", "y", "yes"]:
        break
    idInput = input(f"[{whoDis}] Role: ")
    

    full[whoDis] = idInput

    
    
print("\n\n\n\n",full)