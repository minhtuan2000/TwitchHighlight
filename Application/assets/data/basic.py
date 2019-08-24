import numpy as np
from sklearn import cluster
from sklearn import metrics
import sys

def readfile(filename):
    timestamp = []
    signal = []
    with open(filename, "r", encoding='utf8') as f:
        for line in f:
            try:
                tstr = line[line.find("[") + 1: line.find("]")]
                tstr = tstr.split(":")
                pos = (int(tstr[0]) * 3600 + int(tstr[1]) * 60 + int(tstr[2])) // 5
                signal.append(int(tstr[0]) * 3600 + int(tstr[1]) * 60 + int(tstr[2]))
                timestamp += [0] * (pos + 1 - len(timestamp))
                timestamp[pos] += 1
            except:
                print(line)
    return np.array(timestamp), np.array(signal)

def writefile(filename, highlights):
    with open(filename, "w") as f:
        for highlight in highlights:
            f.write(str(highlight) + "\n") 
            
timestamp, signal = readfile(sys.argv[1])

sums = np.zeros(len(timestamp))
sums[0] = timestamp[0]
for i in range(1, len(timestamp)):
    sums[i] = sums[i - 1] + timestamp[i]
    
best = []

cnt = int(sys.argv[3])
length = int(sys.argv[4]) * 60 // 5
offset = int(sys.argv[5]) // 5
for i in range(len(timestamp) - length):
    best.append(((sums[i + length] - sums[i]) / 
                 (sums[min(i + length // 2 + len(timestamp) // cnt // 2, len(timestamp) - 1)] - 
                 sums[max(i + length // 2 - len(timestamp) // cnt // 2, 0)]), 
                 i))
    
best = sorted(best, key=lambda best: -best[0])

highlights = []
ls = []
for i in range(len(best)):
    
    if len(ls) == cnt:
        break
        
    l = best[i][1]
    check = True
    
    for j in ls:
        if l <= j <= l + length or l <= j + length <= l + length:
            check = False
            break
            
    if check: 
        l = max(l - offset, 0) # 2 means offset = 10s
        ls.append(l)
        
ls.sort()
for l in ls:
    highlights.append(str(int((l * 5) // 3600)) + "h" + str(int((l * 5) % 3600 // 60)) + "m" + str(int((l * 5) % 60)) + "s")
    
writefile(sys.argv[2], highlights)