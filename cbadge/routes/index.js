var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
	var fs = require('fs');
	var path = require('path');
	var marked = require('marked');

	marked.setOptions({
		renderer: new marked.Renderer(),
		gfm: true,
		tables: true,
		breaks: true,
		pedantic: false,
		sanitize: true,
		smartLists: true,
		smartypants: false
	});

	var readmePath = path.join(__dirname, '/../../README.md');

	fs.readFile(readmePath, {'encoding': 'utf8'}, function(err, data){
		if(err){
			res.send(500);
			console.log(err);
			return;
		}else{
			res.render('index', {title: 'CBadge', md: marked, body: data})
		}
	});
});

//Rounds number n to number of significant figures sig.
function sigFigs(n, sig) {
	var mult = Math.pow(10,
		sig - Math.floor(Math.log(n) / Math.LN10) - 1);
	return (Math.round(n * mult) / mult).toFixed(2);
}


//Get action on a per-branch or tag basis
router.get('/:project/:action/:owner/:repo/:tag', function(req, res) {
	var request = require('request');
	var badge = require('../helpers/badge');
	var authenticate = require('../helpers/authenticate');
	var packageJSON = require('../package.json');

	var options = {
		url: 'https://api.github.com/repos/'+req.params.owner+'/'+req.params.repo+'/commits/'+req.params.tag,
		headers: {
			'User-Agent': 'CBadge/'+packageJSON.version
			//Don't need to authorize; publicly available
		}
	};

	request(options, function (error, response, body) {
		if(error){
			res.send(500);
		}else{
			var sha = JSON.parse(body).sha;
			if(!sha){
				res.send(500);
				return;
			}

			res.redirect('/'+req.params.project+'/'+sha+'/'+req.params.action+'.svg');
		}
	});
});


//Notify CBadge to comment on a pull request for information, or update previous comment.
router.get('/:project/pullRequest/:owner/:repo/:number/:sha', function(req, res) {
	var request = require('request');
	var packageJSON = require('../package.json');

	//Query GitHub about this pull request
	var options = {
		url: 'https://api.github.com/repos/'+req.params.owner+'/'+req.params.repo+'/pulls/'+req.params.number,
		headers: {
			'User-Agent': 'CBadge/'+packageJSON.version
		}
	};

	//Get base SHA and merge SHA
	request(options, function (error, response, body) {
		if(error){
			res.send(500);
		}else{
			var pullRequest = JSON.parse(body);
			if(!pullRequest.base && !pullRequest.head){
				res.send(500);
				return;
			}
			var baseSHA = pullRequest.base.sha;
			var headSHA = pullRequest.head.sha;
			var testingSHA = req.params.sha;

			//Importing GitHubAPI library
			var GitHubApi = require('github');
			var github = new GitHubApi({
				version: '3.0.0',
				protocol: 'https',
				timeout: 5000
			});

			github.authenticate({
				type: 'basic',
				username: 'CBadge',
				password: process.env.CBADGE_PASSWORD
			});

			//Generating comment to make
			var cbadgeURL = process.env.CBADGE_URL;
			var comment = '| Base ('+baseSHA.substring(0, 7)+') | Merged ('+testingSHA.substring(0, 7)+')|\n|:---:|:---:|\n|[![Base Coverage Status]('+cbadgeURL+'/'+req.params.project+'/'+baseSHA+'/coverage.svg)](http://open.cdash.org/index.php?project='+req.params.project+')|[![Merge Coverage Status]('+cbadgeURL+'/'+req.params.project+'/'+testingSHA+'/coverage.svg)](http://open.cdash.org/index.php?project='+req.params.project+')\n|[![Base Testing Status]('+cbadgeURL+'/'+req.params.project+'/'+baseSHA+'/test.svg)](http://open.cdash.org/index.php?project='+req.params.project+')|[![Merge Testing Status]('+cbadgeURL+'/'+req.params.project+'/'+testingSHA+'/test.svg)](http://open.cdash.org/index.php?project='+req.params.project+')\n|[![Base Build Status]('+cbadgeURL+'/'+req.params.project+'/'+baseSHA+'/build.svg)](http://open.cdash.org/index.php?project='+req.params.project+')|[![Merge Build Status]('+cbadgeURL+'/'+req.params.project+'/'+testingSHA+'/build.svg)](http://open.cdash.org/index.php?project='+req.params.project+')\n|[![Base Configure Status]('+cbadgeURL+'/'+req.params.project+'/'+baseSHA+'/configure.svg)](http://open.cdash.org/index.php?project='+req.params.project+')|[![Merge Configure Status]('+cbadgeURL+'/'+req.params.project+'/'+testingSHA+'/configure.svg)](http://open.cdash.org/index.php?project='+req.params.project+')';

			//Now to decide if we need to edit our last comment or make a new one
			//Were we the last one to make a commit on this pull request?
			request({
				url: 'https://api.github.com/repos/'+req.params.owner+'/'+req.params.repo+'/issues/'+req.params.number+'/comments',
				headers: {
					'User-Agent': 'CBadge/'+packageJSON.version
				}
			}, function (error, reponse, body) {
				if(error){
					res.send(500);
					return;
				}
				var comments = JSON.parse(body);
				if(comments[comments.length-1] && comments[comments.length-1].user.login == 'CBadge'){
					//Yes, we were.  Now let's edit our comment.
					console.log('we were the last commenters');
					github.issues.editComment({
						user: req.params.owner,
						repo: req.params.repo,
						number: req.params.number,
						id: comments[comments.length-1].id,
						body: comment
					});
					console.log('successfully edited comment');
					res.send(200);
					return;
				}else{
					console.log('we were not the last commenters');
					github.issues.createComment({
						user: req.params.owner,
						repo: req.params.repo,
						number: req.params.number,
						body: comment
					});
					console.log('successfully created comment');
					res.send(200);
					return;
				}
			});
		}
	});
});


//Maintain backwards compatibility with old badge urls (/:project/:action/:revision)
router.get('/:project/:action/:revision', function(req, res) {
	res.redirect('/'+req.params.project+'/'+req.params.revision+'/'+req.params.action+'.svg');
});


//Get coverage on a per-revision basis
router.get('/:project/:revision/coverage.svg', function(req, res) {
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

					loctested += Number(coverage[i].loctested);
					locuntested += Number(coverage[i].locuntested);
				}
			}
			if(loctested + locuntested > 0){
				var percent = loctested/(loctested+locuntested);
				percent *= 100;
				percent = sigFigs(percent, 3);
				if(percent > 80){
					badge(res, 'coverage', percent+'%', 'brightgreen');
				}else if(percent > 60){
					badge(res, 'coverage', percent+'%', 'yellow');
				}else{
					badge(res, 'coverage', percent+'%', 'red');
				}
			}else{
				badge(res, 'coverage', 'unknown', 'lightgrey');
			}
		}
	});
});


//Get build status on a per-revision basis
router.get('/:project/:revision/build.svg', function(req, res) {
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
					badge(res, 'build', buildErrors+' errors', 'red');
				}else if(Number(buildWarnings) > 0){
					badge(res, 'build', buildWarnings+' warnings', 'yellow');
				}else{
					badge(res, 'build', 'passing', 'brightgreen');
				}
			}else{
				badge(res, 'build', 'unknown', 'lightgrey');
			}


		}
	});
});


//Get configure status on a per-revision basis
router.get('/:project/:revision/configure.svg', function(req, res) {
	var request = require('request');
	var badge = require('../helpers/badge');

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
					badge(res, 'configure', configureErrors+' errors', 'red');
				}else if(Number(configureWarnings) > 0){
					badge(res, 'configure', configureWarnings+' warnings', 'yellow');
				}else{
					badge(res, 'configure', 'passing', 'brightgreen');
				}
			}else{
				badge(res, 'build', 'unknown', 'lightgrey');
			}


		}
	});
});


//Get test status on a per-revision basis
router.get('/:project/:revision/test.svg', function(req, res) {
	var request = require('request');
	var badge = require('../helpers/badge');

	request('http://open.cdash.org/api/?method=build&task=revisionstatus&project='+req.params.project+'&revision='+req.params.revision, function (error, response, body) {
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
				percent *= 100;
				percent = sigFigs(percent, 3);
				if(percent > 80){
					badge(res, 'tests', percent+'%', 'brightgreen');
				}else if (percent > 60){
					badge(res, 'tests', percent+'%', 'yellow');
				}else{
					badge(res, 'tests', percent+'%', 'red');
				}
			}else{
				badge(res, 'tests', 'unknown', 'lightgrey');
			}
		}
	});
});

module.exports = router;
