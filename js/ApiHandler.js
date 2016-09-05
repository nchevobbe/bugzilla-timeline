"use strict";

const BUGZILLA_API_URL = 'https://bugzilla.mozilla.org/rest/';

let ApiHandler = {
  getUserBugs: function(email){
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
    .then((response) => response.json());
  },
  getBugHistory: function(bugData){
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
    });
  }
};

module.exports.ApiHandler = ApiHandler;
