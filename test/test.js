var chai = require('chai')
var expect = chai.expect
var Crawler = require('../src/Crawler')

describe('Crawler', () =>  {


  it('crawl a single basic page', (done) => {
    new Crawler().crawlPage( {"url" : "http://motherfuckingwebsite.com/"}, (page, err) => {
      if (err) throw err

      expect(page).to.eql({ "url": "http://motherfuckingwebsite.com/",
                            "assets": [],
                            "childPages": {},
                            "visited": true,
                            "httpStatus": 200
                          })
      done()
    })
  })

  it('crawl a single page for static images', (done) => {

    new Crawler().crawlPage( {"url" : "http://shitty.website/"}, (page, err) => {
      if (err) throw err

      var shittyResources = [
              "index_files/image001.gif","index_files/image002.gif","index_files/image060.gif","index_files/image014.gif","index_files/image006.gif","index_files/image007.gif","index_files/image008.gif","index_files/image009.gif","index_files/image011.gif","index_files/image012.gif","index_files/image013.gif",
              "index_files/image010.gif","index_files/image015.gif","index_files/image016.gif","index_files/image026.gif","index_files/image020.gif","index_files/image021.gif","index_files/image022.gif","index_files/image023.gif","index_files/image024.gif","index_files/image027.gif","index_files/image028.gif","index_files/image029.gif","index_files/image004.gif","index_files/image031.gif","index_files/image050.gif","index_files/image036.gif","index_files/image038.gif","index_files/image035.gif",
              "index_files/image032.gif","index_files/image033.gif","index_files/image034.gif","index_files/image037.gif","index_files/image042.gif","index_files/image017.gif","index_files/image039.gif","index_files/image043.gif","index_files/image044.gif","index_files/image045.gif","index_files/image046.gif","index_files/image047.gif","index_files/image048.gif","index_files/image049.gif","index_files/image051.gif",
              "index_files/image052.gif","index_files/image093.gif","index_files/image067.gif","index_files/image053.gif","index_files/image054.gif","index_files/image094.gif","index_files/image068.gif","index_files/image056.gif","index_files/image057.gif","index_files/image085.gif","index_files/image086.gif","index_files/image061.gif","index_files/image062.gif","index_files/image055.gif","index_files/image064.gif","index_files/image090.gif","index_files/image065.gif","index_files/image066.gif",
              "index_files/image070.gif","index_files/image071.gif","index_files/image063.gif","index_files/image072.gif","index_files/image073.gif","index_files/image074.gif","index_files/image075.gif","index_files/image076.gif","index_files/image077.gif","index_files/image078.gif","index_files/image079.gif",
              "index_files/image080.gif","index_files/image030.gif","index_files/image081.gif","index_files/image082.gif","index_files/image083.gif","index_files/image089.gif","index_files/image091.gif","index_files/image003.gif","index_files/image084.gif","index_files/image087.gif","index_files/image092.gif","index_files/image018.gif","index_files/image019.gif","index_files/image025.gif",
              "index_files/image088.gif","index_files/image095.gif","index_files/image096.gif","index_files/image097.gif","index_files/image098.gif","index_files/image005.gif","index_files/image041.gif","index_files/image040.gif","index_files/image069.gif"
          ]

      expect(page.assets).to.eql(shittyResources)
      done()
    })
  })

  it('Crawl all child pages', (done) => {
    var page =  {
                    "url": "http://motherfuckingwebsite.com",
                    "relativeUrl": "/",
                    "assets": [],
                    "childPages" : {
                                "/": {
                                    "url": "http://motherfuckingwebsite.com",
                                    "relativeUrl": "/",
                                    "assets": [],
                                    "childPages": {},
                                    "visited": false
                                },
                                "/?": {
                                    "url": "http://motherfuckingwebsite.com",
                                    "relativeUrl": "/?",
                                    "assets": [],
                                    "childPages": {},
                                    "visited": false
                                }
                              },
                    "visited": true,
                    "httpStatus": 200
                }

    var expectedPage = {  url: 'http://motherfuckingwebsite.com',
                          relativeUrl: '/',
                          assets: [],
                          childPages:
                           { '/':
                              { url: 'http://motherfuckingwebsite.com',
                                relativeUrl: '/',
                                assets: [],
                                childPages: {},
                                visited: true,
                                httpStatus: 200 },
                             '/?':
                              { url: 'http://motherfuckingwebsite.com',
                                relativeUrl: '/?',
                                assets: [],
                                childPages: {},
                                visited: true,
                                httpStatus: 200 }
                            },
                          visited: true,
                          httpStatus: 200
                        }

    new Crawler().crawlAllChildPages( page , (p, err) => {
        if(err) throw err
        expect(p).to.eql(expectedPage)
        done()
    })
  })


  it('allChildPagesHaveBeenVisited', () =>  {
    var page1 = {
                  "visited": true
                }


    var page2 = {
                  "visited": true,
                  "childPages" : {
                    "childPageRelativeUrl": {
                        "visited": false
                    }
                  }
                }
    var page3 = {
                  "visited": true,
                  "childPages" : {
                    "childPageRelativeUrl": {
                        "visited": true
                    },
                    "childPageRelativeUrl2": {
                        "visited": true
                    },
                    "childPageRelativeUrl3": {
                        "visited": true
                    }
                  }
                }


    var crawler = new Crawler("no url")

    expect(crawler.allChildPagesHaveBeenVisited(page1)).to.equal(true)
    expect(crawler.allChildPagesHaveBeenVisited(page2)).to.equal(false)
    expect(crawler.allChildPagesHaveBeenVisited(page3)).to.equal(true)



  })

  it('didCralwingEndRecursive', () =>{

    var crawler = new Crawler("no url")

    var page = {
                  "visited" : true,
                  childPages : {}
                }

    expect(crawler.didCralwingEndRecursive(page)).to.equal(true)

    page = {
              "visited" : true,
              childPages : {
                "/childPage1" : {
                  "visited" : true
                },
                "/childPage2" : {
                  "visited" : true
                },
                "/childPage3" : {
                  "visited" : true
                },
                "/childPage4" : {
                  "visited" : true
                }
              }
            }

    expect(crawler.didCralwingEndRecursive(page)).to.equal(true)

    page = {
              "visited" : true,
              childPages : {
                "/childPage1" : {
                  "visited" : true
                },
                "/childPage2" : {
                  "visited" : true
                },
                "/childPage3" : {
                  "visited" : true
                },
                "/childPage4" : {
                  "visited" : false
                }
              }
            }

    expect(crawler.didCralwingEndRecursive(page)).to.equal(false)

    page = {
              "visited" : true,
              childPages : {
                "/childPage1" : {
                  "visited" : true
                },
                "/childPage2" : {
                  "visited" : true,
                  childPages : {
                    "/..." : {
                      visited: true,
                      childPages : {
                        "/..." : {
                          visited : true,
                          childPages : {
                            "/..." : {
                              visited : true,
                              childPages : {
                                "/..." : {
                                  visited : true
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                },
                "/childPage3" : {
                  "visited" : true
                },
                "/childPage4" : {
                  "visited" : true
                  }
                }
              }
            }

    expect(crawler.didCralwingEndRecursive(page)).to.equal(true)

    page = {
              "visited" : true,
              childPages : {
                "/childPage1" : {
                  "visited" : true
                },
                "/childPage2" : {
                  "visited" : true,
                  childPages : {
                    "/..." : {
                      visited: true,
                      childPages : {
                        "/..." : {
                          visited : true,
                          childPages : {
                            "/..." : {
                              visited : true,
                              childPages : {
                                "/..." : {
                                  visited : false
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                },
                "/childPage3" : {
                  "visited" : true
                },
                "/childPage4" : {
                  "visited" : true
                  }
                }
              }
            }

    expect(crawler.didCralwingEndRecursive(page)).to.equal(false)


  })

  it('getArrayFromPage', () => {

      var page = {  url: 'website.url',
                    relativeUrl: '/',
                    assets: ["asset1"],
                    childPages:
                     { '/1':
                        { url: 'website.url/1',
                          relativeUrl: '/1',
                          assets: ["asset2"],
                          childPages: {},
                          visited: true,
                          httpStatus: 200 },
                       '/2':
                        { url: 'website.url/2',
                          relativeUrl: '/2',
                          assets: ["asset3","asset4"],
                          childPages: {},
                          visited: true,
                          httpStatus: 200 }
                      },
                    visited: true,
                    httpStatus: 200
                  }

      var expectedArray = [ { url: '/', assets: [ 'asset1' ] },
                            { url: '/1', assets: [ 'asset2' ] },
                            { url: '/2', assets: [ 'asset3', 'asset4' ] }
                          ]

      var arr = new Crawler().getArrayFromPage(page)

      expect(arr).to.eql(expectedArray)
  })


})
