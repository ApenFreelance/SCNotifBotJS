import sys
import os
from tkinter import *
from threading import *

window=Tk()

window.title("Bot Control Window")

def threading():
    # Call work function
    t1=Thread(target=runWOTLK)
    t1.start()
def threading2():
    # Call work function
    t1=Thread(target=runWOW)
    t1.start()


def runWOTLK():
    os.system('C:\\Users\\julia\Desktop\\wotlkConnection\\wotlkRUN.py')

def runWOW():
    os.startfile('C:\\Users\\julia\\Desktop\\wotlkConnection\\wowRUN.py')

Button(window,text="Run WOTLK",command = threading, background="green").pack()
Button(window,text="Run WOW",command = threading2, background="red").pack()
window.mainloop()