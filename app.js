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

var dayOrder = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6
}


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

    this.cleanDate = moment(date).format("dd M/D");
};

// Assumes regex key ends in Regex
function checkRegexes(list, entry){
    var result = _.reduce(list, function(memo, regex, regexName){
        if (regex.test(entry.rawText)) { memo = regexName; }
        return memo;
    }, "");
    return result.slice(0, -5);
};

_.pairsObj = function(obj, key1, key2) {
    var keys    = _.keys(obj);
    var length  = keys.length;
    var pairs   = new Array(length);
    var base     = {};
    for (var i = 0; i < length; i++) {
       base[key1] = keys[i];
       base[key2] = obj[keys[i]];
       pairs[i]   = base;
       base     = {};
    }
    return pairs;
};

_.sum = function(list, iterator){
    return _.reduce(list, function(memo, num){ return memo + num[iterator]; }, 0);
}


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

function groupByDate(data, numDays){
    var groupedDates = {};
    numDays = numDays || 30;
    var dates = _.range(numDays, 0);
    _.each(dates, function(num){ groupedDates[moment().subtract('days', num).format("dd M/D")] = undefined; });
    var groupedData = _.groupBy(data, 'cleanDate');

    groupedDates = _.defaults(groupedDates, groupedData);

    _.each(groupedDates, function(value, key, list){ 
        if ( _.isUndefined(value) ) { groupedDates[key] = "No entries"; }
    });

    return _.pairsObj(groupedDates, "date", "data");
};

function groupByDayOfTheWeek (data){
    var grouped = _.groupBy(data, function(entry){return moment(entry.cleanDate).format('dddd'); })
    var mapped = _.map(grouped, function(day, dayName){
        return {
            day: dayName,
            minutes: _.sum(day, 'valueInMinutes')
        };
    });

    return _.sortBy(mapped, function(day){
        return dayOrder[day.day];
    });
}

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
        groupedByDay: groupByDate(data),
        groupByDayOfTheWeek: groupByDayOfTheWeek(data),
        groupByActivity: _.countBy(data, 'subject'),
        entries: data,
        stats: {
            subjects: subjects,
            totalTime: _.sum(data, 'valueInMinutes'),
            startDate: data[0].cleanDate,
            endDate:    data[data.length - 1].cleanDate,
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

    app.set('view engine', 'ejs');

    app.configure(function() {
        app.use(express.static(__dirname+'/pubic'));
    });

    app.get('/', function(req, res){
        res.render('index', json)
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