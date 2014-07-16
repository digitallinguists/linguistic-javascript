//'use strict';

var bibApp = angular.module('tutorialApp', ['ngRoute']);


bibApp.config(function($routeProvider) {
        $routeProvider.
          when('/', {
            templateUrl: 'biblist.html',
            controller: 'ArticlesCtrl'
          }).
          when('/:verseid', {
            templateUrl: 'bibdetail.html',
            controller: 'ArticleCtrl'
          }).
          otherwise({
            redirectTo: '/'
          });
      });



bibApp.factory('verses', function($http){

var cachedData;

function getData(callback){
      if(cachedData) {
        callback(cachedData);
      } else {
        $http.get('deu-x-bible-elberfelder1871-v1.txt').success(function(data){
          //cachedData = data;
          //console.log(data);
          lines = data.split('\n');
          verses = [];
          lines.forEach(function(line){
              // ignore comments
              if(line.indexOf('#') != 0){
                  // check whether line contains a TAB
                  if(line.indexOf('\t') > -1){
                      linesplit = line.split('\t',2);
                      var entry = {"ID": linesplit[0],"TEXT": linesplit[1]};
                      verses.push(entry);
                  }

              }
          });
          cachedData = verses;
          console.log(cachedData[1]);
          callback(verses);
        });
      }
    }

return {
  list: getData,
  find: function(id, callback){
    getData(function(data) {
      var verse = data.filter(function(entry){
        return entry.ID === id;
      })[0];
      //console.log(article);
      callback(verse);
    });
  }
};
});

bibApp.controller('ArticlesCtrl', function ($scope, verses){

    $scope.reverse = true;
    $scope.totalDisplayed = 20;

    $scope.loadMore = function () {
      $scope.totalDisplayed += 20;  
    };
    verses.list(function(verses) {
      $scope.verses = verses;
    });
});

bibApp.controller('ArticleCtrl', function ($scope, $routeParams, verses){
    $scope.verseid = $routeParams.verseid;
    verses.find($routeParams.verseid, function(verse) {
      $scope.verse = verse;
      console.log(verse);
    });
});