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

reshapedSignal = np.reshape(signal, (-1, 1))

labels = cluster.Birch(n_clusters=None).fit_predict(reshapedSignal)

count = np.max(labels) + 1

true_labels = np.zeros(len(timestamp))

for i in range(len(signal)):
    true_labels[signal[i] // 5] = labels[i] + 1
    
for i in range(1, len(true_labels)):
    if true_labels[i] == 0:
        true_labels[i] = true_labels[i-1]
        
sums = np.zeros(len(true_labels))
sums[0] = timestamp[0]
for i in range(1, len(true_labels)):
    sums[i] = sums[i - 1] + timestamp[i]
    
best = np.zeros(count + 1)
l = np.zeros(count + 1)
r = np.zeros(count + 1)

for length in range(6, 30):
    for i in range(len(true_labels) - length):
        if (sums[i + length] - sums[i]) / (length ** 0.8) > best[int(true_labels[i])] and true_labels[i] == true_labels[i + length]:
            best[int(true_labels[i])] = (sums[i + length] - sums[i]) / (length ** 0.8)
            l[int(true_labels[i])] = i
            r[int(true_labels[i])] = i + length
            
l.sort()
r.sort()
            
highlights = []
durations = []
for i in range(1, count + 1):
    if (l[i] != r[i]):
        l[i] = max(l[i] - 2, 0) # 2 means offset = 10s
        durations.append(int(r[i] - l[i]) * 5)
        highlights.append(str(int((l[i] * 5) // 3600)) + "h" + str(int((l[i] * 5) % 3600 // 60)) + "m" + str(int((l[i] * 5) % 60)) + "s")
        
writefile(sys.argv[2], highlights)
writefile(sys.argv[3], durations)