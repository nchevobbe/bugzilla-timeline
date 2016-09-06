const {MONDAY_INDEX, MILLISECOND_A_DAY} = require("./constants");

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
