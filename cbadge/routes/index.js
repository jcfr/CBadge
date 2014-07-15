var express = require('express');
var router = express.Router();

// var badge = require('../helpers/badge');
// var request = require('request');
// var cheerio = require('cheerio');

/* GET home page. */
router.get('/', function(req, res) {
  //Blank home page
  res.send(204);
});

//Rounds number n to number of significant figures sig.
function sigFigs(n, sig) {
    var mult = Math.pow(10,
        sig - Math.floor(Math.log(n) / Math.LN10) - 1);
    return Math.round(n * mult) / mult;
}


//To recieve webhooks data on
router.post('/:project/pullRequests/', function(req, res) {
    var request = require('request');
    var badge = require('../helpers/badge');
    var authenticate = require('../helpers/authenticate');
    var packageJSON = require('../package.json');

    //Ignore closing of pull requests
    if(req.body.action == 'closed'){
        return;
    }

    //Getting merge SHA
    var mergeSHA = req.body.pull_request.merge_commit_sha;

    //If no merge SHA, then ignore
    if(!mergeSHA || mergeSHA == null){
        return;
    }

    //Getting base SHA
    var baseSHA = req.body.pull_request.base.sha;

    //Getting repository full name and number
    var fullRepoName = req.body.repository.full_name;
    var number = req.body.number;

    //Generating comment to make
    var cbadgeURL = process.env.CBADGE_URL;
    var comment = ['| Base ('+baseSHA.substring(0, 7)+') | Merge ('+mergeSHA.substring(0, 7)+')|',
        '\n|:---:|:---:|',
        '\n|![Base Coverage]('+cbadgeURL+'/'+req.params.project+'/coverage/'+baseSHA+')|![Merge Coverage]('+cbadgeURL+'/'+req.params.project+'/coverage/'+mergeSHA+')',
        '\n|![Base Test]('+cbadgeURL+'/'+req.params.project+'/test/'+baseSHA+')|![Merge Test]('+cbadgeURL+'/'+req.params.project+'/test/'+mergeSHA+')',
        '\n|![Base Build]('+cbadgeURL+'/'+req.params.project+'/build/'+baseSHA+')|![Merge Build]('+cbadgeURL+'/'+req.params.project+'/build/'+mergeSHA+')',
        '\n|![Base Configure]('+cbadgeURL+'/'+req.params.project+'/configure/'+baseSHA+')|![Merge Configure]('+cbadgeURL+'/'+req.params.project+'/configure/'+mergeSHA+')'].join();

    var options = {
        url: 'https://api.github.com/repos/'+fullRepoName+'/issues/'+req.body.number+'/comments',
        headers: {
            'User-Agent': 'CBadge/'+packageJSON.version,
            'Authorization': authenticate()
        },
        body: {
            body: comment
        }
    };
    request.post(options);
});


//Get coverage on a per-revision basis
router.get('/:project/coverage/:revision', function(req, res) {
    var request = require('request');
    var badge = require('../helpers/badge');

    request('http://open.cdash.org/api/?method=build&task=revisionstatus&project='+req.params.project+'&revision='+req.params.revision, function (error, response, body) {
        if (error){
            res.send(500);
        }else{
            var coverage = JSON.parse(body);
            var loctested = 0;
            var locuntested = 0;
            var buildswithcoverage = 0;
            for(var i = 0; i < coverage.length; i++){
                if( coverage[i].loctested != null &&
                    Number(coverage[i].loctested) &&
                    coverage[i].locuntested != null &&
                    Number(coverage[i].locuntested)){

                    loctested += coverage[i].loctested;
                    locuntested += coverage[i].locuntested;
                }
            }
            if(loctested + locuntested > 0){
                var percent = loctested/(loctested+locuntested);
                percent = sigFigs(percent, 3);
                percent *= 100;
                if(percent > 80){
                    res.redirect(badge('coverage', percent+'%', 'brightgreen'));
                }else if(percent > 60){
                    res.redirect(badge('coverage', percent+'%', 'yellow'));
                }else{
                    res.redirect(badge('coverage', percent+'%', 'red'));
                }
            }else{
                res.redirect(badge('coverage', 'unknown', 'lightgrey'));
            }
        }
    });
});

router.get('/:project/build/:revision', function(req, res) {
    var request = require('request');
    var badge = require('../helpers/badge');

    request('http://open.cdash.org/api/?method=build&task=revisionstatus&project='+req.params.project+'&revision='+req.params.revision, function (error, response, body) {
        if (error){
            res.send(500);
        }else{
            var builds = JSON.parse(body);
            var buildErrors = 0;
            var buildWarnings = 0;

            if(builds.length > 0){
                for(var i = 0; i < builds.length; i++){
                    if(Number(builds[i].builderrors)){
                        buildErrors += Number(builds[i].builderrors);
                    }
                    if(Number(builds[i].buildwarnings)){
                        buildWarnings += Number(builds[i].buildwarnings);
                    }
                }

                if(Number(buildErrors) > 0){
                    res.redirect(badge('build', buildErrors+' errors', 'red'));
                }else if(Number(buildWarnings) > 0){
                    res.redirect(badge('build', buildWarnings+' warnings', 'yellow'));
                }else{
                    res.redirect(badge('build', 'passing', 'brightgreen'));
                }
            }else{
                res.redirect(badge('build', 'unknown', 'lightgrey'));
            }


        }
    });
});

router.get('/:project/configure/:revision', function(req, res) {
    var request = require('request');
    var badge = require('../helpers/badge');

    //console.log('http://open.cdash.org/api/?method=build&task=checkinsdefects&project='+req.params.project);

    request('http://open.cdash.org/api/?method=build&task=revisionstatus&project='+req.params.project+'&revision='+req.params.revision, function (error, response, body) {
        if (error){
            res.send(500);
        }else{
            var builds = JSON.parse(body);
            var configureErrors = 0;
            var configureWarnings = 0;

            if(builds.length > 0){
                for(var i = 0; i < builds.length; i++){
                    if(Number(builds[i].configureerrors)){
                        configureErrors += Number(builds[i].configureerrors);
                    }
                    if(Number(builds[i].configurewarnings)){
                        configureWarnings += Number(builds[i].configurewarnings);
                    }
                }

                if(Number(configureErrors) > 0){
                    res.redirect(badge('configure', configureErrors+' errors', 'red'));
                }else if(Number(configureWarnings) > 0){
                    res.redirect(badge('configure', configureWarnings+' warnings', 'yellow'));
                }else{
                    res.redirect(badge('configure', 'passing', 'brightgreen'));
                }
            }else{
                res.redirect(badge('build', 'unknown', 'lightgrey'));
            }


        }
    });
});

router.get('/:project/test/:revision', function(req, res) {
    var request = require('request');
    var badge = require('../helpers/badge');

    request('http://trunk.cdash.org/api/?method=build&task=revisionstatus&project='+req.params.project+'&revision='+req.params.revision, function (error, response, body) {
        if (error){
            res.send(500);
        }else{
            var builds = JSON.parse(body);
            var testsPassed = 0;
            var testsFailed = 0;
            var testsNotRun = 0;

            for(var i = 0; i < builds.length; i++){
                if(Number(builds[i].testpassed)){
                    testsPassed += Number(builds[i].testpassed);
                }
                if(Number(builds[i].testfailed)){
                    testsFailed += Number(builds[i].testfailed);
                }
                if(Number(builds[i].testnotrun)){
                    testsNotRun += Number(builds[i].testnotrun);
                }
            }

            if(testsPassed+testsNotRun+testsFailed > 0){
                var percent = (testsPassed)/(testsPassed+testsNotRun+testsFailed);
                percent = sigFigs(percent, 3);
                percent *= 100;
                if(percent > 80){
                    res.redirect(badge('tests', percent+'%', 'brightgreen'));
                }else if (percent > 60){
                    res.redirect(badge('tests', percent+'%', 'yellow'));
                }else{
                    res.redirect(badge('tests', percent+'%', 'red'));
                }
            }else{
                res.redirect(badge('tests', 'unknown', 'lightgrey'));
            }
        }
    });
});

module.exports = router;
