/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	__webpack_require__(5);
	
	const {
	  LS_KEY_EMAIL,
	  LINE_HEIGHT,
	  DETAIL_PADDING,
	  MILLISECOND_A_DAY,
	  BUGZILLA_BIRTH_YEAR,
	  MONTHS,
	  COLORS,
	  PRIORITY_REGEX
	} = __webpack_require__(8);
	const {ApiHandler} = __webpack_require__(9);
	const {needWhiteText, getMondayOfFirstWeek, findLane, createSVGElement} = __webpack_require__(10);
	
	function init() {
	  addListeners();
	  let email = getEmail();
	
	  if (email !== null) {
	    onEmailChange(email);
	  } else {
	    setFormMode();
	  }
	}
	
	function onEmailChange(email) {
	  setDashboardMode();
	  if (email !== bugzillaEmail) {
	    if (isZoomed()) {
	      zoomOut();
	    }
	
	    svg.innerHTML = svg.querySelector("defs").outerHTML;
	    bugzillaEmail = email;
	    document.querySelector(".email").textContent = email;
	    emailInput.value = email;
	
	    ApiHandler.getUserBugs(email).then(function (data) {
	      lanes = [];
	      displayedYears = [];
	      bugs = data.bugs;
	      setDashboardYear((new Date()).getFullYear());
	    });
	  }
	}
	
	function setDashboardMode() {
	  formSection.classList.add("hidden");
	  dashboardSection.classList.remove("hidden");
	}
	
	function setFormMode() {
	  dashboardSection.classList.add("hidden");
	  formSection.classList.remove("hidden");
	  emailInput.focus();
	  emailInput.select();
	}
	
	function isFormMode() {
	  return !formSection.classList.contains("hidden");
	}
	
	function isZoomed() {
	  return document.body.classList.contains("zoomed");
	}
	
	function getEmail() {
	  let urlParamEmail;
	  if (window.URLSearchParams) {
	    urlParamEmail = new URLSearchParams(location.search.substr(1)).get("email");
	  } else {
	    let fields = location.search.substring(1).split("&");
	    let fieldMap = {};
	    fields.forEach(function (item) {
	      let splits = item.split("=");
	      fieldMap[splits[0]] = splits[1];
	    });
	    if (fieldMap.email) {
	      urlParamEmail = decodeURIComponent(fieldMap.email);
	    }
	  }
	
	  if (urlParamEmail) {
	    return urlParamEmail;
	  }
	
	  let lsEmail = localStorage.getItem(LS_KEY_EMAIL);
	  if (lsEmail !== null) {
	    return lsEmail;
	  }
	
	  return null;
	}
	
	function hideTooltip() {
	  if (tooltipEl.innerHTML === "") {
	    return null;
	  }
	  tooltipHideId = setTimeout(function () {
	    tooltipHideId = null;
	    tooltipEl.style.left = `-9999px`;
	    tooltipEl.style.top = `0`;
	    tooltipEl.style.backgroundColor = "";
	    tooltipEl.textContent = "";
	    tooltipEl.classList.remove("dark");
	  }, 200);
	  return tooltipHideId;
	}
	
	function addListeners() {
	  document.addEventListener("keydown", onKeyDown);
	  form.addEventListener("submit", onFormSubmit, false);
	  svg.addEventListener("click", onSvgClick, false);
	  svg.addEventListener("mousemove", onMouseMove, false);
	
	  document.querySelector(".edit-email").addEventListener("click", setFormMode);
	  document.getElementById("esc").addEventListener("click", zoomOut);
	
	  Array.from(document.querySelectorAll(".year-nav")).forEach(function (btn) {
	    btn.addEventListener("click", function () {
	      let newYear = parseInt(btn.getAttribute("data-year"), 10);
	      setDashboardYear(newYear);
	    });
	  });
	}
	
	function onFormSubmit(e) {
	  let data = new FormData(e.target);
	  let email = data.get("email");
	  if (email) {
	    localStorage.setItem(LS_KEY_EMAIL, email);
	    history.pushState(
	      {},
	      "Bugzilla Dashboard for " + email,
	      location.protocol + location.pathname + "?email=" + email
	    );
	    onEmailChange(email);
	  }
	  e.preventDefault();
	}
	
	function onMouseMove(e) {
	  if (
	    e.target.getAttribute("data-tooltip") ||
	    (
	      !isZoomed() &&
	      e.target.parentNode.tagName === "g" &&
	      e.target.parentNode.getAttribute("data-tooltip")
	    )
	  ) {
	    let newTarget = e.target.closest("[data-tooltip]");
	
	    if (currentTooltipTarget === null || currentTooltipTarget != newTarget) {
	      if (tooltipHideId) {
	        clearTimeout(tooltipHideId);
	        tooltipHideId = null;
	      }
	
	      currentTooltipTarget = newTarget;
	
	      tooltipEl.innerHTML = currentTooltipTarget.getAttribute("data-tooltip");
	
	      let left = e.clientX - (tooltipEl.clientWidth / 2);
	      let top = e.clientY + (DETAIL_PADDING * (isZoomed() ? 3 : 1));
	      if (left < 0) {
	        left = DETAIL_PADDING;
	      } else if (left + tooltipEl.clientWidth > document.body.clientWidth) {
	        left = document.body.clientWidth - tooltipEl.clientWidth - DETAIL_PADDING;
	      }
	
	      if (top + tooltipEl.clientHeight > document.body.clientHeight) {
	        top = e.clientY - tooltipEl.clientHeight - DETAIL_PADDING;
	      }
	
	      tooltipEl.style.left = `${left}px`;
	      tooltipEl.style.top = `${top}px`;
	
	      if (
	        currentTooltipTarget.getAttribute("fill") ||
	        currentTooltipTarget.getAttribute("stroke")
	      ) {
	        tooltipEl.style.backgroundColor = (
	          currentTooltipTarget.getAttribute("fill") ||
	          currentTooltipTarget.getAttribute("stroke")
	        );
	      }
	
	      if (needWhiteText(tooltipEl.style.backgroundColor)) {
	        tooltipEl.classList.add("dark");
	      } else {
	        tooltipEl.classList.remove("dark");
	      }
	    }
	  } else {
	    currentTooltipTarget = null;
	    if (!tooltipHideId) {
	      hideTooltip();
	    }
	  }
	}
	
	function onKeyDown(e) {
	  let formMode = isFormMode();
	  let zoomed = isZoomed();
	  let {x, y, height} = svg.viewBox.baseVal;
	
	  if (e.key === "Escape" || e.code === "Escape") {
	    if (formMode && bugzillaEmail) {
	      setDashboardMode();
	    }
	    if (zoomed) {
	      zoomOut();
	    }
	    return;
	  }
	
	  if (!formMode && !zoomed && (e.key === "ArrowRight" || e.code === "ArrowRight")) {
	    if (currentYear !== (new Date()).getFullYear()) {
	      setDashboardYear(currentYear + 1);
	      return;
	    }
	  }
	
	  if (!formMode && !zoomed && (e.key === "ArrowLeft" || e.code === "ArrowLeft")) {
	    if (currentYear !== BUGZILLA_BIRTH_YEAR) {
	      setDashboardYear(currentYear - 1);
	      return;
	    }
	  }
	
	  if (!formMode && !zoomed && (e.key === "ArrowDown" || e.code === "ArrowDown")) {
	    if (isMoving) {
	      return;
	    }
	
	    if (y + height < ((lanes.length - 1) * LINE_HEIGHT)) {
	      panViewBox(x, y + height);
	      navEl.classList.add("scrolled");
	    }
	  }
	
	  if (!formMode && !zoomed && (e.key === "ArrowUp" || e.code === "ArrowUp")) {
	    if (isMoving) {
	      return;
	    }
	    if (y > 0) {
	      panViewBox(x, y - height);
	      if (y - height === 0) {
	        navEl.classList.remove("scrolled");
	      }
	    }
	  }
	}
	
	function onSvgClick(e) {
	  if (!isZoomed()) {
	    if (
	      e.target.classList.contains("bug-line") ||
	      e.target.parentElement.classList.contains("bug-line")
	    ) {
	      var el = e.target;
	      if (!el.classList.contains("bug-line")) {
	        el = e.target.parentElement;
	      }
	      if (e.ctrlKey || e.metaKey) {
	        window.open("https://bugzilla.mozilla.org/show_bug.cgi?id=" + el.getAttribute("data-bug-id"));
	      } else {
	        zoomInBug(el);
	      }
	    }
	  }
	}
	
	function setDashboardYear(year) {
	  if (isMoving) {
	    return;
	  }
	  currentYear = year;
	
	  document.querySelector("nav .year").textContent = year;
	
	  panViewBox((year - BUGZILLA_BIRTH_YEAR) * svg.viewBox.baseVal.width);
	  updateDashboardNavigation(year);
	
	  if (displayedYears.indexOf(year) === -1) {
	    displayedYears.push(year);
	    drawMonths(year);
	    drawWeeks(year);
	    fetchBugsHistoryForYear(year).catch((ex) => console.error(ex));
	  }
	}
	
	function panViewBox(toX, toY, duration) {
	  if (typeof toY === "undefined") {
	    toY = svg.viewBox.baseVal.y;
	  }
	
	  if (typeof duration === "undefined") {
	    duration = 200;
	  }
	
	  isMoving = true;
	  hideTooltip();
	  let xStart = svg.viewBox.baseVal.x;
	  let xDelta = svg.viewBox.baseVal.x - toX;
	
	  let yStart = svg.viewBox.baseVal.y;
	  let yDelta = svg.viewBox.baseVal.y - toY;
	
	  let start;
	  let pan = function (timestamp) {
	    if (!start) {
	      start = timestamp;
	    }
	
	    let t = (timestamp - start) / duration;
	    // Easing function https://gist.github.com/gre/1650294
	    t = t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
	    if (t <= 1) {
	      svg.viewBox.baseVal.x = xStart - (xDelta * t);
	      svg.viewBox.baseVal.y = yStart - (yDelta * t);
	      requestAnimationFrame(pan);
	    } else {
	      svg.viewBox.baseVal.x = toX;
	      svg.viewBox.baseVal.y = toY;
	      isMoving = false;
	    }
	  };
	  requestAnimationFrame(pan);
	}
	
	function updateDashboardNavigation(year) {
	  let previousYearButton = document.querySelector(".year-nav[data-direction=previous]");
	  let nextYearButton = document.querySelector(".year-nav[data-direction=next]");
	
	  previousYearButton.setAttribute("data-year", year - 1);
	  nextYearButton.setAttribute("data-year", year + 1);
	
	  if (year === (new Date()).getFullYear()) {
	    nextYearButton.setAttribute("disabled", true);
	    nextYearButton.setAttribute("title", "You can't go to the future, Marty");
	  } else {
	    nextYearButton.removeAttribute("disabled");
	    nextYearButton.removeAttribute("title");
	  }
	
	  if (year === BUGZILLA_BIRTH_YEAR) {
	    previousYearButton.setAttribute("disabled", true);
	    previousYearButton.setAttribute("title",
	      "You can't go further, Bugzilla did not exists before");
	  } else {
	    previousYearButton.removeAttribute("disabled");
	    previousYearButton.removeAttribute("title");
	  }
	}
	
	function fetchBugsHistoryForYear(year) {
	  document.querySelector("nav").classList.add("loading");
	  let firstMonday = getMondayOfFirstWeek(year);
	
	  let yearBugs = bugs.filter(function (x) {
	    if (x.displayed) {
	      return false;
	    }
	
	    if (!x.cf_last_resolved) {
	      return true;
	    }
	
	    if (x.status === "REOPENED") {
	      Object.assign(x, {
	        "cf_last_resolved": null
	      });
	      return true;
	    }
	
	    return (new Date(x.cf_last_resolved) >= firstMonday);
	  });
	
	  yearBugs.sort(function (a, b) {
	    // If bugs have not the same state
	    if (a.cf_last_resolved != b.cf_last_resolved) {
	      // If "a" is not resolved, a comes first
	      if (a.cf_last_resolved == null) {
	        return -1;
	      }
	
	      // If "b" is not resolved, b comes first
	      if (b.cf_last_resolved == null) {
	        return 1;
	      }
	    }
	
	    var priorityA = (PRIORITY_REGEX.test(a.priority) ? a.priority : "P3");
	    var priorityB = (PRIORITY_REGEX.test(b.priority) ? b.priority : "P3");
	    // "a" and "b" are in the same state ( both resolved, or both unresolved)
	    // we want to get the higher priority bugs first
	    if (priorityA != priorityB) {
	      return priorityA < priorityB ? -1 : 1;
	    }
	
	    // "a" and "b" are in the same state (both resolved, or both unresolved)
	    // and have the same priority
	    // We want to get the older bugs first
	    return a.creation_time < b.creation_time ? -1 : 1;
	  });
	
	  return yearBugs.reduce(function (previousBugPromise, bug, idx) {
	    return new Promise(function (resolve, reject) {
	      var historyPromise = ApiHandler.getBugHistory(bug)
	        .then(function (history) {
	          bug.history = history;
	
	          // A bug is being worked on by the user when :
	          // - he creates the bug
	          // - OR when he made a change on the bug
	          // - OR when is cc'ed on the bug
	          // - OR when is assigned on the bug
	          bug.history.some(function (activity) {
	            var hasAssignement = (activity.who === bugzillaEmail);
	            if (!hasAssignement) {
	              hasAssignement = activity.changes.some(change => (
	                change.added === bugzillaEmail && (
	                  change.field_name === "cc" ||
	                  change.field_name === "assigned_to"
	                )
	              ));
	            }
	
	            if (hasAssignement === true) {
	              bug.startDate = new Date(activity.when);
	            }
	
	            return hasAssignement;
	          });
	
	          // If the bug has no startDate, we assume it is the creation date
	          if (!bug.startDate && bug.assigned_to === bugzillaEmail) {
	            bug.startDate = new Date(bug.creation_time);
	          }
	
	          if (bug.cf_last_resolved) {
	            bug.endDate = new Date(bug.cf_last_resolved);
	          } else {
	            bug.endDate = new Date();
	          }
	
	          // If the startDate is greater than the endDate, change it to the creation date
	          if (bug.startDate > bug.endDate) {
	            bug.startDate = new Date(bug.creation_time);
	          }
	
	          // Strip every history entry that is not in the (startDate,endDate) period
	          bug.history = bug.history.filter(activity => {
	            let when = new Date(activity.when);
	            return when >= bug.startDate && when <= bug.endDate;
	          });
	
	          return Promise.resolve(bug);
	        });
	
	      var promises = [historyPromise, previousBugPromise];
	      Promise.all(promises).then(function (data) {
	        let readyBug = data[promises.indexOf(historyPromise)];
	        let i = bugs.findIndex((item) => item.id === readyBug.id);
	        if (i != -1) {
	          bugs[i] = readyBug;
	        }
	        drawBug(readyBug);
	        readyBug.displayed = true;
	        resolve();
	      });
	    });
	  }, Promise.resolve())
	  .then(function () {
	    document.querySelector("nav").classList.remove("loading");
	  })
	  .catch((e) => console.error(e));
	}
	
	function getPositionFromDate(date, period) {
	  if (period) {
	    let start = period[0];
	    let end = period[1];
	    let length = (end - start);
	    if (length === 0) {
	      let periodEnd = svg.viewBox.baseVal.x + YEAR_WIDTH - DETAIL_PADDING;
	      return periodEnd + (end - date);
	    }
	
	    let percent = (date - start) / length;
	    let periodStart = svg.viewBox.baseVal.x + DETAIL_PADDING;
	    let periodEnd = svg.viewBox.baseVal.x + YEAR_WIDTH - DETAIL_PADDING;
	    let periodLength = periodEnd - periodStart;
	
	    return periodStart + (periodLength * percent);
	  }
	
	  return (date - getMondayOfFirstWeek(BUGZILLA_BIRTH_YEAR)) / MILLISECOND_A_DAY;
	}
	
	function drawBug(bug) {
	  var strokeWidth = 2;
	  var endCircleR = 1.75;
	  var minMultiplier = 0.25;
	  var maxMultiplier = 1.75;
	
	  if (PRIORITY_REGEX.test(bug.priority)) {
	    var priorityRatio = (
	      minMultiplier + (
	        (((-1.25 / 5) * bug.priority[1]) + 1.25) * (maxMultiplier - minMultiplier)
	      )
	    );
	    strokeWidth = strokeWidth * priorityRatio;
	    endCircleR = endCircleR * priorityRatio;
	  }
	
	  var colorIndex = (bug.id % (COLORS.length - 1));
	  var bugColor = COLORS[colorIndex];
	
	  var startPoint = getPositionFromDate(bug.startDate);
	  var endPoint = getPositionFromDate(bug.endDate);
	  var laneNumber = findLane(lanes, startPoint, endPoint);
	
	  if (!lanes[laneNumber]) {
	    lanes[laneNumber] = [];
	  }
	  lanes[laneNumber].push([startPoint, endPoint]);
	  var y = (LINE_HEIGHT * 1.5) + (laneNumber * LINE_HEIGHT);
	  var title = `Bug ${bug.id}`;
	  if (PRIORITY_REGEX.test(bug.priority)) {
	    title += " [" + bug.priority + "]";
	  }
	
	  var body = bug.summary;
	  if (bug.flags.some(({name}) => name === "needinfo")) {
	    var needinfo = bug.flags
	      .filter(({name}) => name === "needinfo")
	      .map(({requestee}) => requestee);
	
	    body += "<br>Need info from : " + needinfo.join(" - ");
	  }
	  var bugGroup = createSVGElement("g", {
	    "class": "bug-line",
	    "data-bug-id": bug.id,
	    "fill": bugColor,
	    "data-tooltip": `
	      ${title}
	      <hr>
	      ${body}`
	  });
	
	  var bugAssignedLine = createSVGElement("line", {
	    "class": "assignement-line",
	    "x1": startPoint,
	    "y1": y,
	    "x2": endPoint,
	    "y2": y,
	    "stroke": bugColor,
	    "stroke-width": strokeWidth,
	    "stroke-linecap": "round"
	  });
	  bugGroup.appendChild(bugAssignedLine);
	  if (bug.cf_last_resolved) {
	    if (bug.resolution == "FIXED") {
	      var endCircle = createSVGElement("circle", {
	        "class": "terminator resolved",
	        "cx": endPoint,
	        "cy": y,
	        "r": endCircleR,
	        "fill": bugColor
	      });
	      bugGroup.appendChild(endCircle);
	    } else {
	      var lineHeight = strokeWidth * 0.9;
	      var endVerticalLine = createSVGElement("line", {
	        "class": "terminator closed",
	        "x1": endPoint + (strokeWidth / 4),
	        "y1": y - lineHeight,
	        "x2": endPoint + (strokeWidth / 4),
	        "y2": y + lineHeight,
	        "stroke": bugColor,
	        "stroke-width": strokeWidth / 2,
	      });
	      bugGroup.appendChild(endVerticalLine);
	    }
	  } else {
	    let needInfoFlags = bug.flags.filter(flag => flag.name === "needinfo");
	    if (needInfoFlags.length > 0) {
	      var olderFlag = needInfoFlags.reduce((previous, current) => {
	        if (previous === null || current.creation_date < previous.creation_date) {
	          return current;
	        }
	        return previous;
	      }, null);
	      var flagStartPoint = getPositionFromDate(new Date(olderFlag.creation_date));
	      if (flagStartPoint > endPoint - strokeWidth) {
	        flagStartPoint = endPoint - strokeWidth;
	      }
	
	      var endRect = createSVGElement("rect", {
	        "class": "terminator needinfo",
	        "x": flagStartPoint,
	        "y": y - strokeWidth,
	        "width": endPoint - flagStartPoint + (strokeWidth / 2),
	        "height": strokeWidth * 2,
	        "fill": bugColor,
	      });
	      var endRectStriped = createSVGElement("rect", {
	        "class": "terminator needinfo",
	        "x": flagStartPoint,
	        "y": y - strokeWidth,
	        "width": endPoint - flagStartPoint + (strokeWidth / 2),
	        "height": strokeWidth * 2,
	        "fill": "url(#pattern-stripe)",
	      });
	
	      bugGroup.appendChild(endRect);
	      bugGroup.appendChild(endRectStriped);
	    }
	  }
	  svg.appendChild(bugGroup);
	}
	
	function drawWeeks(year) {
	  let weekGroup = createSVGElement("g");
	  let firstDay = getMondayOfFirstWeek(year);
	  weekGroup.classList.add("weeks");
	  for (var i = 0; i <= 52; i++) {
	    let monday = new Date(firstDay.getTime() + (i * 7 * MILLISECOND_A_DAY));
	    let x = getPositionFromDate(monday);
	    let weekLine = createSVGElement("line", {
	      "x1": x,
	      "y1": 0,
	      "x2": x,
	      "y2": 10000,
	      "stroke": "rgba(0,0,0,0.3)",
	      "stroke-width": 0.1
	    });
	    weekGroup.appendChild(weekLine);
	  }
	  svg.insertBefore(weekGroup, svg.firstChild);
	}
	
	function drawMonths(year) {
	  let monthGroup = createSVGElement("g", {
	    "class": "months"
	  });
	  let monthWidth = 5;
	
	  for (var i = 0; i < 12; i++) {
	    let firstDay = new Date(year, i, 1, 0, 0, 0);
	    let x = getPositionFromDate(firstDay);
	    let monthLine = createSVGElement("line", {
	      "x1": x,
	      "y1": 0,
	      "x2": x,
	      "y2": 10000,
	      "stroke": "#FFC107",
	      "stroke-width": 0.5,
	      "stroke-opacity": 0.5
	    });
	
	    let monthText = createSVGElement("text", {
	      "x": (x + monthWidth / 2),
	      "y": (monthWidth - 1),
	      "font-size": 4,
	      "font-family": "Signika",
	      "fill": "rgba(0,0,0,0.5)",
	      "text-anchor": "middle",
	      "title": MONTHS[i]
	    });
	    monthText.innerHTML = MONTHS[i][0];
	
	    let monthRect = createSVGElement("rect", {
	      "x": x,
	      "y": 0,
	      "width": monthWidth,
	      "height": monthWidth,
	      "fill": "#FFC107"
	    });
	
	    monthGroup.appendChild(monthRect);
	    monthGroup.appendChild(monthLine);
	    monthGroup.appendChild(monthText);
	  }
	
	  svg.insertBefore(monthGroup, svg.firstChild);
	}
	
	function zoomInBug(el) {
	  isMoving = true;
	  hideTooltip();
	
	  var id = el.getAttribute("data-bug-id");
	  var bugData = bugs.find(function (item) {
	    return (item.id == id);
	  });
	  bugTitleEl.innerHTML = `<a href="https://bugzilla.mozilla.org/show_bug.cgi?id=${id}" target="blank">Bug ${id} - ${bugData.summary}</a>`;
	
	  var line = el.querySelector("line.assignement-line");
	
	  var duration = 500;
	  var x1 = parseFloat(line.getAttribute("x1"));
	  var x2 = parseFloat(line.getAttribute("x2"));
	  var y = parseFloat(line.getAttribute("y1"));
	  var strokeWidth = parseFloat(line.getAttribute("stroke-width"));
	
	  line.setAttribute("data-x1", x1);
	  line.setAttribute("data-x2", x2);
	  line.setAttribute("data-y", y);
	  line.setAttribute("data-stroke-width", strokeWidth);
	
	  let lineStart = svg.viewBox.baseVal.x + DETAIL_PADDING;
	  let lineEnd = svg.viewBox.baseVal.x + YEAR_WIDTH - DETAIL_PADDING;
	
	  var x1FromStart = x1 - lineStart;
	  var x1MoveByMs = x1FromStart / duration;
	  var x2FromStart = lineEnd - x2;
	  var x2MoveByMs = x2FromStart / duration;
	  var yFromMiddle = svg.viewBox.baseVal.y + 60 - y;
	  var yMoveByMs = yFromMiddle / duration;
	  var finalStrokeWidth = 20;
	  var strokeWidthMoveByMs = (finalStrokeWidth - strokeWidth) / duration;
	  var start = 0;
	
	  function zoom(timestamp) {
	    if (!start) {
	      start = timestamp;
	    }
	
	    var progress = timestamp - start;
	    if (progress < duration) {
	      line.setAttribute("x1", x1 - (x1MoveByMs * progress));
	      line.setAttribute("x2", x2 + (x2MoveByMs * progress));
	      line.setAttribute("y1", y + (yMoveByMs * progress));
	      line.setAttribute("y2", y + (yMoveByMs * progress));
	      line.setAttribute("stroke-width", strokeWidth + (strokeWidthMoveByMs * progress));
	      requestAnimationFrame(zoom);
	    } else {
	      line.setAttribute("x1", lineStart);
	      line.setAttribute("x2", lineEnd);
	      line.setAttribute("y1", svg.viewBox.baseVal.y + 60);
	      line.setAttribute("y2", svg.viewBox.baseVal.y + 60);
	      line.setAttribute("stroke-width", finalStrokeWidth);
	
	      drawBugDetail(el, bugData);
	      isMoving = false;
	    }
	  }
	
	  requestAnimationFrame(zoom);
	
	  document.body.classList.add("zoomed");
	  el.classList.toggle("detail");
	}
	
	function drawBugDetail(el, bugData) {
	  let bugPeriod = [bugData.startDate, bugData.endDate];
	  let y = svg.viewBox.baseVal.y + 60;
	
	  let bugGroup = createSVGElement("g", {
	    "class": "detail-bug-line"
	  });
	
	  let terminator;
	  let terminatorPosition = getPositionFromDate(bugData.endDate, bugPeriod);
	  if (bugData.cf_last_resolved) {
	    if (bugData.resolution == "FIXED") {
	      terminator = createSVGElement("circle", {
	        "cx": terminatorPosition,
	        "cy": y,
	        "r": 9,
	        "fill": "rgba(0,0,0,0.3)",
	        "data-tooltip": `RESOLVED ${bugData.cf_last_resolved}`
	      });
	    } else {
	      terminator = createSVGElement("line", {
	        "class": "terminator",
	        "x1": terminatorPosition,
	        "x2": terminatorPosition,
	        "y1": y - 9,
	        "y2": y + 9,
	        "stroke": "rgba(0,0,0,0.3)",
	        "stroke-width": 2,
	        "data-tooltip": `CLOSED ${bugData.cf_last_resolved}`
	      });
	    }
	  }
	
	  if (terminator) {
	    bugGroup.appendChild(terminator);
	  }
	
	  let bugLine = createSVGElement("line", {
	    "x1": getPositionFromDate(new Date(bugData.creation_time), bugPeriod),
	    "y1": y,
	    "x2": getPositionFromDate(bugData.endDate, bugPeriod),
	    "y2": y,
	    "stroke": "rgba(0,0,0,1)",
	    "stroke-width": 2,
	    "stroke-linecap": "round"
	  });
	  bugGroup.appendChild(bugLine);
	
	  let groups = [];
	  let historyEntries = [];
	  bugData.history.forEach(function (entry) {
	    if (!userColor[entry.who]) {
	      if (USERS_COLORS.length === 0) {
	        USERS_COLORS = COLORS.map((x) => x);
	      }
	      userColor[entry.who] = USERS_COLORS.shift();
	    }
	    let entryColor = userColor[entry.who];
	
	    let entryTitleList = document.createElement("ul");
	    entry.changes.sort(function (a, b) {
	      if (a.added == "" && a.added === b.added) {
	        return 0;
	      }
	      return a.added !== 0 ? -1 : 0;
	    });
	
	    entry.changes.forEach(function (change) {
	      let li = document.createElement("li");
	      li.innerHTML = change.field_name + " " + (
	        change.removed !== "" ? `<span class="removed">${change.removed}</span>` : ""
	      ) + (
	        change.added !== "" ? " ➜ " + change.added : ""
	      ) + " ";
	      entryTitleList.appendChild(li);
	    });
	    let entryTitle = `${entry.when} - ${entry.who}<hr>${entryTitleList.outerHTML}`;
	
	    historyEntries.push({
	      x: getPositionFromDate(new Date(entry.when), bugPeriod),
	      title: entryTitle,
	      color: entryColor,
	      mine: entry.who === bugzillaEmail
	    });
	  });
	
	  historyEntries.sort(function (a, b) {
	    return a.x > b.x ? 1 : -1;
	  });
	  historyEntries.reduce(function (previousValue, currentValue, currentIndex, array) {
	    if (groups.length > 0 && previousValue && currentValue.x - previousValue.x < 10) {
	      groups[groups.length - 1].push(currentValue);
	    } else {
	      groups.push([currentValue]);
	    }
	    return currentValue;
	  }, null);
	
	  var circleR = 10;
	
	  groups.forEach(function (group, index) {
	    var groupGroup = createSVGElement("g");
	
	    var x1 = group[0].x;
	    var x2 = group[group.length - 1].x;
	
	    var groupLine = createSVGElement("line", {
	      "x1": x1,
	      "x2": x2,
	      "y1": y,
	      "y2": y,
	      "stroke": "rgba(0,0,0,1)",
	      "stroke-width": 12,
	      "stroke-linecap": "round"
	    });
	    groupGroup.appendChild(groupLine);
	
	    var clipId = "group-" + index;
	    var groupClipath = createSVGElement("clipPath", {
	      "id": clipId
	    });
	
	    var startCircleClip = createSVGElement("circle", {
	      "cx": x1,
	      "cy": y,
	      "r": (circleR / 2)
	    });
	
	    var endCircleClip = createSVGElement("circle", {
	      "cx": x2,
	      "cy": y,
	      "r": (circleR / 2)
	    });
	
	    var rectClip = createSVGElement("rect", {
	      "x": x1,
	      "y": (y - (circleR / 2)),
	      "height": circleR,
	      "width": (x2 - x1)
	    });
	
	    groupClipath.appendChild(startCircleClip);
	    groupClipath.appendChild(endCircleClip);
	    groupClipath.appendChild(rectClip);
	
	    groupGroup.appendChild(groupClipath);
	
	    let stroke = 0.5;
	
	    var groupStart = x1 - (circleR / 2) - stroke;
	    var groupEnd = x2 + (circleR / 2) + stroke;
	    var entryWidth = (groupEnd - groupStart) / group.length;
	    group.forEach(function (groupEntry, idx) {
	      var entryRect = createSVGElement("rect", {
	        "x": groupStart + (entryWidth * idx),
	        "width": entryWidth,
	        "fill": groupEntry.color,
	        "stroke": "black",
	        "data-tooltip": groupEntry.title,
	        "y": y - circleR,
	        "height": circleR * 2,
	        "stroke-width": stroke,
	        "clip-path": `url(#${clipId})`
	      });
	      groupGroup.appendChild(entryRect);
	    });
	
	    bugGroup.appendChild(groupGroup);
	  });
	
	  el.appendChild(bugGroup);
	
	  let daysOfAssignement = (
	    (
	      bugData.endDate.getTime() - bugData.startDate.getTime()
	    ) / MILLISECOND_A_DAY
	  );
	
	  let yearHorizontalLine = createSVGElement("line", {
	    "x1": svg.viewBox.baseVal.x,
	    "x2": svg.viewBox.baseVal.x + svg.viewBox.baseVal.width,
	    "y1": y - 50,
	    "y2": y - 50,
	    "stroke": "black",
	    "stroke-opacity": 0.4,
	    "stroke-width": 0.2
	  });
	  bugGroup.insertBefore(yearHorizontalLine, bugGroup.firstChild);
	
	  let monthHorizontalLine = createSVGElement("line", {
	    "x1": svg.viewBox.baseVal.x,
	    "x2": svg.viewBox.baseVal.x + svg.viewBox.baseVal.width,
	    "y1": y - 40,
	    "y2": y - 40,
	    "stroke": "black",
	    "stroke-opacity": 0.4,
	    "stroke-width": 0.2
	  });
	  bugGroup.insertBefore(monthHorizontalLine, bugGroup.firstChild);
	
	  if (daysOfAssignement < 45) {
	    let dayHorizontalLine = createSVGElement("line", {
	      "x1": svg.viewBox.baseVal.x,
	      "x2": svg.viewBox.baseVal.x + svg.viewBox.baseVal.width,
	      "y1": y - 30,
	      "y2": y - 30,
	      "stroke": "black",
	      "stroke-opacity": 0.4,
	      "stroke-width": 0.2
	    });
	    bugGroup.insertBefore(dayHorizontalLine, bugGroup.firstChild);
	
	    let pos;
	    for (let i = 0; i <= daysOfAssignement + 2; i++) {
	      let day = new Date(bugData.startDate.getTime() + (i * MILLISECOND_A_DAY));
	      day.setHours(0, 0, 0);
	      pos = getPositionFromDate(day, bugPeriod);
	      var dayLine = createSVGElement("line", {
	        "x1": pos,
	        "y1": y - 40,
	        "x2": pos,
	        "y2": y + circleR,
	        "stroke": "black",
	        "stroke-opacity": 0.1,
	        "stroke-width": .5
	      });
	      bugGroup.insertBefore(dayLine, bugGroup.firstChild);
	
	      if (pos && pos < svg.viewBox.baseVal.x) {
	        pos = svg.viewBox.baseVal.x;
	      }
	      var dayText = createSVGElement("text", {
	        "x": (pos + 1),
	        "y": (y - 40 + 8),
	        "font-size": 8,
	        "font-family": "Signika",
	        "fill": "#666"
	      });
	      dayText.textContent = day.getDate();
	
	      let tomorrow = new Date(day.getTime() + MILLISECOND_A_DAY);
	      let nextPos = getPositionFromDate(tomorrow, bugPeriod);
	      if (nextPos < svg.viewBox.baseVal.x) {
	        nextPos = svg.viewBox.baseVal.x;
	      }
	
	      if (nextPos - pos > 10) {
	        bugGroup.insertBefore(dayText, bugGroup.firstChild);
	      }
	    }
	  }
	
	  let monthsAssigned = Math.ceil(
	    (
	      bugData.endDate.getTime() - bugData.startDate.getTime()
	    ) / MILLISECOND_A_DAY / 30
	  );
	
	  if (monthsAssigned < 36) {
	    let firstDayOfMonth = new Date(
	      bugData.startDate.getFullYear(),
	      bugData.startDate.getMonth(),
	      1
	    );
	    for (let i = 0; i <= monthsAssigned; i++) {
	      firstDayOfMonth.setHours(0, 0, 0);
	      let pos = getPositionFromDate(firstDayOfMonth, bugPeriod);
	      var monthLine = createSVGElement("line", {
	        "x1": pos,
	        "y1": y - 50,
	        "x2": pos,
	        "y2": y + circleR,
	        "stroke": "black",
	        "stroke-opacity": 0.1,
	        "stroke-width": .5,
	      });
	      bugGroup.insertBefore(monthLine, bugGroup.firstChild);
	
	      if (pos < svg.viewBox.baseVal.x) {
	        pos = svg.viewBox.baseVal.x;
	      }
	
	      var monthText = createSVGElement("text", {
	        "x": pos + 1,
	        "y": y - 50 + 8,
	        "font-size": 8,
	        "font-family": "Signika",
	        "fill": "#666"
	      });
	
	      let monthNumber = firstDayOfMonth.getMonth();
	      if (monthsAssigned < 9) {
	        monthText.textContent = MONTHS[monthNumber];
	      } else {
	        monthText.textContent = (monthNumber < 9 ? "0" : "") + (monthNumber + 1);
	      }
	
	      bugGroup.insertBefore(monthText, bugGroup.firstChild);
	
	      let nextMonth = firstDayOfMonth.getMonth() + 1;
	      firstDayOfMonth.setMonth(nextMonth);
	      if (nextMonth === 0) {
	        firstDayOfMonth.setFullYear(firstDayOfMonth.getFullYear() + 1);
	      }
	    }
	  }
	
	  let startYear = bugData.startDate.getFullYear();
	  let endYear = bugData.endDate.getFullYear();
	  for (var i = 0; i <= endYear - startYear; i++) {
	    let firstDayOfYear = new Date(startYear + i, 0, 1);
	    firstDayOfYear.setHours(0, 0, 0);
	
	    var pos = getPositionFromDate(firstDayOfYear, bugPeriod);
	    var yearLine = createSVGElement("line", {
	      "x1": pos,
	      "y1": y - 60,
	      "x2": pos,
	      "y2": y + circleR,
	      "stroke": "black",
	      "stroke-opacity": 0.1,
	      "stroke-width": .5
	    });
	    bugGroup.insertBefore(yearLine, bugGroup.firstChild);
	
	    if (pos < svg.viewBox.baseVal.x) {
	      pos = svg.viewBox.baseVal.x;
	    }
	    var yearText = createSVGElement("text", {
	      "x": pos + 1,
	      "y": y - 60 + 8,
	      "font-size": 8,
	      "font-family": "Signika",
	      "fill": "#666"
	    });
	    yearText.textContent = startYear + i;
	    bugGroup.insertBefore(yearText, bugGroup.firstChild);
	  }
	}
	
	function zoomOut() {
	  hideTooltip();
	  var zoomedEl = document.querySelector(".detail");
	  if (zoomedEl) {
	    var detail = zoomedEl.querySelector(".detail-bug-line");
	    if (detail) {
	      detail.remove();
	    }
	
	    var line = zoomedEl.querySelector("line.assignement-line");
	    var duration = 500;
	    var x1 = parseFloat(line.getAttribute("x1"));
	    var x2 = parseFloat(line.getAttribute("x2"));
	    var y = parseFloat(line.getAttribute("y1"));
	    var strokeWidth = parseFloat(line.getAttribute("stroke-width"));
	
	    var initialX1 = parseFloat(line.getAttribute("data-x1"));
	    var initialX2 = parseFloat(line.getAttribute("data-x2"));
	    var initialY = parseFloat(line.getAttribute("data-y"));
	    var initialStrokeWidth = parseFloat(line.getAttribute("data-stroke-width"));
	
	    var x1Move = x1 - initialX1;
	    var x1MoveByMs = x1Move / duration;
	    var x2Move = x2 - initialX2;
	    var x2MoveByMs = x2Move / duration;
	    var yMove = y - initialY;
	    var yMoveByMs = yMove / duration;
	    var strokeWidthMoveByMs = (strokeWidth - initialStrokeWidth) / duration;
	    var start = 0;
	    let frameZoomOut = function (timestamp) {
	      if (!start) {
	        start = timestamp;
	      }
	      var progress = timestamp - start;
	      if (progress < duration) {
	        line.setAttribute("x1", x1 - (x1MoveByMs * progress));
	        line.setAttribute("x2", x2 - (x2MoveByMs * progress));
	        line.setAttribute("y1", y - (yMoveByMs * progress));
	        line.setAttribute("y2", y - (yMoveByMs * progress));
	        line.setAttribute("stroke-width", strokeWidth - (strokeWidthMoveByMs * progress));
	        requestAnimationFrame(frameZoomOut);
	      } else {
	        line.setAttribute("x1", initialX1);
	        line.setAttribute("x2", initialX2);
	        line.setAttribute("y1", initialY);
	        line.setAttribute("y2", initialY);
	        line.setAttribute("stroke-width", initialStrokeWidth);
	        document.querySelector(".bug-title").innerHTML = currentYear;
	        zoomedEl.classList.remove("detail");
	        document.body.classList.remove("zoomed");
	      }
	    };
	    requestAnimationFrame(frameZoomOut);
	  }
	}
	
	var USERS_COLORS = COLORS.map((x) => x);
	
	var lanes = [];
	var bugs = [];
	var displayedYears = [];
	var bugzillaEmail = null;
	
	let userColor = {};
	
	let currentYear = (new Date()).getFullYear();
	let isMoving = false;
	
	let svg = document.querySelector("svg");
	
	let formSection = document.querySelector("section.form");
	let form = formSection.querySelector("form");
	let emailInput = form.querySelector("input[name=email]");
	let dashboardSection = document.querySelector("section.dashboard");
	let bugTitleEl = document.querySelector(".bug-title");
	let navEl = document.querySelector("nav");
	
	let currentTooltipTarget;
	let tooltipEl = document.createElement("div");
	tooltipEl.classList.add("tooltip");
	document.body.appendChild(tooltipEl);
	let tooltipHideId;
	
	const YEAR_WIDTH = svg.viewBox.baseVal.width;
	
	init();


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(2);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(4)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../node_modules/css-loader/index.js!!./reset.css", function() {
				var newContent = require("!!./../node_modules/css-loader/index.js!!./reset.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(3)();
	// imports
	
	
	// module
	exports.push([module.id, "html,body,div,span,applet,object,iframe,h1,h2,h3,h4,h5,h6,p,blockquote,pre,a,abbr,acronym,address,big,cite,code,del,dfn,em,img,ins,kbd,q,s,samp,small,strike,strong,sub,sup,tt,var,b,u,i,center,dl,dt,dd,ol,ul,li,fieldset,form,label,legend,table,caption,tbody,tfoot,thead,tr,th,td,article,aside,canvas,details,embed,figure,figcaption,footer,header,hgroup,menu,nav,output,ruby,section,summary,time,mark,audio,video{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section{display:block}body{line-height:1}ol,ul{list-style:none}blockquote,q{quotes:none}blockquote:before,blockquote:after,q:before,q:after{content:'';content:none}table{border-collapse:collapse;border-spacing:0}\n", ""]);
	
	// exports


/***/ },
/* 3 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];
	
		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};
	
		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];
	
	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}
	
		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();
	
		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";
	
		var styles = listToStyles(list);
		addStylesToDom(styles, options);
	
		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}
	
	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}
	
	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}
	
	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}
	
	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}
	
	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}
	
	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}
	
	function addStyle(obj, options) {
		var styleElement, update, remove;
	
		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}
	
		update(obj);
	
		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}
	
	var replaceText = (function () {
		var textStore = [];
	
		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();
	
	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;
	
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}
	
	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
	
		if(media) {
			styleElement.setAttribute("media", media)
		}
	
		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}
	
	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;
	
		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}
	
		var blob = new Blob([css], { type: "text/css" });
	
		var oldSrc = linkElement.href;
	
		linkElement.href = URL.createObjectURL(blob);
	
		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(6);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(4)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../node_modules/css-loader/index.js!!./style.css", function() {
				var newContent = require("!!./../node_modules/css-loader/index.js!!./style.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(3)();
	// imports
	exports.push([module.id, "@import url(https://fonts.googleapis.com/css?family=Libre+Baskerville:400italic);", ""]);
	exports.push([module.id, "@import url(https://fonts.googleapis.com/css?family=Signika:400,700);", ""]);
	
	// module
	exports.push([module.id, "* {\n  box-sizing: border-box;\n}\n\nhtml, body {\n  width: 100%;\n  max-width: 100%;\n  height: 100vh;\n  display: flex;\n  flex-direction: column;\n}\n\nbody section.hidden {\n  display: none;\n}\n\nhr {\n  border: 1px solid rgba(0,0,0,0.5);\n}\n\nheader {\n  text-align: center;\n  background-color: #1976D2;\n  color: #FFF;\n}\n\nheader h1 {\n  padding: 0.25em 0 0.1em 0;\n  font-size: 2.5em;\n  line-height: 1.5em;\n  text-align: center;\n  background-color: #1976D2;\n  color: #FFF;\n  font-family: 'Signika';\n  font-weight: 700;\n  font-variant-numeric: oldstyle-nums;\n}\n\nheader p {\n  padding: 0.25em 0;\n}\n\nheader p span {\n  color: rgba(255,255,255,0.8)  ;\n  font-family: 'Libre Baskerville', serif;\n}\n\n.edit-email {\n  background: url(" + __webpack_require__(7) + ") no-repeat;\n  border: none;\n  background-position: 0 0;\n  background-size: 75%;\n}\n\n\nheader p span:empty, header p span:empty + button {\n  display: none;\n}\n\nsection {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n}\n\nsection.form {\n  color: #212121;\n  background-color: #FFC107;\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  align-items: center;\n}\n\nsection.form form label {\n  display: flex;\n  flex-direction: column;\n}\n\nsection.form form label span {\n  display: block;\n  font-family: 'Libre Baskerville', serif;\n  margin: 0.5em;\n  font-size: 1.5em;\n  color: rgba(0,0,0,0.7);\n  text-align: center;\n}\n\nsection.form form input {\n  font-family: 'Libre Baskerville', serif;\n  padding: 0.5em;\n  font-size: 1.5em;\n  width: 80vw;\n  max-width: 600px;\n  color: rgba(0,0,0,0.7);\n  text-align: center;\n}\n\nsection.form form button {\n  margin-top: 0.5em;\n  padding: 0.5em 0.2em;\n  font-size: 1.5em;\n  text-align: center;\n  font-family: 'Signika';\n  font-weight: 700;\n  width: 100%;\n  background-color: #E91E63;\n  border: .2em solid #C2185B;\n  color: white;\n}\n\nnav {\n  font-size: 0.9em;\n  font-family: sans;\n  color: #212121;\n  background-color: #FFC107;\n  display: flex;\n  min-height: 4em;\n  justify-content: center;\n  align-items: center;\n}\n\nbody:not(.zoomed) nav.scrolled {\n  box-shadow: 0 5px 1em rgba(0,0,0,0.5);\n}\n\nnav.loading {\n  background: linear-gradient(to right, #FFC107,#673AB7, #E91E63, #F44336, #FF9800, #FFC107);\n  animation: 2s linear bg-move infinite;\n  background-size: 600% 600%;\n}\n\nnav.loading .year {\n  opacity: 0.5;\n  color: white;\n}\n\nnav .year {\n  display: block;\n  text-align: center;\n  padding: 0 0.5em;\n  color: rgba(0,0,0,0.8);\n  font-family: 'Signika', serif;\n  font-weight: 700;\n  font-size: 2em;\n  flex: 1;\n  transition: 0.5s opacity;\n}\n\nnav .year-nav {\n  --color: rgba(0,0,0,.7);\n  background : none;\n  color: var(--color);\n  border: 2px solid;\n  border: 2px solid var(--color);\n  font-size: 1em;\n  font-family: 'Signika', serif;\n  font-weight: 700;\n  margin: 0 0.5em;\n  padding: 0.2em;\n}\n\nnav .year-nav[data-direction=\"previous\"]::before{\n  content: \"< \" attr(data-year);\n}\nnav .year-nav[data-direction=\"next\"]::after{\n  content: attr(data-year) \" >\";\n}\n\nnav .year-nav[disabled]{\n  --color: rgba(0,0,0,0.4);\n}\n\nnav .bug-title {\n  font-family: 'Libre Baskerville', serif;\n  text-align: center;\n  display: none;\n  line-height: 1.3em;\n  font-size: 1.2em;\n  flex: 1;\n  color: rgba(0,0,0,0.8);\n}\n\nnav .bug-title a {\n  color: rgba(0,0,0,0.8);\n}\n\n.zoomed nav .bug-title {\n  display: block;\n}\n\n.zoomed svg .weeks {\n  display: none;\n}\n\nnav #esc {\n  display: none;\n  font-size: 1.5em;\n  border: none;\n  background : none;\n  margin-right: auto;\n}\n\n.zoomed #esc {\n  display: block;\n}\n\nfooter {\n  background-color: #212121;\n  color: white;\n  padding: 1em;\n  font-family: 'Libre Baskerville', serif;\n  margin-top: auto;\n}\nfooter p {\n  text-align: center;\n}\nfooter p + p{\n  margin-top: 1.2em;\n}\nfooter a {\n  color: #BBDEFB;\n}\n\nsvg {\n  flex: 1;\n}\n\n.zoomed nav .year,\n.zoomed .year-nav,\n.zoomed .months {\n  display: none;\n}\n.zoomed .bug-line:not(.detail){\n  display: none;\n}\n.bug-line.detail .terminator {\n  display:none;\n}\n\n.bug-line {\n  cursor: pointer;\n  animation: .5s linear appears;\n}\n\n.tooltip {\n  position: fixed;\n  left: -9999px;\n  top: 0;\n  padding: 1em;\n  font-family: 'Signika';\n  font-weight: 400;\n  max-width: 400px;\n  width: 300px;\n  min-width: 200px;\n  background-color: #1976D2;\n  color: black;\n  text-align: center;\n  word-wrap: break-word;\n}\n\n.tooltip.dark {\n  color: white;\n}\n\n.tooltip.dark hr {\n  border-color: white;\n}\n\n.removed {\n  text-decoration: line-through;\n}\n\n@keyframes appears {\n  0% {\n    opacity: 0;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n\n@keyframes bg-move {\n  0%{background-position:100% 50%;}\n  100%{background-position:-100% 50%;}\n}\n", ""]);
	
	// exports


/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1.1\" x=\"0px\" y=\"0px\" viewBox=\"0 0 100 100\" style=\"enable-background:new 0 0 100 100;\" xml:space=\"preserve\"><g><g><polygon points=\"0,99.937 28.262,92.363 7.685,71.785\" fill=\"rgba(255,255,255,0.4\"></polygon></g><g><rect x=\"10.61\" y=\"37.063\" fill=\"rgba(255,255,255,0.4\" transform=\"matrix(-0.707 0.7072 -0.7072 -0.707 119.1844 53.8499)\" width=\"75.655\" height=\"29.1\"></rect></g><g><path d=\"M89.589,31.032l9.055-9.052c1.809-1.812,1.809-4.773,0-6.587L84.652,1.403c-1.81-1.809-4.773-1.809-6.591,0l-9.047,9.058 L89.589,31.032z\" fill=\"rgba(255,255,255,0.4\"></path></g></g></svg>"

/***/ },
/* 8 */
/***/ function(module, exports) {

	const constants = {
	  LS_KEY_EMAIL: "bugzilla-email",
	  X_PADDING: 0,
	  LINE_HEIGHT: 7.5,
	  DETAIL_PADDING: 15,
	  MONDAY_INDEX: 1,
	  MILLISECOND_A_DAY: (1000 * 60 * 60 * 24),
	  BUGZILLA_BIRTH_YEAR: 1998,
	  MONTHS: [
	    "January",
	    "February",
	    "March",
	    "April",
	    "May",
	    "June",
	    "July",
	    "August",
	    "September",
	    "October",
	    "November",
	    "December"
	  ],
	  COLORS: [
	    "rgb(244, 67, 54)",
	    "rgb(0, 150, 136)",
	    "rgb(96, 125, 139)",
	    "rgb(156, 39, 176)",
	    "rgb(103, 58, 183)",
	    "rgb(63, 81, 181)",
	    "rgb(33, 150, 243)",
	    "rgb(3, 169, 244)",
	    "rgb(0, 188, 212)",
	    "rgb(76, 175, 80)",
	    "rgb(139, 195, 74)",
	    "rgb(255, 193, 7)",
	    "rgb(255, 152, 0)",
	    "rgb(255, 87, 34)",
	    "rgb(233, 30, 99)",
	    "rgb(121, 85, 72)"
	  ],
	  PRIORITY_REGEX: /^P[1-5]$/
	};
	
	module.exports = Object.assign({}, constants);


/***/ },
/* 9 */
/***/ function(module, exports) {

	const BUGZILLA_API_URL = "https://bugzilla.mozilla.org/rest/";
	
	let ApiHandler = {
	  getUserBugs: function (email) {
	    let fields = [
	      "id",
	      "summary",
	      "status",
	      "cf_last_resolved",
	      "target_milestone",
	      "creation_time",
	      "resolution",
	      "assigned_to",
	      "creator",
	      "priority",
	      "flags",
	    ];
	    let params = {
	      "include_fields": fields.join(","),
	      "email1": email,
	      "emailassigned_to1": 1
	    };
	    let searchParams;
	    if (window.URLSearchParams) {
	      searchParams = new URLSearchParams();
	
	      Object.keys(params).forEach(function (key) {
	        searchParams.append(key, params[key]);
	      });
	      searchParams = searchParams.toString();
	    } else {
	      searchParams = [];
	      Object.keys(params).forEach(function (key) {
	        searchParams.push(key + "=" + params[key]);
	      });
	      searchParams = searchParams.join("&");
	    }
	
	    let url = `${BUGZILLA_API_URL}bug?${searchParams}`;
	    let myHeaders = new Headers();
	    myHeaders.append("Accept", "application/json");
	
	    return fetch(url, {
	      mode: "cors",
	      method: "GET",
	      headers: myHeaders
	    })
	    .then((response) => response.json());
	  },
	  getBugHistory: function (bugData) {
	    let myHeaders = new Headers();
	    myHeaders.append("Accept", "application/json");
	    var url = `${BUGZILLA_API_URL}bug/${bugData.id}/history`;
	    return fetch(url, {
	      mode: "cors",
	      method: "GET",
	      headers: myHeaders
	    })
	    .then((response) => response.json())
	    .then(function (data) {
	      let history = data.bugs[0].history;
	      history.unshift({
	        who: bugData.creator,
	        when: bugData.creation_time,
	        changes: [{
	          "field_name": "Creation",
	          removed: "",
	          added: ""
	        }]
	      });
	      return history;
	    });
	  }
	};
	
	module.exports.ApiHandler = ApiHandler;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	const {MONDAY_INDEX, MILLISECOND_A_DAY} = __webpack_require__(8);
	
	function needWhiteText(rgb) {
	  let values = rgb.replace("rgb(", "").replace(")", "").replace(" ", "").split(",");
	  let [r, g, b] = values.map(value => parseInt(value, 10));
	
	  let yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
	  return (yiq < 120);
	}
	
	function getMondayOfFirstWeek(year) {
	  // First week of the year is the week where is January 4th
	  let currentYearJan4 = new Date(`${year}-01-04`);
	  return new Date(
	    currentYearJan4.getTime() -
	    ((currentYearJan4.getDay() - MONDAY_INDEX) * MILLISECOND_A_DAY)
	  );
	}
	
	function findLane(lanes, unpositionnedBugStart, unpositionnedBugEnd) {
	  if (lanes.length === 0) {
	    return 0;
	  }
	
	  let safeSpace = 5;
	  unpositionnedBugStart = unpositionnedBugStart - safeSpace;
	  unpositionnedBugEnd = unpositionnedBugEnd + safeSpace;
	
	  let laneNumber = 0;
	  let laneFound = lanes.some(function (lane, index) {
	    laneNumber = index;
	    // In order to fit in a lane, the bug must not overlap any
	    // bug in the lane.
	    // A bug a does not overlap a bug b if:
	    // - "a" ends before "b" starts
	    // - "a" starts after "b" ends
	    let fit = lane.every(function ([bugStart, bugEnd]) {
	      return (unpositionnedBugEnd < bugStart || unpositionnedBugStart > bugEnd);
	    });
	    // if the bug fits the lane, we can exit the loop
	    return fit;
	  });
	
	  if (laneFound) {
	    return laneNumber;
	  }
	
	  return ++laneNumber;
	}
	
	function createSVGElement(tagName, attributes, content) {
	  let el = document.createElementNS("http://www.w3.org/2000/svg", tagName);
	  for (let key in attributes) {
	    el.setAttribute(key, attributes[key]);
	  }
	  if (content) {
	    el.innerHTML = content;
	  }
	  return el;
	}
	
	module.exports.needWhiteText = needWhiteText;
	module.exports.getMondayOfFirstWeek = getMondayOfFirstWeek;
	module.exports.findLane = findLane;
	module.exports.createSVGElement = createSVGElement;


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map