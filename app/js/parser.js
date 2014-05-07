/**
	Dependencies
	- Moment JS
	- Underscore
**/

var testData = [
	{
		date: "2014-04-18T19:15:45-0400",
		text: "Read 60 pages"
	},
	{
		date: "2014-04-22T08:15:17-0400",
		text: "Coded 45 minutes"
	},
	{
		date: "2014-04-23T07:14:30-0400",
		text: "Dev learnings for 45 minutes"
	},
	{
		date: "2014-04-18T19:15:45-0400",
		text: "Learned spanish for 15 minutes yesterday"
	},
	{
		date: "2014-04-18T19:15:45-0400",
		text: "Ran for 3 miles"
	}
];

var subjectRegexes = {
	readingRegex: 			new RegExp(/(reading|read)/),
	codingRegex: 			new RegExp(/(coded|coding|code)/),
	exercisingRegex: 		new RegExp(/(ran|pushups|gym)/),
	learningRegex : 		new RegExp(/(dev|tech|math|science)/),
	languageLearningRegex: 	new RegExp(/(french|spanish|italian)/)
};

var labelRegexes = {
	minutesRegex: 			new RegExp(/(minute|min)/),
	pagesRegex: 			new RegExp(/(page)/),
	milesRegex: 			new RegExp(/(mile)/)
};

var yesterdayRegex = 		new RegExp(/yesterday/);


function Entry (data){
	this.rawText = data.text.trim().toLowerCase();
	this.rawDate = data.date;
	this.valueInMinutes = null;
	this.cleanDate = null;
	this.subject = "";
	this.textArray = this.rawText.split(" ");

	return this;
};


Entry.prototype.parseText = function(){
	this.label = checkRegexes(labelRegexes, this);
	this.subject = checkRegexes(subjectRegexes, this);
};


Entry.prototype.getMeasurement = function (){
	var labelIndex = _.indexOf(this.textArray, this.label);
	if (labelIndex === -1) { return; }

	return parseInt(this.textArray[labelIndex-1], 10);
};

Entry.prototype.convertToMinutes = function (){
	var rawValue = this.getMeasurement();

	if (this.label === 'pages'){
		this.valueInMinutes = Math.floor(rawValue * 1.75);
	} else if (this.label === 'miles'){
		this.valueInMinutes = Math.floor(rawValue * 9.5) + 15;
	} else {
		this.valueInMinutes = rawValue;
	};
};

Entry.prototype.makeAdjustment = function (){
	var date = this.rawDate;
	if ( yesterdayRegex.test(this.rawText) ){
		date = moment(this.rawDate).subtract('days', 1);
	}

	this.cleanDate = moment(date).format("MMM Do YYYY");
};

// Assumes regex key ends in Regex
function checkRegexes(list, entry){
	var result = _.reduce(list, function(memo, regex, regexName){
		if (regex.test(entry.rawText)) { memo = regexName; }
		return memo;
	}, "");
	return result.slice(0, -5);
};


_.each(testData, function(x, index) {
	var entry = new Entry(x);
	entry.parseText();
	entry.convertToMinutes();
	entry.makeAdjustment();
	console.log(entry);
});