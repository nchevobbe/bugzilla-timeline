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
