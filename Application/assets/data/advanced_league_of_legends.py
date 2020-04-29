import re
import numpy as np
import sys

filename = sys.argv[1]

start_game_length = 35
start_game_offset = -50
start_game_keywords = ["pog", "pogu", "ayaya", "trihard"]
start_game_antikeywords = ["peped", "pepelaugh"]
start_game_cutoff = 0.5

end_game_length = 2
end_game_offset = -50
end_game_keywords = ["gg", "ez"]
end_game_antikeywords = ["peped", "pepelaugh"]

highlight_potential_decay = 0.9


def readfile(filename, keywords=[], antikeywords=[]):
    timestamp = []
    signal = []
    with open(filename, "r", encoding='utf8') as f:
        for line in f:
#             try:
            words = re.split(r'\W+', line)
            tstr = words[1:]

            check = False
            if len(keywords) > 0:
                for word in tstr[4:]:
                    if word.lower() in keywords:
                        check = True
                        break
            else:
                check = True
            if len(antikeywords) > 0:
                for word in tstr[4:]:
                    if word.lower() in antikeywords:
                        check = False
                        break

            if check:
                pos = (int(tstr[0]) * 3600 + int(tstr[1]) * 60 + int(tstr[2])) // 5
                signal.append(int(tstr[0]) * 3600 + int(tstr[1]) * 60 + int(tstr[2]))
                timestamp += [0] * (pos + 1 - len(timestamp))
                timestamp[pos] += 1
#             except:
#                 print(line)
    return np.array(timestamp), np.array(signal)


def writefile(filename, data):
    with open(filename, "w") as f:
        for line in data:
            f.write(str(line) + "\n") 


def findhighlights(filename, count, length, offset, keywords = [], antikeywords = [], cutoff = -float('inf'), sort = True, ranges = []):
    """
        :param filename: input file name
        :param count: number of highlights to find
        :param length: length of each highlight in minutes, -1 implies auto detech length
        :param offset: offset of each highlight in seconds
        :param keywords: (optional, default = []) list of keywords must be included in chat
        :param antikeywords: (optional, default = []) list of keywords must not be included in chat, chat will be ignore if it contains one of antikeywords, even if it contains keywords
        :param cutoff: (optional, default = -oo) cutoff threshold for highlight scoring system
        :param sort: (optional, default = True) whether to sort resulted highlights
        :param ranges: (optional, default = []) specify ranges to search for highlights
        :type filename: string
        :type count: int
        :type length: int
        :type offset: int
        :type keywords: list of strings
        :type antikeywords: list of strings
        :type cutoff: float
        :type sort: boolean
        :type ranges: list of pairs of timestamp string
        :return: list of highlights' timestamp strings and list of highlights' lengths in seconds
        :rtype: a list of string and a list of int 
    """
    
    timestamp, signal = readfile(filename, keywords, antikeywords)
    if len(timestamp) == 0: return [], []

    sums = np.zeros(len(timestamp))
    sums[0] = timestamp[0]
    for i in range(1, len(timestamp)):
        sums[i] = sums[i - 1] + timestamp[i]

    best = []
    highlights = []
    durations = []

    automode = (length <= 0)
    cnt = count
    length = (5 * 60 // 5) if automode else (int(length * 60) // 5)
    offset = offset // 5
    for i in range(len(timestamp) - length):
        best.append(((sums[i + length] - sums[i]) / 
                     (sums[min(i + length + len(timestamp) // cnt, len(timestamp) - 1)] - 
                     sums[max(i - len(timestamp) // cnt, 0)]), 
                     i))

    best = sorted(best, key=lambda best: -best[0])

    ls = []
    for i in range(len(best)):
        if (best[i][0] < cutoff): 
            break

        if len(ls) == cnt:
            break

        l = best[i][1]
        check = False
        
        if len(ranges) > 0:
            for a, b in ranges:
                a = re.split("h|m|s", a)
                a = int(a[0]) * 60 * 60 + int(a[1]) * 60 + int(a[2])
                b = re.split("h|m|s", b)
                b = int(b[0]) * 60 * 60 + int(b[1]) * 60 + int(b[2])
                if a <= l * 5 <= b:
                    check = True
                    break
        else:
            check = True
    
        for j in ls:
            if l <= j <= l + length or l <= j + length <= l + length:
                check = False
                break

        if check: 
            l = max(l - offset, 0) # 2 means offset = 10s
            ls.append(l)
    
    if sort:
        ls.sort()

    if not automode:
        #Manual mode
        for l in ls:
            highlights.append(str(int((l * 5) // 3600)) + "h" + str(int((l * 5) % 3600 // 60)) + "m" + str(int((l * 5) % 60)) + "s")
            durations.append(length * 5)
    else:
        #Auto mode
        true_labels = np.zeros(len(timestamp))

        for i in range(len(ls)):
            for j in range(ls[i], ls[i] + length):
                true_labels[j] = i + 1

        for i in range(1, len(true_labels)):
            check = False
            if len(ranges) > 0:
                for a, b in ranges:
                    a = re.split("h|m|s", a)
                    a = int(a[0]) * 60 * 60 + int(a[1]) * 60 + int(a[2])
                    b = re.split("h|m|s", b)
                    b = int(b[0]) * 60 * 60 + int(b[1]) * 60 + int(b[2])
                    if a <= i * 5 <= b:
                        check = True
                        break
            else:
                check = True
                
            if true_labels[i] == 0 and check:
                true_labels[i] = true_labels[i - 1]

        for i in range(len(true_labels) - 2, -1, -1):
            check = False
            if len(ranges) > 0:
                for a, b in ranges:
                    a = re.split("h|m|s", a)
                    a = int(a[0]) * 60 * 60 + int(a[1]) * 60 + int(a[2])
                    b = re.split("h|m|s", b)
                    b = int(b[0]) * 60 * 60 + int(b[1]) * 60 + int(b[2])
                    if a <= i * 5 <= b:
                        check = True
                        break
            else:
                check = True
             
            if true_labels[i] == 0 and check:
                true_labels[i] = true_labels[i + 1]

        sums = np.zeros(len(true_labels))
        sums[0] = timestamp[0]
        for i in range(1, len(true_labels)):
            sums[i] = sums[i - 1] + timestamp[i]

        best = np.zeros(cnt + 1)
        l = np.zeros(cnt + 1)
        r = np.zeros(cnt + 1)

        for length in range(4, 24):
            for i in range(len(true_labels) - length):
                if (sums[i + length] - sums[i]) / (length ** highlight_potential_decay) > best[int(true_labels[i])] and true_labels[i] == true_labels[i + length]:
                    best[int(true_labels[i])] = (sums[i + length] - sums[i]) / (length ** highlight_potential_decay)
                    l[int(true_labels[i])] = i
                    r[int(true_labels[i])] = i + length
        
        l.sort()
        r.sort()

        for i in range(1, cnt + 1):
            if (l[i] != r[i]):
                l[i] = max(l[i] - 2, 0) # 2 means offset = 10s
                durations.append(int(r[i] - l[i]) * 5)
                highlights.append(str(int((l[i] * 5) // 3600)) + "h" + str(int((l[i] * 5) % 3600 // 60)) + "m" + str(int((l[i] * 5) % 60)) + "s")

    return highlights, durations

ranges = []
tmp = readfile(filename)
vod_length = len(tmp[0]) * 5 / 60 / 60
vod_chat_count = sum(tmp[1])

if vod_chat_count / vod_length > 1000:
    game_count = (len(readfile(filename)[0]) * 5) // 3600 * 2
    game_starts, _ = findhighlights(filename, game_count, start_game_length, start_game_offset, start_game_keywords, start_game_antikeywords, cutoff = start_game_cutoff)
    potential_game_ends, _ = findhighlights(filename, game_count, end_game_length, end_game_offset, end_game_keywords, end_game_antikeywords, sort = False)

    game_ends = []
    for i in range(len(game_starts)):
        a = game_starts[i]
        a = re.split("h|m|s", a)
        a = int(a[0]) * 60 * 60 + int(a[1]) * 60 + int(a[2])
        b = float("inf")
        game_ends.append("1000h0m0s")
        if i < len(game_starts) - 1:
            b = game_starts[i+1]
            b = re.split("h|m|s", b)
            b = int(b[0]) * 60 * 60 + int(b[1]) * 60 + int(b[2])
            game_ends[-1] = game_starts[i+1]
        for j in range(len(potential_game_ends)):
            c = potential_game_ends[j]
            c = re.split("h|m|s", c)
            c = int(c[0]) * 60 * 60 + int(c[1]) * 60 + int(c[2])
            if a < c <= b:
                game_ends[-1] = potential_game_ends[j]
                break

    ranges = list(zip(game_starts, game_ends))

highlights, durations = findhighlights(filename, int(sys.argv[4]), int(sys.argv[5]), int(sys.argv[6]), keywords=start_game_keywords + end_game_keywords, ranges = ranges)
if highlights == []: 
    highlights, durations =  findhighlights(filename, int(sys.argv[4]), int(sys.argv[5]), int(sys.argv[6]))

# Write to results to files
writefile(sys.argv[2], highlights)
writefile(sys.argv[3], durations)
