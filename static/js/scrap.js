/*Scraping JavaScript file - holds the JS code required to scrape the data from http://www.scotchmaltwhisky.co.uk*/

var jsdom = require("jsdom");

/*jsdom data scraping*/

jsdom.env(
  "http://www.scotchmaltwhisky.co.uk/"+whisky+".htm",
  ["http://code.jquery.com/jquery.js"],
  function (err, window) {
  	var bottlings = window.$(".bodytext")['5'];
  	var notes = window.$(".bodytext")['3'];
  	console.log(notes.textContent);

  	var listItems = bottlings.getElementsByTagName('li');
	
  	for (var key in listItems){console.log(listItems[key].textContent);}
  }
);