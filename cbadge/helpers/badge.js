module.exports = function(res, subject, status, color){
    var request = require('request');
	var packageJSON = require('../package.json');

    var options = {
        url: 'http://img.shields.io/badge/'+subject+'-'+status+'-'+color+'.svg',
        headers: {
            'User-Agent': 'CBadge/'+packageJSON.version
        }
    };

    request(options, function (error, response, body) {
        if(error){
            res.send(500);
        }else{
            res.set({
            	'Content-Type': 'image/svg+xml',
            	'Cache-Control': 'no-cache',
            	'Expires': new Date().toUTCString()
            })

            res.send(body);
        }
    });
}