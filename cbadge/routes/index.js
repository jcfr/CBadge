var express = require('express');
var router = express.Router();

// var badge = require('../helpers/badge');
// var request = require('request');
// var cheerio = require('cheerio');

/* GET home page. */
router.get('/', function(req, res) {
  res.send(404);
});

router.get('/:project/coverage', function(req, res) {
    var request = require('request');
    var badge = require('../helpers/badge');

    request('http://open.cdash.org/api/?method=coverage&task=directory&project='+req.params.project, function (error, response, body) {
        if (error){
            res.send(500);
        }else{
            var coverage = JSON.parse(body);

            var linesTested = 0;
            var linesUntested = 0;

            for(var project in coverage){
                linesTested += recursiveLinesTested(coverage[project]);
                //console.log('loct: '+linesTested);
                linesUntested += recursiveLinesUnested(coverage[project]);
                //console.log('locut: '+linesUntested);
            }

            var percent = (linesTested)/(linesTested+linesUntested)*100;
            percent = sigFigs(percent, 3);

            //console.log(linesTested+'/('+linesTested+'+'+linesUntested+') = '+percent);

            if(isNaN(percent)){
                res.redirect(badge('coverage', 'unknown', 'lightgrey'));
            }else if(percent < 80){
                res.redirect(badge('coverage', percent.toString()+'%', 'green'));
            }else if(percent < 60){
                res.redirect(badge('coverage', percent.toString()+'%', 'yellow'));
            }else{
                res.redirect(badge('coverage', percent.toString()+'%', 'red'));
            }
        }
    });
});

function recursiveLinesTested(directory){
    var linesTested = 0;
    for(var property in directory){
        if(property == 'loctested'){
            linesTested += Number(directory[property]);
        }else if(typeof directory[property] == 'object'){
            //console.log('entering '+property);
            linesTested += recursiveLinesTested(directory[property]);
            //console.log('left '+property);
        }
    }
    return linesTested;
}

function recursiveLinesUnested(directory){
    var linesUntested = 0;
    for(var property in directory){
        if(property == 'locuntested'){
            linesUntested += Number(directory[property]);
        }else if(typeof directory[property] == 'object'){
            //console.log('entering '+property);
            linesUntested += recursiveLinesUnested(directory[property]);
            //console.log('left '+property);
        }
    }
    return linesUntested;
}

function sigFigs(n, sig) {
    var mult = Math.pow(10,
        sig - Math.floor(Math.log(n) / Math.LN10) - 1);
    return Math.round(n * mult) / mult;
}

router.get('/:project/build', function(req, res) {
    var request = require('request');
    var badge = require('../helpers/badge');

    //console.log('http://open.cdash.org/api/?method=build&task=checkinsdefects&project='+req.params.project);

    request('http://open.cdash.org/api/?method=build&task=checkinsdefects&project='+req.params.project, function (error, response, body) {
        if (error){
            res.send(500);
        }else{
            var latestBuild = JSON.parse(body);
            var errors = latestBuild[0].builderrors;
            var warnings = latestBuild[0].buildwarnings;

            if(Number(errors) > 0){
                res.redirect(badge('build', 'failing', 'red'));
            }else if(Number(warnings) > 0){
                res.redirect(badge('build', 'warnings', 'yellow'));
            }else{
                res.redirect(badge('build', 'passing', 'green'));
            }
        }
    });
});

router.get('/:project/test', function(req, res) {
    var request = require('request');
    var badge = require('../helpers/badge');

    //console.log('http://open.cdash.org/api/?method=build&task=checkinsdefects&project='+req.params.project);

    request('http://open.cdash.org/api/?method=build&task=checkinsdefects&project='+req.params.project, function (error, response, body) {
        if (error){
            res.send(500);
        }else{
            var latestBuild = JSON.parse(body);
            var testsNotRun = latestBuild[0].testnotrun;
            var failures = latestBuild[0].testfailed;

            if(Number(failures) > 0){
                res.redirect(badge('tests', 'failing', 'red'));
            }else if(Number(testsNotRun) > 0){
                res.redirect(badge('tests', 'unknown', 'yellow'));
            }else{
                res.redirect(badge('tests', 'passing', 'green'));
            }
        }
    });
});

module.exports = router;
