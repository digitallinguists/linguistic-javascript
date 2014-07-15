//'use strict';

var bibApp = angular.module('tutorialApp', ['ngRoute']);

/*
  .controller('ArticlesCtrl', function($scope, $http){
    $http.get('basic.bib').then(function(articlesResponse) {
        //console.log(articlesResponse);
        b = new BibtexParser();
        b.setInput(articlesResponse.data);
        b.bibtex();
        $scope.reverse = true;
        //$scope.articles = b.entries;
        $scope.articles = [];
        for(var entry in b.entries){
            var currObj = b.entries[entry];
            currObj['bibkey'] = entry;
            $scope.articles.push(currObj);
        }
    });
  });
*/

bibApp.config(function($routeProvider) {
        $routeProvider.
          when('/', {
            templateUrl: 'biblist.html',
            controller: 'ArticlesCtrl'
          }).
          when('/:bibentry', {
            templateUrl: 'bibdetail.html',
            controller: 'ArticleCtrl'
          }).
          otherwise({
            redirectTo: '/'
          });
      });



bibApp.factory('articles', function($http){

var cachedData;

function getData(callback){
      if(cachedData) {
        callback(cachedData);
      } else {
        $http.get('basic.bib').success(function(data){
          //cachedData = data;
          b = new BibtexParser();
            b.setInput(data);
            b.bibtex();
            //$scope.articles = b.entries;
            articles = [];
            for(var entry in b.entries){
                var currObj = b.entries[entry];
                currObj['bibkey'] = entry;
                //currObj['bibtex'] = b.entries[entry];
                articles.push(currObj);
            }
            cachedData = articles;
          callback(articles);
          console.log(cachedData);
        });
      }
    }

return {
  list: getData,
  find: function(key, callback){
    getData(function(data) {
      var article = data.filter(function(entry){
        return entry.bibkey === key;
      })[0];
      //console.log(article);
      callback(article);
    });
  }
};
});

bibApp.controller('ArticlesCtrl', function ($scope, articles){

    $scope.reverse = true;
    $scope.totalDisplayed = 20;
    $scope.loadMore = function () {
      $scope.totalDisplayed += 20;  
    };
    articles.list(function(articles) {
      $scope.articles = articles;
    });
});

bibApp.controller('ArticleCtrl', function ($scope, $routeParams, articles){
    $scope.bibentry = $routeParams.bibentry;
    articles.find($routeParams.bibentry, function(article) {
      $scope.entry = article;
      //console.log(article);
      var output = [];
        for (var k in article){
            if(k != "entryType"){
                output.push(k + " = {" + article[k] + "}");
            }
        }
        
     $scope.bibtex =  "@" + article["entryType"] + "{" + $routeParams.bibentry + ",\n" + output.join(",\n") + "\n}";
     switch (article.entryType){

        case "JOURNAL":
            $scope.text = article.AUTHOR+". "+article.YEAR+". "+article.TITLE
            +". "+article.JOURNAL+", "+article.PAGES
            +".";
            break;

        case "BOOK":
            $scope.text = article.AUTHOR+". "+article.YEAR+". "+article.TITLE
            +". "+article.ADDRESS + ": " +article.PUBLISHER+".";
            break;

        case "INCOLLECTION":
            $scope.text = article.AUTHOR+". "+article.YEAR+". "+article.TITLE
            +". In: "+article.EDITOR + " (eds.), "+article.BOOKTITLE
            +". "+article.ADDRESS + ": " +article.PUBLISHER+", "+article.PAGES
            +".";
            break;

        default:
            $scope.text = article.AUTHOR+". "+article.YEAR+". "+article.TITLE
            +". "+article.ADDRESS + ": " +article.PUBLISHER+", "+article.PAGES
            +".";
     }
    });
});
