/*Main javascript file for the app*/

var jsdom = require("jsdom");

/*jsdom example*/

jsdom.env(
  "http://www.scotchmaltwhisky.co.uk/aberfeldy.htm",
  ["http://code.jquery.com/jquery.js"],
  function (err, window) {
  	var bottlings = window.$(".bodytext")['5'];
  	var notes = window.$(".bodytext")['3'];
  	console.log(notes.textContent);

  	var listItems = bottlings.getElementsByTagName('li');
	
  	for (var key in listItems){console.log(listItems[key].textContent);}
  }
);