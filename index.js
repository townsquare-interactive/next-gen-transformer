"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
var express_1 = require("express");
var cms_routes_js_1 = require("./api/cms-routes.js");
var app = (0, express_1.default)();
var routes = cms_routes_js_1.default;
/* if (process.env.DB == 'dynamo') {
    routes = require('./api/dynamo-routes')
} else if (process.env.DB == 'mongo') {
    routes = require('./api/mongo-routes')
} else if (process.env.DB == 'cms') {
    routes = require('./api/cms-routes')
} */
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    // authorized headers for preflight requests
    // https://developer.mozilla.org/en-US/docs/Glossary/preflight_request
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
    app.options('*', function (req, res) {
        // allowed XHR methods
        res.header('Access-Control-Allow-Methods', 'GET, PATCH, PUT, POST, DELETE, OPTIONS');
        res.send();
    });
});
app.use(express_1.default.json({ limit: '80mb' }));
app.use(express_1.default.urlencoded({ limit: '80mb', extended: true, parameterLimit: 5000000 }));
app.use('/api/cms-routes', routes);
var PORT = process.env.PORT || 8080;
app.get('/', function (req, res) {
    res.send("API Running ".concat(process.env.PORT));
});
app.listen(PORT, function () { return console.log("Server running in port ".concat(PORT)); });
