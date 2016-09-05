"use strict";

const {MONDAY_INDEX, MILLISECOND_A_DAY} = require("./constants");

function needWhiteText(rgb){
  let values = rgb.replace("rgb(","").replace(")","").replace(" ","").split(",");

  var r = parseInt(values[0],10);
  var g = parseInt(values[1],10);
  var b = parseInt(values[2],10);
  var yiq = ((r*299)+(g*587)+(b*114))/1000;
  return (yiq < 120);
}

function getMondayOfFirstWeek(year){
  // First week of the year is the week where is January 4th
  let currentYearJan4 = new Date(`${year}-01-04`);
  return new Date(currentYearJan4.getTime() - ((currentYearJan4.getDay() - MONDAY_INDEX) * MILLISECOND_A_DAY));
}

function findLane(lanes, start, end){
  var lane = 0;
  var safe_space = 5;
  start = start - safe_space;
  end = end + safe_space;
  for(;lane < lanes.length;lane++){
    var fit = lanes[lane].every(function(xs){
      return !(
        ( xs[0] >= start && xs[0] <= end ) ||
        ( start >= xs[0] && start <= xs[1] )
      );
    });
    if(fit === true){
      break;
    }
  }
  return lane;
}

function createSVGElement(tagName, attributes, content){
  let el = document.createElementNS("http://www.w3.org/2000/svg", tagName);
  for(let key in attributes){
    el.setAttribute(key, attributes[key])
  }
  if(content) {
    el.innerHTML = content;
  }
  return el;
}

module.exports.needWhiteText = needWhiteText;
module.exports.getMondayOfFirstWeek = getMondayOfFirstWeek;
module.exports.findLane = findLane;
module.exports.createSVGElement = createSVGElement;
