// ==UserScript==
// @name         Godville Timer
// @version      1.3.1
// @description  Helps determine where the minute mark changes in Godville and send your godvoice right before it.
// @author       Koviko <koviko.net@gmail.com>
// @website      http://koviko.net/
// @match        http://godvillegame.com/superhero
// @grant        none
// ==/UserScript==

(function ($) {
	"use strict";

	var lastTimeSelector = "#diary .d_time:first",
		containerTemplate = "<div id=godville-timer><div id=latest-second>:<span>--</span></div><div id=current-second>:<span></span></div><div id=earliest-second>:<span>--</span></div></div>",
		queueTemplate = "<div class=queue><div class=not-queued><span>Not Queued</span><button id=queue-voice class=not-queued>Queue Voice</button></div><div class=queued><span>Queued</span><button id=dequeue-voice class=queued>Dequeue Voice</button></div></div>",
		godvoiceButtonSelector = "#voice_submit_wrap input",
		queueButtonSelector = "#queue-voice",
		dequeueButtonSelector = "#dequeue-voice",
		earliestSecondSelector = "#earliest-second span",
		latestSecondSelector = "#latest-second span",
		currentSecondContainerSelector = "#current-second",
		currentSecondSelector = "#current-second span",
		//godInteractionSelector = ".m_infl",
		timeStates = { before: "before", during: "during", exact: "exact", after: "" },
		defaultValue = "--",
		queueClassName = "active",
		readyClassName = "is-ready",
		storageKey = "godville-timer",
		timeDelimiter = ":",
		halfDay = 12 * 60 * 60 * 1000,
		maxTimeDifference = 59 * 1000,
		secondsPerMinute = 60,
		millisecondsPerMinute = secondsPerMinute * 1000,
		maxLength = 100,
		maxDisplayDifference = 10,
		beforeThreshold = 3,
		exactOffset = -1,
		pad = function (value) { var abs = Math.abs(value); return (value < 0 ? "-" : "") + (abs < 10 ? "0" : "") + abs; },
		toSeconds = function (value) { value = value % secondsPerMinute; return value < 0 ? value + secondsPerMinute : value; };

	$(function () {
		var lastTime = null,
			lastUpdate = null,
			allSeconds = JSON.parse(localStorage.getItem(storageKey)) || [],
			container = $(containerTemplate).prependTo(document.body),
			queue = $(queueTemplate).appendTo(container),
			queueButton = $(queueButtonSelector, queue),
			dequeueButton = $(dequeueButtonSelector, queue),
			godvoiceButton = null,
			earliestSecondElement = $(earliestSecondSelector, container),
			latestSecondElement = $(latestSecondSelector, container),
			currentSecondContainer = $(currentSecondContainerSelector, container),
			currentSecondElement = $(currentSecondSelector, container),
			currentSecond = (new Date()).getSeconds(),
			currentState = null,
			isFirst = true,
			isQueued = false,
			isReady = false,
			sortTime,
			onlyUnique,
			updateQueue,
			changeState,
			updateDisplay,
			validateTime,
			addTime,
			checkTime;

		sortTime = function (a, b) { // Sort the time elements
			return a.second - b.second;
		};

		onlyUnique = function (value, index, self) { // Filter non-unique values
			return self.indexOf(value) === index;
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
				if (currentState === timeStates.exact && isQueued) {
					updateQueue(false);

					// Make sure the button exists
					if (!godvoiceButton || !godvoiceButton.length) {
						godvoiceButton = $(godvoiceButtonSelector);
					}

					// Click the button
					if (!godvoiceButton.is(":disabled")) {
						godvoiceButton.click();
					}
				}
			}
		};

		updateDisplay = function () { // Update the display
			var earliestSecond = null,
				latestSecond = null,
				beforeSecond = null,
				difference = null,
				normalizedDifference = null,
				beforeDifference = null,
				exactSecond = null,
				state = null;

			if (allSeconds.length > 1) {
				// Determine the earliest and latest seconds
				earliestSecond = toSeconds(allSeconds[0].second);
				latestSecond = toSeconds(allSeconds[allSeconds.length - 1].second);
				beforeSecond = toSeconds(latestSecond - beforeThreshold);
				difference = earliestSecond - latestSecond;
				normalizedDifference = toSeconds(difference);
				beforeDifference = latestSecond - beforeSecond;
				exactSecond = toSeconds(earliestSecond + exactOffset);

				// Determine if the current second is in between the latest and earliest seconds
				if (normalizedDifference <= maxDisplayDifference && normalizedDifference > 0) {
					// Update the ready state
					if (!isReady) {
						isReady = true;
						container.addClass(readyClassName);
					}

					// Update the second display
					if (currentSecond === exactSecond) {
						state = timeStates.exact;
					} else if (difference >= 0 && (currentSecond < earliestSecond && currentSecond >= latestSecond)) {
						state = timeStates.during;
					} else if (difference < 0 && (currentSecond < earliestSecond || currentSecond >= latestSecond)) {
						state = timeStates.during;
					} else if (beforeDifference >= 0 && (currentSecond < latestSecond && currentSecond >= beforeSecond)) {
						state = timeStates.before;
					} else if (beforeDifference < 0 && (currentSecond < latestSecond || currentSecond >= beforeSecond)) {
						state = timeStates.before;
					} else {
						state = timeStates.after;
					}
				} else if (isReady) {
					isReady = false;
					container.removeClass(readyClassName);
				}

				// Update the earliest & latest seconds
				earliestSecondElement.text(pad(earliestSecond));
				latestSecondElement.text(pad(latestSecond));
			} else {
				// Clear the earliest and latest seconds
				earliestSecondElement.text(defaultValue);
				latestSecondElement.text(defaultValue);
			}

			// Update the current second display
			currentSecondElement.text(pad(currentSecond));

			// Update the display's state
			changeState(state);
		};

		validateTime = function (timeObject) { // Add a new time and validate existing times against it
			// Add new time object
			if (timeObject) {
				allSeconds.push(timeObject);
			} else if (!allSeconds.length) {
				return;
			}

			// Sort all times
			allSeconds.sort(sortTime);

			// Validate earliest and latest seconds are within 60 seconds of each other
			while ((allSeconds[allSeconds.length - 1].second - allSeconds[0].second) >= secondsPerMinute) {
				// Remove first and last element
				allSeconds.pop();
				allSeconds.shift();
			}

			// Save to localStorage
			if (allSeconds.length > maxLength) {
				allSeconds = allSeconds.filter(onlyUnique);
			}

			localStorage.setItem(storageKey, JSON.stringify(allSeconds));
		};

		addTime = function (seconds, time) { // Add a new time
			if (isFirst) {
				isFirst = false;
				return;
			}

			// Add to collection and validate existing elements
			validateTime({ second: seconds, time: time });
		};

		checkTime = function () { // Check if the time has been updated
			var element = $(lastTimeSelector),
				time = element.text(),
				timeParts = time.split(timeDelimiter),
				then = new Date(),
				now = new Date(),
				timeDifference = 0,
				timestamp = now.getTime(),
				realSeconds = null,
				sinceLastUpdate = null,
				//isGodUpdate = $(godInteractionSelector, element).length > 0,
				timeText;

			// Update the current second
			currentSecond = now.getSeconds();
			realSeconds = currentSecond;

			// Get the actual date of the time
			timeParts = time.split(timeDelimiter);
			then.setHours(parseInt(timeParts[0], 10));
			then.setMinutes(parseInt(timeParts[1], 10));

			// Determine the minute difference between the displayed time and the local time
			timeDifference = Math.floor(((timestamp % halfDay) - (then.getTime() % halfDay)) / millisecondsPerMinute);

			if (timeDifference !== 0) {
				realSeconds += timeDifference * secondsPerMinute;
			}

			// Determine the time difference since the last update
			if (lastUpdate) {
				sinceLastUpdate = Math.abs(timestamp - lastUpdate);
			}

			// Update this as the latest update
			lastUpdate = timestamp;

			// Determine if the time is new
			if (time !== lastTime) { //&& !isGodUpdate) {
				// Determine whether the current time can be considered valid
				if (sinceLastUpdate !== null && sinceLastUpdate < maxTimeDifference) {
					// Make the time readable
					timeText = (pad(now.getHours() % 12) || 12) + timeDelimiter + pad(now.getMinutes()) + timeDelimiter + pad(currentSecond);

					// Add the time to the collection
					addTime(realSeconds, timeText);
				}

				// Update last time
				lastTime = time;
			}

			// Update display
			updateDisplay();
		};

		// Initiate the display
		if (allSeconds.length) {
			updateDisplay();
		}

		// Add queue actions
		queueButton.click(function () { updateQueue(true); });
		dequeueButton.click(function () { updateQueue(false); });

		// Add styles
		$("head").append("<style id=godville-timer-stylesheet>\n" +
			"#godville-timer { position: fixed; left: 0; bottom: 32px; padding: 8px 16px; width: 100%; background: rgba(0,0,0,0.5); color: white; font-size: 150%; text-align: center; pointer-events: none; overflow: hidden; z-index: 9999; box-sizing: border-box; }" +
			"#godville-timer > div { display: inline-block; padding: 0 8px; height: 64px; line-height: 64px; font-size: 200%; background: rgba(0,0,0,0.1) }" +
			"#godville-timer > div + div { margin-left: 10px }" +
			"#godville-timer > #current-second { background: rgba(0,0,0,0.3) }" +
			"@keyframes pulse { 0% { background-color: rgba(150,150,150,0.3) } 100% { background: rgba(0,0,0,0.3) } }" +
			"#godville-timer > #current-second.before, #godville-timer > #current-second.during, #godville-timer > #current-second.exact { animation: pulse 1s ease-out infinite }" +
			"#godville-timer > #current-second.before { color: #f7f7b7 }" +
			"#godville-timer > #current-second.during { color: #a1d1a1 }" +
			"#godville-timer > #current-second.exact { color: #3ada3a }" +
			"#godville-timer .queue { display: none; position: absolute; left: 0; top: 8px; background: rgba(0,0,0,0.5); font-size: 75%; text-align: center; line-height: 250%; border-radius: 4px }" +
			"#godville-timer.is-ready .queue { display: block }" +
			"#godville-timer .queue .queued, #godville-timer .queue.active .not-queued { display: none }" +
			"#godville-timer .queue.active .queued, #godville-timer .queue span { display: block }" +
			"#godville-timer .queue button { pointer-events: all }" +
			"</style>");

		setInterval(checkTime, 500);
	});
}(window.jQuery));