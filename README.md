# Godville Timer

The Godville Timer is a timer that watches your journal and tries to determine the position of the minute-mark by checking how different your local time is from the estimated server time.

##Installation

You will need a userscript manager like [Tampermonkey for Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) or [Greasemonkey for Firefox](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) installed on your browser before using this script. The script is installed via one of these tools.

To install the script, click the `godville-timer.user.js` in GitHub and then click the **`Raw`** button. Your userscript manager should automatically give you the option to install the script. Alternatively, you can just follow the link below:

**[»» Install Godville Timer ««](https://github.com/Koviko/Godville-Timer/raw/master/godville-timer.user.js)**

##The UI

![Godville Timer Bar](http://i.imgur.com/5P0ZXcz.png)

The Godville Timer bar will not block you from clicking anything beneath it. The only part of it that can be interacted with is the button in the queue box. The bar will appear all the way at the bottom of your window as to potentially cover up the least amount of space it possibly can. The bar's elements are as follows:

* **Queue Box**: On the left is the element that allows you to queue your godvoice. If you have input a godvoice in the regular godvoice box (the input box under your godpower bar), then this will activate the <kbd>Send</kbd> button at the time which the script has deemed most appropriate.
* **Latest Second**: The leftmost of the three timers represents the latest second found within a minute. This aims to be as close to the `:59` second-mark as possible.
* **Main Timer**: The center of the three timers is the current second of your local time (i.e. the time on your computer's clock). This will change colors depending on the current time in relation to the **Latest Second** and **Earliest Second**.
* **Earliest Second**: The rightmost of the three timers represents the earliest second found within a minute. This aims to be as close to the `:00` second-mark as possible.

##Why you should use it

There's a superstition amongst Godville players that if you use your godvoice right before the minute-mark, there's a higher that your hero will acknowledge your command. Whether this is true or not remains to be tested, but I have personally gotten better results by purposely using my godvoice right before the minute-mark and [a few others have claimed the same](http://wiki.godvillegame.com/Digging#Guide_1). It doesn't guarantee that your hero will obey the godvoice, but it may increased the odds of the hero responding to the godvoice.

The goal of this script is to make it so that your godvoice triggers at the `:59` second-mark and Godville responds at the `:00` second-mark. If successful then, visually in your diary, the command and the response should have different timestamps.

While you could attempt to determine the offset manually, I used to do this and found that the offset seems to change from time to time. Whether this is due to lag or something else, I found that the offset might be 10 seconds in the morning, but 5 seconds by the evening and 15 seconds the next day. This script will attempt to adapt when that time might be changing.

While you could send your godvoice manually, you may sometimes find yourself losing focus while doing something else and just barely missing the mark. This script will allow you to queue your next godvoice command and it will trigger itself right before its currently calculated minute-mark. If the calculation is incorrect, it will miss, so I recommend only using this feature when you have a window of less than 5 seconds for best results.

##How it works

Whenever a journal entry is added, this script will take note of the time that the entry claims to have been added and compare it to the time on your computer. It will add this offset to the full data set, which is then used to determine the latest and earliest offsets within a given minute. These are represented by the two values surrounding the **Main Timer**. As long as the time between these two values is short enough (10 seconds), the **Main Timer** will pulse green while between the values. A few seconds before pulsing green (3 seconds before), the **Main Timer** will pulse yellow.

The goal is to send a godvoice in the second prior to reaching the value to the right of the **Main Timer**. The script provides queuing functionality that will trigger your godvoice by pressing <kbd>Send</kbd> at that moment, provided you have text entered into the godvoice box. Just click <kbd>Queue Voice</kbd> in the **Queue Box** to prepare the script to send your godvoice at the `:59` second-mark. I recommend making sure you have some idea of what your hero will be doing at the minute-mark, though, or else you may send impossible commands (*eg.* attempting to dig during a fight). Luckily, you can dequeue a queued godvoice at any time by clicking <kbd>Dequeue Voice</kbd> in the **Queue Box**. You are also free to change the godvoice's text at any time without messing up the queue.

##Limitations

This script will save data between sessions, but it will not transfer automatically between different browsers or computers. That means that if you play Godville from multiple browsers or locations, you will need to run this on all of them. This is incidentally a good thing when dealing with different computers as they might have different latency and a different local time. But overall, it's just because this script is entirely local and does not communicate over the Internet at all.

The script will also not hide when you are in a boss fight or arena fight. You will just need to do your best to ignore its presence. Sorry.

##License

Godville Timer is licensed under the MIT License. Refer to the [LICENSE](https://github.com/Koviko/Godville-Timer/blob/master/LICENSE) file.
