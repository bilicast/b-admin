var util = require('util');
var request = require('request');
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var app = express();
var port = process.env.PORT || 3001;
var API = 'https://review.arrr.tw/';

app.use(morgan('dev'));
app.use(express.static('public'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

var endPoints = [
    {path: '/private/v1/accounts/users/login', type: 'post'},
    {path: '/private/v1/accounts/users/logout', type: 'delete'},
    {path: '/private/v1/accounts/users', type: 'get'},
    {path: '/private/v1/users', type: 'get'},
    {path: '/private/v1/users', type: 'post'},
    {path: '/private/v1/users/{userId}', type: 'put'},
    {path: '/private/v1/hashtags/trends', type: 'get'},
    {path: '/private/v1/hashtags/trends/{trendsId}', type: 'put'},
    {path: '/private/v1/reviews', type: 'get'},
    {path: '/private/v1/reviews', type: 'post'},
    {path: '/private/v1/reviews/{postId}', type: 'put'},
    {path: '/private/v1/searchs/keywords', type: 'get'}
];

var index = endPoints.length;
var type, path;

while (index--) {
    (function (endPoint) {
        app[endPoint.type](endPoint.path, function (req, res) {
            type = endPoint.type == 'delete' ? 'del' : endPoint.type;
            path = endPoint.path.replace(/\{[\w\-]+\}/g, function ($) {
                return req.params[$.substr(1)];
            });

            request[type]({
                url: API + path,
                qs: req.query,
                json: req.body,
                headers: {
                    'X-REVIEW-CHANNEL': req.get('X-REVIEW-CHANNEL'),
                    'X-REVIEW-TOKEN': req.get('X-REVIEW-TOKEN')
                }
            }, function (error, response, body) {
                res.status(response.statusCode).send(body);
            });
        });
    })(endPoints[index]);
}

app.listen(port, function () {
    console.log(util.format('Start mock server on %s', port));
});