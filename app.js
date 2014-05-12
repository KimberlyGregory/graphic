/**
    Dependencies
    - Moment JS
    - Underscore
**/

var _           = require('underscore');
    moment      = require('moment'),
    fs          = require('fs'),
    file        = __dirname + '/reporter-export.json',
    destFile    = __dirname + '/database.json',
    express     = require('express'),
    app         = express();

var subjectRegexes = {
    readingRegex:           new RegExp(/(reading|read)/),
    codingRegex:            new RegExp(/(coded|coding|code)/),
    exercisingRegex:        new RegExp(/(ran|pushups|gym)/),
    learningRegex :         new RegExp(/(dev|tech|math|science)/),
    languageLearningRegex:  new RegExp(/(french|spanish|italian)/)
};

var labelRegexes = {
    minutesRegex:           new RegExp(/(minute|min)/),
    pagesRegex:             new RegExp(/(page)/),
    milesRegex:             new RegExp(/(mile)/),
    hoursRegex:             new RegExp(/(hour|hr)/),
};

var yesterdayRegex =        new RegExp(/yesterday/);


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
    var label = this.label,
        labelIndex;
    _.find(this.textArray, function(word, index){
        labelIndex = index;
        return labelRegexes[label+"Regex"].test(word);
    });
    if (!label) { return; }
    return parseInt(this.textArray[labelIndex-1], 10);
};

Entry.prototype.convertToMinutes = function (){
    var rawValue = this.getMeasurement();

    if (this.label === 'pages'){
        this.valueInMinutes = Math.floor(rawValue * 1.75);
    } else if (this.label === 'miles'){
        this.valueInMinutes = Math.floor(rawValue * 9.5) + 15;
    } else if (this.label === 'hours'){
        this.valueInMinutes = rawValue * 60;
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


function cleanData(data){
    var snapshots = data.snapshots;

    snapshots = _.map(snapshots, function(snapshot){
        var response = _.find(snapshot.responses, function(response){
            return response.questionPrompt === "What are you doing?";
        });
        response = response || {textResponse: ""};
        return {
            date: snapshot.date,
            text: response.textResponse
        }
    });

    snapshots = _.reduce(snapshots, function(newArray, snapshot){
        if (snapshot.text.length > 0) {
            newArray.push(snapshot);
        }
        return newArray;
    }, []);
    return snapshots;
};

function parseData(data){
    var entries = [];
    _.each(data, function(x, index) {
        var entry = new Entry(x);
        entry.parseText();
        entry.convertToMinutes();
        entry.makeAdjustment();
        entries[index] = entry;
    });

    return entries;
};

function globalizeData(data){
    var subjects = _.map(data, function(entry){
        return entry.subject;
    });

    subjects = _.unique(subjects);
    return {
        entries: data,
        stats: {
            subjects: subjects,
            startDate: data[0].cleanDate,
            endDate:    data[date.length - 1].cleanDate,
            entryCount: data.length
        }
    }
};


!function init(){
    var data = fs.readFileSync(file, 'utf8', function (err, data) {
      if (err) {
        console.log('Error: ' + err);
        return;
      }
    });

    data = JSON.parse(data);
    var snapshots = cleanData(data);
    data = parseData(snapshots);
    json = globalizeData(data);

    fs.writeFile(destFile, JSON.stringify(json, null, " "), function(err) {
        if(err) {
          console.log(err);
        } else {
          console.log("JSON saved to " + destFile);
        }
    });

    app.configure(function() {
        app.use(express.static(__dirname+'/pubic'));
    });

    app.get('/', function(req, res){
        res.sendfile(__dirname + '/public/index.html');
    });

    app.get('/public/script.js', function(req, res){
        res.sendfile(__dirname + '/public/script.js');
    });

    app.get('/database.json', function(req, res){
        res.sendfile(__dirname + '/database.json');
    });

    var server = app.listen(3000, function() {
        console.log('Listening on port %d', server.address().port);
    });
}();