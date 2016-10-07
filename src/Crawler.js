"use strict"
var request = require('request')
var cheerio = require('cheerio')
var URL = require('url-parse')

var DEFAULT_TIMEOUT = 5000
var DEFAULT_MAXPAGES = 99999


class Crawler {

    constructor(url,timeout,maxPages) {
        if(url){
            const pathArray = url.split( '/' )
            const protocol = pathArray[0]
            const host = pathArray[2]
            this.baseUrl = protocol + '//' + host

            // console.log("Base url: " + this.baseUrl)

            //sitemap will be a tree of pages and base URL is the root of the tree
            this.sitemapRoot = { 'url'          : this.baseUrl,
                                 'relativeUrl'  : '/',
                                 'assets'    : [],
                                 'childPages'   : {},
                                 'visited'    : false
                                }
        }
        this.timeout = DEFAULT_TIMEOUT
        this.maxPages = DEFAULT_MAXPAGES
        this.visitedUrls = 0

        if (timeout){
            this.timeout = timeout
        }
        if (maxPages) {
            this.maxPages = maxPages
        }
    }

    getArrayFromPageRecursive(page){
        var arr = [{  'url'       : page.relativeUrl,
                      'assets'    : page.assets}]

        for (var p in page.childPages) {
            arr = arr.concat( this.getArrayFromPageRecursive(page.childPages[p]) )
        }
        return arr
    }

    getArrayFromPage(page){
        return this.getArrayFromPageRecursive(page)
    }

    existsInTree(url, page) {
        if(page.relativeUrl == url || ( url in Object.keys(page.childPages)) ) {
            //url found
            return true
        } else {
            // search for url in child pages
            for(var p in page.childPages){
                if( this.existsInTree(url,page.childPages[p]) ) {
                    return true
                }
            }
            return false
        }
    }

    allChildPagesHaveBeenVisited(page){
        if(page.childPages){
            for( var p in page.childPages){
                if( !page.childPages[p].visited ){
                    return false
                }
            }
            return true
        } else {
            return true
        }
    }

    didCralwingEndRecursive(page){
        if(!this.allChildPagesHaveBeenVisited(page)) {
            return false
        } else {
            for( var p in page.childPages) {
                if(!this.didCralwingEndRecursive(page.childPages[p])){
                    return false
                }
            }
            return true
        }
    }

    didCralwingEnd() {
        //check if there arent pages to be visited
        if(this.sitemapRoot.visited){
            return this.didCralwingEndRecursive(this.sitemapRoot)
        } else {
            return false
        }
    }

    getAssetsFromBody($){

        var assets = []

        //icons and css
        Array.from($("link")).forEach( (obj) => {
            var href = obj.attribs.href
            var rel = obj.attribs.rel

            if(href && rel && (rel.indexOf('icon') > -1 || rel.indexOf('stylesheet') > -1)){
                assets.push(href)
            }
        })

        //scripts
        Array.from($("script")).forEach( (obj) => {
            var src = obj.attribs.src
            if(src){
                assets.push(src)
            }
        })

        //images
        Array.from($("img")).forEach( (obj) => {
            var src = obj.attribs.src
            if(src){
                assets.push(src)
            }
        })

        return assets
    }

    isValidHref(href) {
        return  href.length > 1 &&
                href.indexOf('//') != 0 &&
                href[0] != '?' &&
                href[1] != '?' &&
                href.indexOf('javascript:') == -1 &&
                href[0]!= '#' &&
                href.indexOf('http://') == -1 &&
                href.indexOf('https://') == -1 &&
                !this.existsInTree(href,this.sitemapRoot)
    }

    getChildPagesFromBody($){
        var childPages = {}
        Array.from($("a[href]")).forEach( (obj) => {

            var href = obj.attribs.href

            //remove baseUrl from href
            if (href.indexOf(this.baseUrl) > -1) {
                href = href.substr(this.baseUrl.length,href.length)
            }

            //remove anchor tag from href
            const aux = href.lastIndexOf('#')
            if (aux > -1) {
                href = href.substr(0,aux)
            }

            //create a child page for each href of the same domain that doesnt exist in the tree already
            if ( this.isValidHref(href) ){

                if (href[0] != '/') {
                    href = '/' + href
                }

                childPages[href] = {    'url'          : this.baseUrl + href,
                                        'relativeUrl'  : href,
                                        'assets'       : [],
                                        'childPages'   : {},
                                        'visited'      : false
                                    }

            }
        })

        return childPages
    }


    crawlPage(page, done) {
        var self = this

        if(page.visited) done(page)

        request(page.url, {timeout: this.timeout}, function(err, res, body) {
            page.visited = true
            self.visitedUrls++
            if(err){
                page.httpStatus = err.code
                done(page,Error("Error crawling page: " + page.relativeUrl + " - " + err))
            } else {

                // Check if HTTP status code is 200 OK
                if(res) {

                    if (res.statusCode === 200) {
                        //parse response body
                        var $ = cheerio.load(body)

                        //get page assets
                        page.assets = self.getAssetsFromBody($)

                        //get child pages
                        if (self.visitedUrls < self.maxPages){
                            page.childPages = self.getChildPagesFromBody($)
                        }
                    }

                    page.httpStatus = res.statusCode
                    done(page)

                } else {
                    page.httpStatus = 'UNAVAILABLE'
                    done(page,"PAGE UNAVAILABLE (RES is undefined) for page: " + page.url)
                }
            }
        })
    }

    crawlAllChildPages(page,done) {
        // console.log('Visiting child pages from ' + page.relativeUrl);
        var nPromises = 0
        var fulfilledPromises = 0

        var hasCrawlEnded = () => {
            fulfilledPromises++

            // console.log("Finished crawling child page  ("+fulfilledPromises+"/"+nPromises+")  from: " + page.relativeUrl);

            if (fulfilledPromises == nPromises){
                //finished crawling all the child pages
                done(page)
            }
        }

        for(var p in page.childPages) {
            nPromises++
            var promise = new Promise( (resolve, reject) => {

                // console.log("Started crawling page : " + page.childPages[p].relativeUrl);
                this.crawlPage(page.childPages[p], resolve)

            }).then((val) => {
                hasCrawlEnded()
            })
            .catch((err) => {
                console.log("Error:" + err);
            })
        }
    }

    crawlRecursive(page, done){
        var self = this
        var nPromises = 0
        var fulfilledPromises = 0

        var hasCrawlRecursiveEnded = () => {
            fulfilledPromises++

            if (fulfilledPromises == nPromises){

                if(Object.keys(page.childPages).length != 0){

                    for(var p in page.childPages) {

                        this.crawlRecursive(page.childPages[p],(pg, err) => {
                            // if (this.allChildPagesHaveBeenVisited(page)) {
                            if (self.didCralwingEnd()) {
                                done(page)
                            }
                        })
                    }
                } else {
                    //finished crawling all the child pages
                    done(page)
                }
            }

        }

        //crawl page
        this.crawlPage(page, (pg,err) =>{
            if (err){
                done(pg,err)
            } else {

                if(Object.keys(pg.childPages).length === 0) {
                    done(pg)
                }

                for(var p in pg.childPages) {
                    //repeat until there aren't more child pages to visit
                    nPromises++
                    var promise = new Promise( (resolve, reject) => {
                        this.crawlAllChildPages(pg.childPages[p], resolve())
                    }).then((val) => {
                        hasCrawlRecursiveEnded()
                    })
                    .catch((err) => {
                        console.log(err);
                    })

                }
            }
        })

    }

    crawl(toArray, done) {
        this.crawlRecursive(this.sitemapRoot, (page,err) => {
            if (!toArray) {
                done(this, err)
            } else {
                var arr = this.getArrayFromPage(this.sitemapRoot)
                done(arr,err)
            }
        })
    }

}

module.exports = Crawler
