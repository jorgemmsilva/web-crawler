# Web Crawler
A webcrawler implementation using Node.js

Prerequisites
--------------
* [**node**](https://nodejs.org/) and [**npm**](http://npmjs.org/) installed

Setup
--------------

####Clone the repository
`git clone https://github.com/jorgemmsilva/web-crawler.git`

####cd into the directory
`cd web-crawler`

####Install dependencies
`npm install`

####Run tests (optional)
`npm test`

####Run the example (optional)
`node main`

The example will crawl reddit.com and output the result to a JSON file (output.json) - by default

This is customisable by passing command line arguments:

```bash
node main --url <URL TO CRAWL> --timeout <TIMEOUT> --maxpages <MAXIMUM NUMBER OF PAGES TO CRAWL> --output <OUTPUT FILE> (--array)
```


For instance, this will crawl google.com for a maximum of 1000 pages, with the timeout limit of 2000ms for each request, the output will be written to a file named google.json (in array format):

`node main http://google.com -t 2000 -m 1000 -o google.json -a`

Usage
--------------

####Include
```javascript
var Crawler = require('<path_to_src_folder>/Crawler')
```


####Constructor
```javascript
new Crawler(url,timeout,maxPages)
```

All the parameters are optional.

By default, the timeout value is 5000ms and the maximum number of pages is 99999

####Simple usage - Crawl a single page (no recursivity)
```javascript
new Crawler().crawlPage( {"url" : "http://shitty.website/"}, (page, err) => {
	if (err) throw err

	//use page object data here

})
```


####Full functionality - Crawl a webpage recursively

```javascript
var crawler = new Crawler("http://google.com")
crawler.crawl( OUTPUT_IN_ARRRAY , function(result, error){
	if (err) throw err

	//use result object data here

})
```

`OUTPUT_IN_ARRRAY` should be `true` if you want the end result to be returned as an array, `false` otherwise (will return a tree of objects)



##Output

####Default result structure
the page object structure outputed by the crawler will look like this:

```javascript
({
  "baseUrl": "http://shitty.website",
  "sitemapRoot": {
	  "url": "http://shitty.website",
	  "relativeUrl": "/",
	  "resources": [< list of static assets present on the page >],
	  "childPages": {< list of accessible pages (within the same domain) >},
	  "visited": true,
	  "httpStatus": 200
  },
  "visitedUrls": 1,
  "timeout": 5000
})
```

####Array listing
```javascript
[
{'url' : '/page1', 'assets' : [asset1, asset2, ...]},
{'url' : '/page2', 'assets' : [asset1, asset2, ...]},
...
]
```



Next Steps
--------------

cut query parameters from child pages (as an option)?

refactor using async.parallel (https://github.com/caolan/async)

publish npm module?


Notes
--------------

Thank you for reading, feedback is appreciated.
If you are interested, feel free to open a issue or a pull request
