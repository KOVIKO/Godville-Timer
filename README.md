# Godville Timer

The Godville Timer is a timer that watches your journal and tries to determine the position of the minute-mark by checking how different your local time is from the estimated server time.

## Installation

You will need a userscript manager like [Tampermonkey for Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) or [Greasemonkey for Firefox](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) installed on your browser before using this script. The script is installed via one of these tools.

To install the script, click the `godville-timer.user.js` in GitHub and then click the **`Raw`** button. Your userscript manager should automatically give you the option to install the script. Alternatively, you can just follow the link below:

**[»» Install Godville Timer ««](https://github.com/Koviko/Godville-Timer/raw/master/godville-timer.user.js)**

## The UI

![Godville Timer Bar](http://i.imgur.com/3v0MLl4.png)

The Godville Timer bar will not block you from clicking anything beneath it. The only part of it that can be interacted with is the button in the queue box. The bar will appear all the way at the bottom of your window as to potentially cover up the least amount of space it possibly can. The bar's elements are as follows:

* **Queue Box**: On the left is the element that allows you to queue your godvoice. If you have input a godvoice in the regular godvoice box (the input box under your godpower bar), then this will activate the <kbd>Send</kbd> button at the time which the script has deemed most appropriate.
* **Timer**: On the right is the element that shows you the estimated server time. It changes colors as it approaches the `:59` second-mark and indicates at which point a queued godvoice will be activated.

## Why you should use it

There's a superstition amongst Godville players that if you use your godvoice right before the minute-mark, there's a higher chance that your hero will acknowledge your command. Whether this is true or not remains to be tested, but I have personally received better results by purposely using my godvoice right before the minute-mark and [a few others have claimed the same](http://wiki.godvillegame.com/Digging#Guide_1). It doesn't guarantee that your hero will obey the godvoice, but it may increased the odds of the hero responding to the godvoice.

The goal of this script is to make it so that your godvoice triggers at the `:59` second-mark and Godville responds at the `:00` second-mark. If successful then, visually in your diary, the command and the response should have different timestamps.

The current server time is visible by clicking the title of the "Remote Control" element. However, this display seems to hide eventually on its own. This script makes the current second always visible and updates every five minutes, just in case there is lag or your computer's time changes automatically.

While you could send your godvoice manually, you may sometimes find yourself losing focus while doing something else and just barely missing the mark. This script will allow you to queue your next godvoice command and it will trigger itself right before its currently calculated minute-mark, provided you are not in combat.

## How it works

This script retrieves the server time from the same source as Godville and uses this to determine the current second in relation to your local time. Whenever the `:59` second-mark is close, the **Timer** will pulse green. A few seconds before pulsing green (3 seconds before), the **Timer** will pulse yellow.

The goal is to send a godvoice in the second prior to reaching the value to the right of the **Timer**. The script provides queuing functionality that will trigger your godvoice by pressing <kbd>Send</kbd> at that moment, provided you have text entered into the godvoice box and your hero is not currently in combat. Just click <kbd>Queue Voice</kbd> in the **Queue Box** to prepare the script to send your godvoice at the `:59` second-mark. If you change your mind about sending any godvoice commands, you can dequeue a queued godvoice at any time by clicking <kbd>Dequeue Voice</kbd> in the **Queue Box**. You are also free to change the text of your godvoice at any time without interrupting the queue.

## Limitations

The Queue will not send your godvoice during combat. This means that if you want to use combat godvoice commands (eg. hit), you'll need to send these manually. The large majority of godvoice commands do not work in combat, so the convenience of this feature outweighs the restrictions.

The script will also not hide when you are in a boss fight or arena fight. You will just need to do your best to ignore its presence. Sorry.

## License

Godville Timer is licensed under the MIT License. Refer to the [LICENSE](https://github.com/Koviko/Godville-Timer/blob/master/LICENSE) file.
