"use strict"
const commandLineArgs = require('command-line-args')
var fs = require('fs');
var Crawler = require('./src/Crawler')

var default_url = "http://reddit.com"
var default_output = "output.json"

//read console params
const optionDefinitions = [
    { name: 'url', alias: 'u', type: String, defaultOption: true },
    { name: 'timeout', alias: 't', type: Number },
    { name: 'maxpages', alias: 'm', type: Number },
    { name: 'output', alias: 'o', type: String },
    { name: 'array', alias: 'a', type: Boolean }

]
const options = commandLineArgs(optionDefinitions)


//initialize crawler object
var crawler = new Crawler((options.url || default_url),options.timeout,options.maxPages)

console.log("Crawling " + (options.url || default_url))

//initiate crawling and wait for callback
crawler.crawl(options.array, (result , err) => {
   if (err) console.log(err)

   fs.writeFile( (options.output || default_output), JSON.stringify(result, null, 2), function (err) {
     if (err) return console.log(err);

     console.log("Done! Visited" + ( (options.array) ? result.length : result.visitedUrls) + " urls from " + (options.url || default_url));
     console.log('Crawl result written to: ' + (options.output || default_output));
   });
})
