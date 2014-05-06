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
		text: "Read 20 pages"
	},
	{
		date: "2014-04-18T19:15:45-0400",
		text: "Learned spanish for 15 minutes yesterday"
	}
];

function Entry (data){
	this.rawText = data.text.trim().toLowerCase();
	this.rawDate = data.date;
	this.valueInMinutes = null;
	this.cleanDate = null;
	this.textArray = this.rawText.split(" ");

	return this;
};


Entry.prototype.getMeasurement = function (){
	var labelIndex = _.indexOf(this.textArray, "minutes");
	if (labelIndex === -1) { return; }
	debugger;
	var value = parseInt(this.textArray[labelIndex-1], 10);

	this.valueInMinutes = value;

};

Entry.prototype.convertToMinutes = function (){
// 1 page = 1.75 minutes
};

Entry.prototype.makeAdjustment = function (){
	var date = this.rawDate;
	if ( /yesterday/.test(this.rawText) ){
		date = moment(this.rawDate).subtract('days', 1);
	}

	this.cleanDate = moment(date).format("MMM Do YYYY");
};


_.each(testData, function(x, index) {
	var entry = new Entry(x);
	entry.getMeasurement();
	entry.convertToMinutes();
	entry.makeAdjustment();
	console.log(entry);
});