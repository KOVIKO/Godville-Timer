// ==UserScript==
// @name         Godville Timer
// @version      2.0.0
// @description  Helps determine where the minute mark changes in Godville and send your godvoice right before it.
// @author       Koviko <koviko.net@gmail.com>
// @website      http://koviko.net/
// @match        http://godvillegame.com/superhero
// @grant        none
// ==/UserScript==

(function ($) {
	"use strict";

	var containerTemplate = "<div id=godville-timer><div id=current-second>:<span></span></div></div>",
		queueTemplate = "<div class=queue><div class=not-queued><span>Not Queued</span><button id=queue-voice class=not-queued>Queue Voice</button></div><div class=queued><span>Queued</span><button id=dequeue-voice class=queued>Dequeue Voice</button></div></div>",
		godvoiceButtonSelector = "#voice_submit_wrap input",
		queueButtonSelector = "#queue-voice",
		dequeueButtonSelector = "#dequeue-voice",
		currentSecondContainerSelector = "#current-second",
		currentSecondSelector = "#current-second span",
		inCombatSelector = "#news .l_capt",
		//godInteractionSelector = ".m_infl",
		timeStates = { before: "before", during: "during", exact: "exact", after: "" },
		defaultValue = "--",
		queueClassName = "active",
    timeUrl = 'http://time.akamai.com/?iso',
		maxTimeDifference = 5 * 59 * 1000,
		pad = function (value) { var abs = Math.abs(value); return (value < 0 ? "-" : "") + (abs < 10 ? "0" : "") + abs; };

	$(function () {
		var container = $(containerTemplate).prependTo(document.body),
			queue = $(queueTemplate).appendTo(container),
			queueButton = $(queueButtonSelector, queue),
			dequeueButton = $(dequeueButtonSelector, queue),
			godvoiceButton = null,
			currentSecondContainer = $(currentSecondContainerSelector, container),
			currentSecondElement = $(currentSecondSelector, container),
			currentSecond = null,
			currentState = null,
      lastUpdate = null,
      timeAtUpdate = null,
      isUpdating = false,
			isQueued = false,
			isInCombat,
			updateQueue,
			changeState,
			updateDisplay,
      updateTime,
			checkTime;

		isInCombat = function () { // Determine whether the hero is in combat
			return $(inCombatSelector).is(":visible");
		};

		updateQueue = function (isQ) { // Update state of queue
			isQueued = isQ;
			queue.toggleClass(queueClassName, isQ);
		};

		changeState = function (newState) { // Update state of current second
			if (newState !== currentState) {
				// Change the class
				currentSecondContainer.removeClass(currentState);
				currentSecondContainer.addClass(newState);

				// Update state
				currentState = newState;

				// React to "exact" state
				if (currentState === timeStates.exact && isQueued && !isInCombat()) {
					updateQueue(false);

					// Make sure the button exists
					if (!godvoiceButton || !godvoiceButton.length) {
						godvoiceButton = $(godvoiceButtonSelector);
					}

					// Click the button
					if (godvoiceButton.length && !godvoiceButton.is(":disabled")) {
						godvoiceButton.click();
					}
				}
			}
		};

		updateDisplay = function () { // Update the display
      if (currentSecond === null) {
        currentSecondElement.text(defaultValue);
      } else {
        var state = timeStates.after;

        // Update the second display
        if (currentSecond >= 59) {
          state = timeStates.exact;
        } else if (currentSecond >= 56) {
          state = timeStates.during;
        } else if (currentSecond >= 53) {
          state = timeStates.before;
        }

        // Update the current second display
        currentSecondElement.text(pad(currentSecond));

        // Update the display's state
        changeState(state);
      }
		};

    updateTime = function () { // Update the current time
      if (!isUpdating) {
        var start = Date.now();
        isUpdating = true;

        $.ajax(timeUrl, {
          success: function (time) {
            if (time) {
              isUpdating = false;
              lastUpdate = Date.now();

              // Account for any lag in the request
              timeAtUpdate = (new Date(time)).getTime() + (lastUpdate - start);
            }
          }
        });
      }
    };

		checkTime = function () { // Check if the time has been updated
      if (!(lastUpdate && timeAtUpdate)) {
        updateTime();
        currentSecond = null;
      } else {
        var now = Date.now(),
          difference = timeAtUpdate && lastUpdate ? now - lastUpdate : 0;

        // Check if the time needs to be updated
        if (!lastUpdate || difference >= maxTimeDifference) {
          updateTime();
        }

        // Update display
        currentSecond = (new Date((timeAtUpdate || now) + difference)).getSeconds();
      }

      updateDisplay();
		};

		// Add queue actions
		queueButton.click(function () { updateQueue(true); });
		dequeueButton.click(function () { updateQueue(false); });

		// Add styles
		$("head").append("<style id=godville-timer-stylesheet>\n" +
			"#godville-timer { position: fixed; left: 0; bottom: 32px; padding: 8px 16px; width: 100%; background: rgba(0,0,0,0.5); color: white; font-size: 150%; text-align: right; pointer-events: none; overflow: hidden; z-index: 9999; box-sizing: border-box; }" +
			"#godville-timer > div { display: inline-block; padding: 0 8px; height: 64px; line-height: 64px; font-size: 200%; background: rgba(0,0,0,0.1) }" +
			"#godville-timer > div + div { margin-left: 10px }" +
			"#godville-timer > #current-second { background: rgba(0,0,0,0.3) }" +
			"@keyframes pulse { 0% { background-color: rgba(150,150,150,0.3) } 100% { background: rgba(0,0,0,0.3) } }" +
			"#godville-timer > #current-second.before, #godville-timer > #current-second.during, #godville-timer > #current-second.exact { animation: pulse 1s ease-out infinite }" +
			"#godville-timer > #current-second.before { color: #f7f7b7 }" +
			"#godville-timer > #current-second.during { color: #a1d1a1 }" +
			"#godville-timer > #current-second.exact { color: #3ada3a }" +
			"#godville-timer .queue { position: absolute; left: 0; top: 8px; background: rgba(0,0,0,0.5); font-size: 75%; text-align: center; line-height: 250%; border-radius: 4px }" +
			"#godville-timer .queue .queued, #godville-timer .queue.active .not-queued { display: none }" +
			"#godville-timer .queue.active .queued, #godville-timer .queue span { display: block }" +
			"#godville-timer .queue button { pointer-events: all }" +
			"</style>");

		setInterval(checkTime, 500);
	});
}(window.jQuery));