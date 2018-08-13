const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const uuid = require('uuid/v1');
const fs = require('fs');
const serverAddress = process.env.serverAddress || "http://localhost:8080";

//Post request used to optain json data to create a PDF
router.post('/', (req, res, next) => {
    var new_uuid = uuid();

    const order = {
        dataType: '',
        reportName: '', //TODO: match this against a database of reports
        data: '',
        reportID: ''
    }
    if (req.body.data_type == "xml") {
        console.log('Recieved xml');
        order.dataType = req.body.data_type;
        order.reportName = req.body.requested_report;
        order.data = req.body.data_xml;
        order.reportID = req.body.reportID;
    } else if (req.body.data_type == "json") {
        console.log('Recieved json');
        order.dataType = req.body.data_type;
        order.reportName = req.body.requested_report;
        order.data = JSON.stringify(req.body.data_json);
        order.reportID = req.body.reportID;
    }

    //Save report folder
    if (order.reportName != null) {
        //Create folder to save the PDF and data to
        var saveLocation = 'ReportGeneration/' + new_uuid;
        fs.mkdir(saveLocation, function () {
            fs.writeFile(saveLocation + "/temp." + order.dataType, order.data, function (err) {
                if (err) {
                    return console.log("Data failed to save: " + err);
                }
                // fs.close();
                console.log("Data successfully saved");
            });
        });

        var URL = buildURL(order.reportName, order.dataType, '../' + saveLocation + '/temp');
        createPdf(URL, saveLocation);
    };

    //Send back completion notice
    res.status(201).json({
        message: 'Report successfully generated',
        PDFLocation: "http://localhost:8080/" + saveLocation + '/temp.pdf'
    });

});

//Creates a URL that is formated to the report bundle specs
const buildURL = (url, type, data = null, id = null) => {
    let prefix = serverAddress; //"http://172.23.41.177:8080";
    if (url) {
        prefix = prefix + url;
    }
    if (data) {
        prefix = prefix + "?" + type + "loc=" + data + "." + type; //dev_stat.json";
    }
    if (id) {
        prefix = prefix + "&id=" + id;
    }
    console.log("prefix: " + prefix)
    return prefix;
}

//Takes a URL and creates a PDF saving it to the location provided
const createPdf = async (url, saveLocation) => {
    //Variables to save results to
    let browser;
    let page;

    //Open browser using puppetter
    let openBrowser = function () {
        return new Promise(async function (resolve, reject) {
            try {
                // const puppeteer = require('puppeteer');
                const browser = await puppeteer.launch({
                    headless: true
                });
                console.log("Create PDF Step 1) Browser successfully opened");
                return resolve(browser);
            } catch (err) {
                return reject("Create PDF Step 1) Browser failed to open: " + err.message);
                console.log(err.message);
            }
        });
    };

    //Open page after browser is completly loaded
    let openPage = function (browser) {
        return new Promise(async function (resolve, reject) {
            try {
                const page = await browser.newPage();
                await page.goto(url, {
                    waitUntil: 'domcontentloaded'
                });
            
                console.log("Create PDF Step 2) New page successfully opened")
                return resolve(page);
            } catch (err) {
                return reject("Create PDF Step 2) New page failed to open: " + err.message);
                console.log(err.message);
            }
        });
    };

    //Go to the URL of the report bundle after succesful page load
    let openURL = function (page) {
        return new Promise(async function (resolve, reject) {
            try {
                console.log("Create PDF Step 3) URL successfully opened");
                await page.pdf({
                    path: saveLocation + '/temp.pdf',
                    printBackground: 'True',
                    //   format: 'Letter',
                    width: 804,
                    height: 1044,
                    margin: {
                        top: 18,
                        bottom: 18,
                        left: 18,
                        right: 18
                    }
                });
                console.log("Create PDF Step 4) PDF successfully saved");
                return resolve("OK");
            } catch (err) {
                return reject("PDF failed to Save: " + err.message);
                console.log(err.message);
            }
        });
    };

    //Close Browser
    let resetBrowser = function (browser) {
        return new Promise(async function (resolve, reject) {
            try {
                if (browser != null) {
                    await browser.close();
                    console.log("Create PDF Step Optional) browser closed");
                }
                console.log("Create PDF Step 5) Completed reset");
                return resolve("Completed successful reset");
            } catch (err) {
                return reject("Create PDF Step 5) Reset failed: " + err.message);
                console.log(err.message);
            }
        })
    };

    // Step through all promises to ensure end result.
    openBrowser().then(function (result) {
        browser = result;
        return openPage(browser);
    }).then(function (result) {
        page = result;
        return openURL(page);
    }).then(function () {
        return resetBrowser(browser);
    }).then(function (result) {
        console.log('Complete: ' + result);
    })
    process.exit
};

module.exports = router;