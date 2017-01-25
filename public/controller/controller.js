var Genie = angular.module('Genie', []); //index.ejs에서 ng-app="Genie"로 썼으니까
Genie.controller('helloants', ['$http','$scope', function($http,$scope){ //ng-controller="helloants"로 썼으니까

var refresh = function() {
$http.get("/image").success(function(response){ // server.js에 접근
$scope.imageList = response;
});
};

refresh(); // ng-controller 가 시작될때 함수 실행
}]);
