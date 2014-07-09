var express = require('express');
var router = express.Router();

// var badge = require('../helpers/badge');
// var request = require('request');
// var cheerio = require('cheerio');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
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
                for(var directory in coverage[project]){
                    linesTested += Number(coverage[project][directory].loctested);
                    linesUntested += Number(coverage[project][directory].locuntested);
                }    
            }
            
            
            var percent = (linesTested)/(linesTested+linesUntested);
            percent = sigFigs(percent, 3);
            
            if(isNaN(percent)){
                res.redirect(badge('coverage', 'unknown', 'lightgrey'));
            }else if(percent < 0.80){
                res.redirect(badge('coverage', (percent*100).toString()+'%', 'green'));
            }else if(percent < 0.60){
                res.redirect(badge('coverage', (percent*100).toString()+'%', 'yellow'));
            }else{
                res.redirect(badge('coverage', (percent*100).toString()+'%', 'red'));
            }
        }
    });
});

function sigFigs(n, sig) {
    var mult = Math.pow(10,
        sig - Math.floor(Math.log(n) / Math.LN10) - 1);
    return Math.round(n * mult) / mult;
}

router.get('/:project/build', function(req, res) {
    var request = require('request');
    var badge = require('../helpers/badge');
    
    console.log('http://open.cdash.org/api/?method=build&task=checkinsdefects&project='+req.params.project);
    
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
    
    console.log('http://open.cdash.org/api/?method=build&task=checkinsdefects&project='+req.params.project);
    
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
