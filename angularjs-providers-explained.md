| Provider   | Singleton| Instantiable | Configurable|
|------------|----------|--------------|-------------|
| Constant   | Yes      | No           | No          |
| Value      | Yes      | No           | No          |
| Service    | Yes      | No           | No          |
| Factory    | Yes      | Yes          | No          |
| Decorator  | Yes      | No?          | No          |
| Provider   | Yes      | Yes          | Yes         |

# Constant
A constant can be injected everywhere. A constant can not be intercepted by a decorator, that means that the value of a constant **should never be changed** (though it is still possible to change it programmatically in Angular 1.x).

```js
angular.module('app', []);
 
app.constant('MOVIE_TITLE', 'The Matrix');
 
.controller('MyController', function (MOVIE_TITLE) {
  expect(MOVIE_TITLE).toEqual('The Matrix');
});
```
# Value
A value is nothing more than a simple injectable value. The value can be a string, number but also a function. Value differs from constant in that value can not be injected into configurations, but it can be intercepted by decorators.

```js
angular.module('app', []);

.value('movieTitle', 'The Matrix');

.controller('MyController', function (movieTitle) {
  expect(movieTitle).toEqual('The Matrix');
})
```

# Service
Use Service when you need just a simple object such as a Hash, for example {foo:1, bar:2} It's easy to code, but you cannot instantiate it. A service is an injectable constructor. If you want you can specify the dependencies that you need in the function. A service is a singleton and will only be created once by AngularJS. Services are a great way for communicating between controllers like sharing data.

```js
angular.module('app' ,[]);
 
.service('movie', function () {
  this.title = 'The Matrix';
});
 
.controller('MyController', function (movie) {
  expect(movie.title).toEqual('The Matrix');
});
```


# Factory

A factory is an injectable function. A factory is a lot like a service in the sense that it is a singleton and dependencies can be specified in the function. The difference between a factory and a service is that a factory injects a plain function so AngularJS will call the function and a service injects a constructor. A constructor creates a new object so new is called on a service and with a factory you can let the function return anything you want. As you will see later on, a factory is a provider with only a $get method.

```js
angular.module('app', []);
 
.factory('movie', function () {
  return {
    title: 'The Matrix';
  }
});
 
.controller('MyController', function (movie) {
  expect(movie.title).toEqual('The Matrix');
});
```

```js
.factory('catalogueService', function($rootScope, $http) {
  // We first define a private API for our service.

  // Private vars.
  var items = [];

  // Private methods.
  function add( id ) {
    $http.put( $rootScope.apiURL, {id:id} )
    .success(function(data,status,headers,config) { items.push(data); })
    .then(function(response) { console.log(response.data); });
  }

  function store( obj ) {
    // do stuff
  }

  function remove( obj ) {
    // do stuff
  }

  // We now return a public API for our service.
  return {
    add: add,
    store: store,
    rm: remove
  };
};
```

# Decorator
A decorator can modify or encapsulate other providers. There is one exception and that a constant cannot be decorated.
```js
var app = angular.module('app', []);
 
app.value('movieTitle', 'The Matrix');
 
app.config(function ($provide) {
  $provide.decorator('movieTitle', function ($delegate) {
    return $delegate + ' - starring Keanu Reeves';
  });
});
 
app.controller('MyController', function (movieTitle) {
  expect(movieTitle).toEqual('The Matrix - starring Keanu Reeves');
});
```

#Provider
A provider is the most sophisticated method of all the providers. It allows you to have a complex creation function and configuration options. A provider is actually a configurable factory. The provider accepts an object or a constructor.

```js
var app = angular.module('app', []);
 
app.provider('movie', function () {
  var version;
  return {
    setVersion: function (value) {
      version = value;
    },
    $get: function () {
      return {
          title: 'The Matrix' + ' ' + version
      }
    }
  }
});
 
app.config(function (movieProvider) {
  movieProvider.setVersion('Reloaded');
});
 
app.controller('MyController', function (movie) {
  expect(movie.title).toEqual('The Matrix Reloaded');
});
```
### Summary
* All the providers are instantiated only once. That means that they are all singletons.
* All the providers except constant can be decorated.
* A constant is a value that can be injected everywhere. The value of a constant can never be changed.
* A value is just a simple injectable value.
* A service is an injectable constructor.
* A factory is an injectable function.
* A decorator can modify or encapsulate other providers except a constant.
* A provider is a configurable factory.

Extracted from http://blog.xebia.com/2013/09/01/differences-between-providers-in-angularjs/