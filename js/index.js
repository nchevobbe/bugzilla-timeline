"use strict";

function init(){
  addListeners();
  let email = getEmail();

  if(email !== null){
    onEmailChange(email);
  } else {
    setFormMode();
  }
}

function onEmailChange(email){
  setDashboardMode();
  if(email !== bugzillaEmail){

    if(isZoomed()){
      zoomOut();
    }

    bugzillaEmail = email;
    document.querySelector('.email').textContent = email;
    emailInput.value = email;
    setDashboardYear((new Date()).getFullYear(), true);
  }
}

function setDashboardMode(){
  formSection.classList.add('hidden');
  dashboardSection.classList.remove('hidden');
}

function setFormMode(){
  dashboardSection.classList.add('hidden');
  formSection.classList.remove('hidden');
  emailInput.focus();
  emailInput.select();
}

function isFormMode(){
  return !formSection.classList.contains('hidden')
}

function isZoomed(){
  return document.body.classList.contains('zoomed');
}

function getEmail(){
  let urlParamEmail;
  if(window.URLSearchParams){
    urlParamEmail = new URLSearchParams(location.search.substr(1)).get('email');
  } else {
    let fields = location.search.substring(1).split("&");
    let fieldMap = {};
    fields.forEach(function(item){
      let splits = item.split("=");
      fieldMap[splits[0]] = splits[1];
    });
    if(fieldMap.email){
      urlParamEmail = decodeURIComponent(fieldMap.email);
    }
  }


  if(urlParamEmail){
    return urlParamEmail;
  }

  let lsEmail = localStorage.getItem(LS_KEY_EMAIL);
  if(lsEmail !== null){
    return lsEmail;
  }

  return null;
}

function hideTooltip(){
  if(tooltipEl.innerHTML === ""){
    return;
  }
  tooltipHideId = setTimeout(function(){
    tooltipHideId = null;
    tooltipEl.style.left = `-9999px`;
    tooltipEl.style.top = `0`;
    tooltipEl.style.backgroundColor = "";
    tooltipEl.textContent = "";
  },200);
  return tooltipHideId;
}

function addListeners(){

  document.addEventListener('keydown', onKeyDown);
  form.addEventListener("submit",onFormSubmit, false);
  svg.addEventListener('click',onSvgClick, false);
  svg.addEventListener('mousemove', onMouseMove, false);

  document.querySelector('.edit-email').addEventListener("click", setFormMode);
  document.getElementById('esc').addEventListener('click', zoomOut);

  Array.from(document.querySelectorAll('.year-nav')).forEach(function(btn){
    btn.addEventListener("click", function(){
      let newYear = parseInt(btn.getAttribute("data-year"));
      setDashboardYear(newYear);
    })
  });
}

function onFormSubmit(e){
  let data = new FormData(e.target);
  let email = data.get('email')
  if(email){
    localStorage.setItem(LS_KEY_EMAIL, email);
    history.pushState({}, 'Bugzilla Dashboard for ' + email, location.protocol + location.pathname + '?email=' + email);
    onEmailChange(email);
  }
  e.preventDefault();
}

function onMouseMove(e){
  if(
    e.target.getAttribute('data-tooltip') ||
    (
      !isZoomed() &&
      e.target.parentNode.tagName === 'g' &&
      e.target.parentNode.getAttribute('data-tooltip')
    )
  ){
    let newTarget = e.target.getAttribute('data-tooltip')?e.target:e.target.parentNode;

    if(currentTooltipTarget === null || currentTooltipTarget != newTarget){
      if(tooltipHideId){
        clearTimeout(tooltipHideId);
        tooltipHideId = null;
      }

      currentTooltipTarget = newTarget;

      tooltipEl.innerHTML = e.target.getAttribute('data-tooltip') || e.target.parentNode.getAttribute('data-tooltip');

      let left = e.clientX - (tooltipEl.clientWidth / 2);
      let top = e.clientY + (DETAIL_PADDING * (isZoomed()?3:1));
      if(left < 0){
        left = DETAIL_PADDING;
      } else if(left + tooltipEl.clientWidth > document.body.clientWidth){
        left = document.body.clientWidth - tooltipEl.clientWidth - DETAIL_PADDING;
      }

      if(top + tooltipEl.clientHeight > document.body.clientHeight){
        top = e.clientY - tooltipEl.clientHeight - DETAIL_PADDING;
      }

      tooltipEl.style.left = `${left}px`;
      tooltipEl.style.top = `${top}px`;
      if(e.target.getAttribute('stroke')){
        tooltipEl.style.backgroundColor = e.target.getAttribute('stroke');
      }
      if(e.target.getAttribute('fill')){
        tooltipEl.style.backgroundColor = e.target.getAttribute('fill');
      }
    }
  } else {
    currentTooltipTarget = null;
    if(!tooltipHideId){
      hideTooltip();
    }
  }
}

function onKeyDown(e){
  let formMode = isFormMode();
  let zoomed = isZoomed();

  if(e.key === 'Escape' || e.code === 'Escape'){
    if(formMode && bugzillaEmail){
      setDashboardMode();
    }
    if(zoomed) {
      zoomOut();
    }
    return;
  }

  if(!formMode && !zoomed && (e.key === 'ArrowRight' || e.code === 'ArrowRight')){
    if(currentYear !== (new Date()).getFullYear()){
      setDashboardYear(currentYear + 1);
      return;
    }
  }

  if(!formMode && !zoomed && (e.key === 'ArrowLeft' || e.code === 'ArrowLeft')){
    if(currentYear !== BUGZILLA_BIRTH_YEAR){
     setDashboardYear(currentYear - 1);
     return;
    }
  }

  if(!formMode && !zoomed && (e.key === 'ArrowDown' || e.code === 'ArrowDown')){
    if(isMoving){
      return;
    }
    if(svg.viewBox.baseVal.y + svg.viewBox.baseVal.height < ((lanes.length - 1) * LINE_HEIGHT)){
      panViewBox(svg.viewBox.baseVal.x, svg.viewBox.baseVal.y + svg.viewBox.baseVal.height);
      navEl.classList.add('scrolled');
    }
  }

  if(!formMode && !zoomed && (e.key === 'ArrowUp' || e.code === 'ArrowUp')){
    if(isMoving){
      return;
    }
    if(svg.viewBox.baseVal.y > 0){
      panViewBox(svg.viewBox.baseVal.x, svg.viewBox.baseVal.y - svg.viewBox.baseVal.height);
      if(svg.viewBox.baseVal.y - svg.viewBox.baseVal.height === 0){
        navEl.classList.remove('scrolled');
      }
    }
  }
}

function onSvgClick(e){
  if(!isZoomed()){
    if(
      e.target.classList.contains('bug-line') ||
      e.target.parentElement.classList.contains('bug-line')
    ) {
      var el = e.target;
      if(!el.classList.contains('bug-line')){
        el = e.target.parentElement;
      }
      if(e.ctrlKey || e.metaKey){
        window.open("https://bugzilla.mozilla.org/show_bug.cgi?id=" + el.getAttribute("data-bug-id"));
      } else {
        zoomInBug(el);
      }
    }
  }
}

function setDashboardYear(year, reset){
  if(isMoving){
    return;
  }
  currentYear = year;

  if(reset){
    bugs = [];
    lanes = [];
    displayedYears = [];
    svg.innerHTML = "";
  }

  document.querySelector('nav .year').textContent = year;

  panViewBox((year - BUGZILLA_BIRTH_YEAR) * svg.viewBox.baseVal.width);
  updateDashboardNavigation(year);

  if(displayedYears.indexOf(year) === -1){
    displayedYears.push(year);
    drawMonths(year);
    drawWeeks(year);
    setBugs(year).catch((ex) => console.error(ex));
  }
};

function panViewBox(toX, toY, duration){
  if(typeof toY === "undefined"){
    toY = svg.viewBox.baseVal.y;
  }

  if(typeof duration === "undefined"){
    duration = 200;
  }

  isMoving = true;
  hideTooltip();
  let xStart = svg.viewBox.baseVal.x;
  let xDelta = svg.viewBox.baseVal.x - toX;

  let yStart = svg.viewBox.baseVal.y;
  let yDelta = svg.viewBox.baseVal.y - toY;



  let start;
  let pan = function(timestamp ){
    if (!start){
      start = timestamp
    };
    let t = (timestamp - start)/duration;
    // Easing function https://gist.github.com/gre/1650294
    t = t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1;
    if (t <= 1) {
      svg.viewBox.baseVal.x = xStart - (xDelta  * t);
      svg.viewBox.baseVal.y = yStart - (yDelta  * t);
      requestAnimationFrame(pan);
    } else {
      svg.viewBox.baseVal.x = toX;
      svg.viewBox.baseVal.y = toY;
      isMoving = false;
    }
  }
  requestAnimationFrame(pan);
}

function updateDashboardNavigation(year){
  let previousYearButton = document.querySelector(".year-nav[data-direction=previous]");
  let nextYearButton = document.querySelector(".year-nav[data-direction=next]");

  previousYearButton.setAttribute("data-year", year - 1);
  nextYearButton.setAttribute("data-year", year + 1);

  if( year === (new Date()).getFullYear()){
    nextYearButton.setAttribute('disabled', true);
    nextYearButton.setAttribute('title', "You can't go to the future, Marty");
  } else {
    nextYearButton.removeAttribute('disabled');
    nextYearButton.removeAttribute('title');
  }

  if( year === BUGZILLA_BIRTH_YEAR){
    previousYearButton.setAttribute('disabled', true);
    previousYearButton.setAttribute('title', "You can't go further, Bugzilla did not exists before");
  } else {
    previousYearButton.removeAttribute('disabled');
    previousYearButton.removeAttribute('title');
  }

}

function setBugs(year){
  document.querySelector('nav').classList.add('loading');
  let firstMonday = getMondayOfFirstWeek(year);

  let fields = [
    "id",
    "summary",
    "status",
    "cf_last_resolved",
    "target_milestone",
    "creation_time",
    "resolution",
    "assigned_to",
    "creator"
  ];
  var params = {
    "include_fields": fields.join(","),
    "email1": bugzillaEmail,
    "emailassigned_to1":1
  };
  if(window.URLSearchParams){
    var searchParams = new URLSearchParams();

    Object.keys(params).forEach(function(key){
      searchParams.append(key, params[key]);
    });
    searchParams = searchParams.toString();
  } else {
    var searchParams = [];
    Object.keys(params).forEach(function(key){
      searchParams.push(key+"="+params[key]);
    });
    searchParams = searchParams.join('&');
  }


  let url = `${BUGZILLA_API_URL}bug?${searchParams}`;
  let myHeaders = new Headers();
  myHeaders.append('Accept', 'application/json');

  return fetch(url, {
    mode: 'cors',
    method: 'GET',
    headers: myHeaders
  })
  .then((response) => response.json())
  .then(function(data){

    var promises = [];

    data.bugs = data.bugs.filter((x) => !x.cf_last_resolved || new Date(x.cf_last_resolved) >= firstMonday);

    data.bugs.sort(function(a, b){
      if(a.cf_last_resolved || b.cf_last_resolved){
        if(!a.cf_last_resolved){
          return 1;
        }

        if(!b.cf_last_resolved){
          return -1;
        }

        return a.cf_last_resolved < b.cf_last_resolved ? -1 : 1;
      }

      return a.creation_time < b.creation_time ? -1 : 1;

    });
    data.bugs.forEach(function(bug){
      var bugExists = bugs.some(function(item){
      return (item.id == bug.id);
      });

      if(!bugExists){
        var historyPromise = getBugHistory(bug).then(function(history){
          bug.history = history;

          // A bug is being worked on by the user when :
          // - creates the bug
          // - changes the bug
          // - is cc'ed on the bug
          // - is assigned on the bug
          bug.history.some(function(activity){

            var hasAssignement = (activity.who === bugzillaEmail)
            if(!hasAssignement){
              activity.changes.some(function(change){
                return (
                  (
                    change.field_name === 'cc' ||
                    change.field_name === 'assigned_to'
                  ) && change.added === bugzillaEmail
                );
              });
            }

            if(hasAssignement === true){
              bug.startDate = new Date(activity.when);
              return true;
            }
          });

          if(!bug.startDate && bug.assigned_to === bugzillaEmail){
            bug.startDate = new Date(bug.creation_time);
          }


          if(bug.cf_last_resolved){
            bug.endDate = new Date(bug.cf_last_resolved);
          } else {
            bug.endDate = new Date();
          }

          bugs.push(bug);
          drawBug(bug);
          return bug
        });
        promises.push(historyPromise);
      }
    });

    return Promise.all(promises);
  })
  .then(function(){
    document.querySelector('nav').classList.remove('loading');
  })
  .catch((e) => console.error(e));
}


function getBugHistory(bugData){
  let myHeaders = new Headers();
  myHeaders.append('Accept', 'application/json');
  var url = `${BUGZILLA_API_URL}bug/${bugData.id}/history`;
  return fetch(url, {
    mode: 'cors',
    method: 'GET',
    headers: myHeaders
  })
  .then((response) => response.json())
  .then(function(data){
    let history = data.bugs[0].history;
    history.unshift({
      who: bugData.creator,
      when: bugData.creation_time,
      changes: [{
        field_name: 'Creation',
        removed: '',
        added: ''
      }]
    });
    return history;
  }).catch(function(ex){
    console.log(bugData.id, ex);
  });
}

function getMondayOfFirstWeek(year){
  // First week of the year is the week where is January 4th
  let currentYearJan4 = new Date(`${year}-01-04`);
  return new Date(currentYearJan4.getTime() - ((currentYearJan4.getDay() - MONDAY_INDEX) * MILLISECOND_A_DAY));
}

function getPositionFromDate(date, period){
    if(period){
      let start = period[0];
      let end = period[1];
      let length = (end - start);
      if(length === 0){
        let percent = (date - start)/length;

        let periodStart = svg.viewBox.baseVal.x + DETAIL_PADDING;
        let periodEnd = svg.viewBox.baseVal.x + YEAR_WIDTH - DETAIL_PADDING;

        return periodEnd + ( end - date );
      } else {
        let percent = (date - start)/length;

        let periodStart = svg.viewBox.baseVal.x + DETAIL_PADDING;
        let periodEnd = svg.viewBox.baseVal.x + YEAR_WIDTH - DETAIL_PADDING;
        let periodLength = periodEnd - periodStart;

        return periodStart + ( periodLength  * percent );
      }
    }

    return (date - getMondayOfFirstWeek(BUGZILLA_BIRTH_YEAR))/MILLISECOND_A_DAY;
}

function findLane(start, end){
  var lane = 0;
  var safe_space = 8;
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

function createSVGElement(tagName, attributes){
  let el = document.createElementNS("http://www.w3.org/2000/svg", tagName);
  for(let key in attributes){
    el.setAttribute(key, attributes[key])
  }
  return el;
}

function drawBug(bug){
  if(bug.startDate){
    var colorIndex = (bug.id % (COLORS.length - 1));
    var bugColor = COLORS[colorIndex];

    var startPoint = getPositionFromDate(bug.startDate);
    var endPoint = getPositionFromDate(bug.endDate);
    var laneNumber = findLane(startPoint,endPoint);

    if(!lanes[laneNumber]){
      lanes[laneNumber] = [];
    }
    lanes[laneNumber].push([startPoint,endPoint]);
    var y = (LINE_HEIGHT) + (laneNumber * LINE_HEIGHT);
    var bugGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    bugGroup.classList.add('bug-line');
    bugGroup.setAttribute('data-bug-id', bug.id);
    bugGroup.setAttribute('data-tooltip', `Bug ${bug.id}<hr>${bug.summary}`);

    if(bug.cf_last_resolved && bug.resolution == 'FIXED'){
      var endCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      endCircle.classList.add('resolved');
      endCircle.setAttribute('cx', endPoint);
      endCircle.setAttribute('cy', y);
      endCircle.setAttribute('r', 2);
      endCircle.setAttribute('fill', bugColor);
      bugGroup.appendChild(endCircle);
    }

    var bugAssignedLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    bugAssignedLine.setAttribute('x1', startPoint);
    bugAssignedLine.setAttribute('y1', y);
    bugAssignedLine.setAttribute('x2', endPoint);
    bugAssignedLine.setAttribute('y2', y);
    bugAssignedLine.setAttribute('stroke', bugColor);
    bugAssignedLine.setAttribute('stroke-width', 2);
    bugAssignedLine.setAttribute('stroke-linecap', "round");
    bugGroup.appendChild(bugAssignedLine);

    svg.appendChild(bugGroup);
  }
}

function drawWeeks(year){

  let weekGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  let firstDay = getMondayOfFirstWeek(year);
  weekGroup.classList.add('weeks');
  for(var i = 0; i <= 52; i++){
    let monday = new Date(firstDay.getTime() + (i * 7 * MILLISECOND_A_DAY));
    let weekLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    let x = getPositionFromDate(monday);
    weekLine.setAttribute('x1', x);
    weekLine.setAttribute('y1', 0);
    weekLine.setAttribute('x2', x);
    weekLine.setAttribute('y2', 10000);
    weekLine.setAttribute('stroke', 'rgba(0,0,0,0.3)');
    weekLine.setAttribute('stroke-width', 0.1);
    weekGroup.appendChild(weekLine);
  }
  svg.insertBefore(weekGroup,svg.firstChild);
}

function drawMonths(year){

  let monthGroup = createSVGElement("g");
  monthGroup.classList.add('months');

  let monthWidth = 5;

  for(var i = 0; i < 12; i++){
    let firstDay = new Date(year, i, 1,0,0,0);
    let x = getPositionFromDate(firstDay);
    let monthLine = createSVGElement("line", {
      "x1": x,
      "y1": 0,
      "x2": x,
      "y2": 10000,
      "stroke": "#FFC107",
      "stroke-width": 0.5
    });

    let monthText = createSVGElement("text", {
      "x": (x + monthWidth/2),
      "y": (monthWidth - 1) ,
      "font-size": 4,
      "font-family": "Signika",
      "fill": "rgba(0,0,0,0.5)",
      "text-anchor": "middle",
      "title": MONTHS[i]
    });
    monthText.innerHTML = MONTHS[i][0];

    let monthRect =  createSVGElement("rect", {
      "x" : x,
      "y" : 0,
      "width" : monthWidth,
      "height" : monthWidth,
      "fill" : "#FFC107"
    });

    monthGroup.appendChild(monthRect);
    monthGroup.appendChild(monthLine);
    monthGroup.appendChild(monthText);
  }

  svg.insertBefore(monthGroup,svg.firstChild);
}

function zoomInBug(el){
    isMoving = true;
    hideTooltip();

    var id = el.getAttribute("data-bug-id");
    var bugData = bugs.find(function(item){
      return (item.id == id);
    });
    bugTitleEl.innerHTML =`<a href="https://bugzilla.mozilla.org/show_bug.cgi?id=${id}" target="blank">Bug ${id} - ${bugData.summary}</a>`;

    var line = el.querySelector('line');

    var duration = 500;
    var x1 = parseFloat(line.getAttribute("x1"));
    var x2 = parseFloat(line.getAttribute("x2"));
    var y = parseFloat(line.getAttribute("y1"));
    var strokeWidth = parseFloat(line.getAttribute("stroke-width"));

    line.setAttribute("data-x1",x1);
    line.setAttribute("data-x2",x2);
    line.setAttribute("data-y",y);
    line.setAttribute("data-stroke-width",strokeWidth);

    let lineStart = svg.viewBox.baseVal.x + DETAIL_PADDING;
    let lineEnd = svg.viewBox.baseVal.x + YEAR_WIDTH - DETAIL_PADDING;

    var x1FromStart = x1 - lineStart;
    var x1MoveByMs = x1FromStart/duration;
    var x2FromStart = lineEnd - x2;
    var x2MoveByMs = x2FromStart/duration;
    var yFromMiddle = svg.viewBox.baseVal.y + 60 - y;
    var yMoveByMs = yFromMiddle/duration;
    var finalStrokeWidth = 20;
    var strokeWidthMoveByMs = (finalStrokeWidth - strokeWidth)/duration;
    var start = 0;

    function zoom(timestamp) {
      if (!start) start = timestamp;
      var progress = timestamp - start;
      if (progress < duration) {
        line.setAttribute('x1',x1 - (x1MoveByMs * progress));
        line.setAttribute('x2',x2 + (x2MoveByMs * progress));
        line.setAttribute('y1',y + (yMoveByMs * progress));
        line.setAttribute('y2',y + (yMoveByMs * progress));
        line.setAttribute('stroke-width',strokeWidth + (strokeWidthMoveByMs*progress));
        requestAnimationFrame(zoom);
      } else {
        line.setAttribute('x1', lineStart);
        line.setAttribute('x2', lineEnd );
        line.setAttribute('y1',svg.viewBox.baseVal.y + 60);
        line.setAttribute('y2',svg.viewBox.baseVal.y + 60);
        line.setAttribute('stroke-width',finalStrokeWidth);

        drawBugDetail(el, bugData);
        isMoving = false;
      }
    }

    requestAnimationFrame(zoom);

    document.body.classList.add('zoomed');
    el.classList.toggle('detail');
}

function drawBugDetail(el, bugData){
  let bugPeriod = [bugData.startDate, bugData.endDate];
  let y = svg.viewBox.baseVal.y + 60;

  let bugGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  bugGroup.classList.add('detail-bug-line');

  if(bugData.endDate && bugData.resolution == 'FIXED'){
    let endCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    endCircle.setAttribute('cx',getPositionFromDate(bugData.endDate,bugPeriod));
    endCircle.setAttribute('cy', y);
    endCircle.setAttribute('r', 9);
    endCircle.setAttribute('fill', 'rgba(0,0,0,0.3)');
    endCircle.setAttribute('data-tooltip',`RESOLVED ${bugData.cf_last_resolved}`)
    bugGroup.appendChild(endCircle);
  }

  let bugLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
  bugLine.setAttribute('x1', getPositionFromDate(new Date(bugData.creation_time),bugPeriod));
  bugLine.setAttribute('y1', y);
  bugLine.setAttribute('x2', getPositionFromDate(bugData.endDate,bugPeriod));
  bugLine.setAttribute('y2', y);
  bugLine.setAttribute('stroke', 'rgba(0,0,0,1)');
  bugLine.setAttribute('stroke-width', 2);
  bugLine.setAttribute('stroke-linecap', 'round');
  bugGroup.appendChild(bugLine);

  let groups = [];
  let historyEntries = [];
  bugData.history.forEach(function(entry){
    if(! userColor[entry.who]){
      if(USERS_COLORS.length === 0){
        USERS_COLORS = COLORS.map((x) => x);
      }
      userColor[entry.who] = USERS_COLORS.shift();
    }
    let entryColor = userColor[entry.who];


    let entryTitleList = document.createElement('ul');
    entry.changes.sort(function(a, b){
      if(a.added == "" && a.added === b.added){
        return 0;
      }
      return a.added !== 0 ? -1: 0;
    });

    entry.changes.forEach(function(change){
      let li = document.createElement('li');
      li.innerHTML = change.field_name + ' ' + (
        change.removed !== '' ? '<span class="removed">' + change.removed + '</span>':''
      ) + (
        change.added !== '' ? ' ➜ ' + change.added:''
      ) + ' ';
      entryTitleList.appendChild(li);
    });
    let entryTitle = `${entry.when} - ${entry.who}<hr>${entryTitleList.outerHTML}`;

    historyEntries.push({
      x : getPositionFromDate(new Date(entry.when),bugPeriod),
      title: entryTitle,
      color: entryColor,
      mine: entry.who === bugzillaEmail
    });
  });

  historyEntries.sort(function(a, b){
    return a.x > b.x ? 1 : -1;
  });
  historyEntries.reduce(function(previousValue, currentValue, currentIndex, array){
    if(groups.length > 0 && previousValue && currentValue.x - previousValue.x < 10){
      groups[groups.length - 1].push(currentValue);
    } else {
      groups.push([currentValue]);
    }
    return currentValue;
  },null);

  var circleR = 10;

  groups.forEach(function(group, index){
    var groupGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

    var strokeWidth = 2;
    var x1 = group[0].x;
    var x2 = group[group.length - 1].x;

    var groupLine = document.createElementNS("http://www.w3.org/2000/svg", "line");

    groupLine.setAttribute('x1',x1);
    groupLine.setAttribute('x2',x2);
    groupLine.setAttribute('y1', y);
    groupLine.setAttribute('y2', y);
    groupLine.setAttribute('stroke', 'rgba(0,0,0,1)');
    groupLine.setAttribute('stroke-width', 12 );
    groupLine.setAttribute('stroke-linecap', 'round');
    groupGroup.appendChild(groupLine);

    var clipId = 'group-'+index;
    var groupClipath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
    groupClipath.setAttribute('id',clipId);
    var startCircleClip = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    startCircleClip.setAttribute('cx',x1);
    startCircleClip.setAttribute('cy',y);
    startCircleClip.setAttribute('r',circleR / 2);

    var endCircleClip = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    endCircleClip.setAttribute('cx',x2);
    endCircleClip.setAttribute('cy',y);
    endCircleClip.setAttribute('r',circleR / 2);

    var rectClip = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rectClip.setAttribute("x",x1);
    rectClip.setAttribute("y",y - (circleR/2) );
    rectClip.setAttribute("height",circleR );
    rectClip.setAttribute("width", x2-x1);

    groupClipath.appendChild(startCircleClip);
    groupClipath.appendChild(endCircleClip);
    groupClipath.appendChild(rectClip);

    groupGroup.appendChild(groupClipath);

    let stroke = 0.5;

    var groupStart = x1 - (circleR / 2) - stroke;
    var groupEnd = x2 + (circleR / 2) + stroke;
    var entryWidth = (groupEnd - groupStart)/group.length;
    group.forEach(function(groupEntry, idx){
      var entryRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      entryRect.setAttribute('x', groupStart  + (entryWidth * idx) );
      entryRect.setAttribute('width', entryWidth );
      entryRect.setAttribute('fill', groupEntry.color);
      entryRect.setAttribute('stroke', 'black');
      entryRect.setAttribute('data-tooltip', groupEntry.title);
      entryRect.setAttribute('y', y - circleR );
      entryRect.setAttribute('height', circleR * 2);
      entryRect.setAttribute('stroke-width', stroke);
      entryRect.setAttribute('clip-path',`url(#${clipId})`);
      groupGroup.appendChild(entryRect);
    })

    bugGroup.appendChild(groupGroup);
  });

  el.appendChild(bugGroup);

  let daysOfAssignement = (bugData.endDate.getTime() - bugData.startDate.getTime() ) / MILLISECOND_A_DAY;

  let yearHorizontalLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
  yearHorizontalLine.setAttribute('x1', svg.viewBox.baseVal.x);
  yearHorizontalLine.setAttribute('x2', svg.viewBox.baseVal.x + svg.viewBox.baseVal.width);
  yearHorizontalLine.setAttribute('y1', y - 50);
  yearHorizontalLine.setAttribute('y2', y - 50);
  yearHorizontalLine.setAttribute('stroke', 'black');
  yearHorizontalLine.setAttribute('stroke-opacity', 0.4);
  yearHorizontalLine.setAttribute('stroke-width', 0.2);
  bugGroup.insertBefore(yearHorizontalLine,bugGroup.firstChild);

  let monthHorizontalLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
  monthHorizontalLine.setAttribute('x1', svg.viewBox.baseVal.x);
  monthHorizontalLine.setAttribute('x2', svg.viewBox.baseVal.x + svg.viewBox.baseVal.width);
  monthHorizontalLine.setAttribute('y1', y - 40);
  monthHorizontalLine.setAttribute('y2', y - 40);
  monthHorizontalLine.setAttribute('stroke', 'black');
  monthHorizontalLine.setAttribute('stroke-opacity', 0.4);
  monthHorizontalLine.setAttribute('stroke-width', 0.2);
  bugGroup.insertBefore(monthHorizontalLine,bugGroup.firstChild);

  if( daysOfAssignement < 45) {
    let dayHorizontalLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    dayHorizontalLine.setAttribute('x1', svg.viewBox.baseVal.x);
    dayHorizontalLine.setAttribute('x2', svg.viewBox.baseVal.x + svg.viewBox.baseVal.width);
    dayHorizontalLine.setAttribute('y1', y - 30);
    dayHorizontalLine.setAttribute('y2', y - 30);
    dayHorizontalLine.setAttribute('stroke', 'black');
    dayHorizontalLine.setAttribute('stroke-opacity', 0.4);
    dayHorizontalLine.setAttribute('stroke-width', 0.2);
    bugGroup.insertBefore(dayHorizontalLine,bugGroup.firstChild);

    for(var i = 0; i <= daysOfAssignement + 2 ; i++){
      var day = new Date(bugData.startDate.getTime() + ( i * MILLISECOND_A_DAY));
      day.setHours(0,0,0);
      var dayLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
      var pos = getPositionFromDate(day,bugPeriod);
      dayLine.setAttribute('x1',pos);
      dayLine.setAttribute('y1', y - 40);
      dayLine.setAttribute('x2', pos);
      dayLine.setAttribute('y2', y + circleR);
      dayLine.setAttribute('stroke', 'black');
      dayLine.setAttribute('stroke-opacity', 0.1);
      dayLine.setAttribute('stroke-width', .5);
      bugGroup.insertBefore(dayLine,bugGroup.firstChild);

      var dayText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      dayText.textContent = day.getDate();
      if(pos < svg.viewBox.baseVal.x ){
        pos = svg.viewBox.baseVal.x;
      }
      dayText.setAttribute('x', pos + 1);
      dayText.setAttribute('y', y - 40 + 8 );
      dayText.setAttribute('font-size',8);
      dayText.setAttribute('font-family','Signika');
      dayText.setAttribute('fill', '#666');

      let tomorrow = new Date(day.getTime() +  MILLISECOND_A_DAY);
      let nextPos = getPositionFromDate(tomorrow, bugPeriod);
      if(nextPos < svg.viewBox.baseVal.x ){
        nextPos = svg.viewBox.baseVal.x;
      }

      if( nextPos - pos > 10){
        bugGroup.insertBefore(dayText, bugGroup.firstChild);
      }
    }
  }

  let monthsAssigned = Math.ceil((bugData.endDate.getTime() - bugData.startDate.getTime() ) / MILLISECOND_A_DAY / 30);
  if(monthsAssigned < 36){
    let firstDayOfMonth = new Date(bugData.startDate.getFullYear(),bugData.startDate.getMonth(),1);
    for(var i = 0; i <= Math.ceil((bugData.endDate.getTime() - bugData.startDate.getTime() ) / MILLISECOND_A_DAY / 30) ; i++){
      var day = new Date(bugData.startDate.getTime() + ( i * MILLISECOND_A_DAY));
      firstDayOfMonth.setHours(0,0,0);
      var monthLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
      var pos = getPositionFromDate(firstDayOfMonth,bugPeriod);
      monthLine.setAttribute('x1',pos);
      monthLine.setAttribute('y1', y - 50);
      monthLine.setAttribute('x2', pos);
      monthLine.setAttribute('y2', y + circleR);
      monthLine.setAttribute('stroke', 'black');
      monthLine.setAttribute('stroke-opacity', 0.1);
      monthLine.setAttribute('stroke-width', .5);
      bugGroup.insertBefore(monthLine,bugGroup.firstChild);

      var monthText = document.createElementNS("http://www.w3.org/2000/svg", "text");

      let monthNumber = firstDayOfMonth.getMonth();
      if(monthsAssigned < 9){
        monthText.textContent = MONTHS[monthNumber];
      } else {
        monthText.textContent = (monthNumber < 9?"0":"") + (monthNumber + 1);
      }
      if(pos < svg.viewBox.baseVal.x ){
        pos = svg.viewBox.baseVal.x;
      }
      monthText.setAttribute('x', pos + 1);
      monthText.setAttribute('y', y - 50 + 8 );
      monthText.setAttribute('font-size',8);
      monthText.setAttribute('font-family','Signika');
      monthText.setAttribute('fill', '#666');
      bugGroup.insertBefore(monthText, bugGroup.firstChild);

      let nextMonth = firstDayOfMonth.getMonth() + 1;
      firstDayOfMonth.setMonth(nextMonth);
      if(nextMonth === 0){
        firstDayOfMonth.setFullYear(firstDayOfMonth.getFullYear() + 1);
      }
    }
  }

  let startYear = bugData.startDate.getFullYear();
  let endYear = bugData.endDate.getFullYear();
  for(var i = 0; i <= endYear - startYear; i++){
    let firstDayOfYear = new Date(startYear + i, 0, 1);
    firstDayOfYear.setHours(0,0,0);

    var yearLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    var pos = getPositionFromDate(firstDayOfYear,bugPeriod);
    yearLine.setAttribute('x1',pos);
    yearLine.setAttribute('y1', y - 60);
    yearLine.setAttribute('x2', pos);
    yearLine.setAttribute('y2', y + circleR);
    yearLine.setAttribute('stroke', 'black');
    yearLine.setAttribute('stroke-opacity', 0.1);
    yearLine.setAttribute('stroke-width', .5);
    bugGroup.insertBefore(yearLine,bugGroup.firstChild);

    var yearText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    yearText.textContent = startYear + i;

    if(pos < svg.viewBox.baseVal.x ){
      pos = svg.viewBox.baseVal.x;
    }
    yearText.setAttribute('x', pos + 1);
    yearText.setAttribute('y', y - 60 + 8 );
    yearText.setAttribute('font-size',8);
    yearText.setAttribute('font-family','Signika');
    yearText.setAttribute('fill', '#666');
    bugGroup.insertBefore(yearText, bugGroup.firstChild);
  };
}

function zoomOut(){
  hideTooltip();
  var zoomedEl = document.querySelector('.detail');
  if(zoomedEl){
    var detail = zoomedEl.querySelector('.detail-bug-line');
    if(detail){
      detail.remove();
    }

    var line = zoomedEl.querySelector('line');
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
    var x1MoveByMs = x1Move/duration;
    var x2Move = x2 - initialX2;
    var x2MoveByMs = x2Move/duration;
    var yMove = y - initialY;
    var yMoveByMs = yMove/duration;
    var strokeWidthMoveByMs = (strokeWidth - initialStrokeWidth)/duration;
    var start = 0;
    let zoomOut = function(timestamp) {
      if (!start) start = timestamp;
      var progress = timestamp - start;
      if (progress < duration) {
        line.setAttribute('x1',x1 - (x1MoveByMs*progress));
        line.setAttribute('x2',x2 - (x2MoveByMs*progress));
        line.setAttribute('y1',y - (yMoveByMs*progress));
        line.setAttribute('y2',y - (yMoveByMs*progress));
        line.setAttribute('stroke-width',strokeWidth - (strokeWidthMoveByMs*progress));
        requestAnimationFrame(zoomOut);
      } else {
        line.setAttribute('x1',initialX1);
        line.setAttribute('x2',initialX2);
        line.setAttribute('y1',initialY);
        line.setAttribute('y2',initialY);
        line.setAttribute('stroke-width',initialStrokeWidth);
        document.querySelector('.bug-title').innerHTML = currentYear;
        zoomedEl.classList.remove('detail');
        document.body.classList.remove('zoomed');
      }
    }
    requestAnimationFrame(zoomOut);
  }
}

const LS_KEY_EMAIL = 'bugzilla-email';
const X_PADDING = 0;
const LINE_HEIGHT = 7.5;
const DETAIL_PADDING = 15;
const MONDAY_INDEX = 1;
const MILLISECOND_A_DAY = (1000*60*60*24);
const BUGZILLA_BIRTH_YEAR = 1998;
const MONTHS = ['January','February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const BUGZILLA_API_URL = 'https://bugzilla.mozilla.org/rest/';
const COLORS = ["rgb(244, 67, 54)","rgb(0, 150, 136)","rgb(96, 125, 139)","rgb(156, 39, 176)","rgb(103, 58, 183)","rgb(63, 81, 181)","rgb(33, 150, 243)","rgb(3, 169, 244)","rgb(0, 188, 212)","rgb(76, 175, 80)","rgb(139, 195, 74)","rgb(255, 193, 7)","rgb(255, 152, 0)","rgb(255, 87, 34)","rgb(233, 30, 99)","rgb(121, 85, 72)"];
var USERS_COLORS = COLORS.map((x) => x);

var lanes = [];
var bugs = [];
var displayedYears = [];
var bugzillaEmail = null;

let userColor = {};

let currentYear = (new Date()).getFullYear();
let isMoving = false;

let svg = document.querySelector('svg');
let blurFilterEl = document.querySelector('feGaussianBlur');

let formSection = document.querySelector('section.form');
let form = formSection.querySelector('form');
let emailInput = form.querySelector('input[name=email]');
let dashboardSection = document.querySelector('section.dashboard');
let bugTitleEl = document.querySelector('.bug-title');
let navEl = document.querySelector('nav');

let currentTooltipTarget;
let tooltipEl = document.createElement("div");
tooltipEl.classList.add("tooltip");
document.body.appendChild(tooltipEl);
let tooltipHideId;


const YEAR_WIDTH = svg.viewBox.baseVal.width;

init();
