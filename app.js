const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
//ROUTES ...
const pdfRoutes = require('./api/routes/pdf');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//ROUTES ...
app.use('/pdf', pdfRoutes);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});
module.exports = app;