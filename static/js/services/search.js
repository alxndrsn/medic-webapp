var _ = require('underscore');

(function () {

  'use strict';

  var inboxServices = angular.module('inboxServices');

  inboxServices.factory('Search',
    function(
      $q,
      DB,
      GenerateSearchRequests,
      GetDataRecords
    ) {

      'ngInject';

      var _currentQuery = {};

      // Silently cancel repeated queries.  We decide if the query is repeated
      // by checking if its search string and scope are identical to the
      // previous query.
      var debounce = function(type, filters, requests) {
        var queryString = JSON.stringify(requests);
        if (type === _currentQuery.type &&
            filters === _currentQuery.filters &&
            queryString === _currentQuery.queryString) {
          return true;
        }
        _currentQuery.type = type;
        _currentQuery.filters = filters;
        _currentQuery.queryString = queryString;
        return false;
      };

      // Get the subset of rows, in appropriate order, according to options.
      var getPageRows = function(type, rows, options) {
        var start;
        var end;
        if (type === 'reports') {
          // descending
          end = rows.length - options.skip;
          start = end - options.limit;
          if (start < 0) {
            start = 0;
          }
        } else {
          // ascending
          start = options.skip;
          end = start + options.limit;
        }
        return _.sortBy(rows, 'value').slice(start, end);
      };

      // Get the intersection of the results of multiple search queries.
      // responses = [searchResults1, searchResult2, ...]
      var getIntersection = function(responses) {
        var intersection = responses.pop();
        intersection = _.uniq(intersection, 'id');
        _.each(responses, function(response) {
          intersection = _.reject(intersection, function(row) {
            return !_.findWhere(response, { id: row.id });
          });
        });
        return intersection;
      };

      // Queries view as specified by request object coming from GenerateSearchQueries.
      // request = {view, union: true, paramSets: [params1, ...] }
      // or
      // request = {view, params: {...} }
      var queryView = function(request) {
        var paramSets = request.union ? request.paramSets : [ request.params ];
        return $q.all(paramSets.map(function(params) {
          return DB().query(request.view, params);
        }))
          .then(function(data) {
            return _.flatten(data.map(function(datum) {
              return datum.rows;
            }), true);
          });
      };

      var queryViewPaginated = function(request, options) {
        request.params = request.params || {};
        request.params.limit = options.limit;
        request.params.skip = options.skip;
        return queryView(request);
      };

      var getRows = function(type, requests, options) {
        if (requests.length === 1 && requests[0].ordered) {
          // 1 ordered view - let the db do the pagination for us
          return queryViewPaginated(requests[0], options);
        }
        // multiple requests - have to manually paginate
        return $q.all(requests.map(queryView))
          .then(getIntersection)
          .then(_.partial(getPageRows, type, _, options));
      };

      var generateRequests = function(type, filters, options) {
        var requests = GenerateSearchRequests(type, filters);
        if (!options.force && debounce(type, filters, requests)) {
          return [];
        }
        return requests;
      };

      return function(type, filters, options) {
        options = options || {};
        _.defaults(options, {
          limit: 50,
          skip: 0
        });
        return $q.resolve(generateRequests(type, filters, options))
          .then(function(requests) {
            return getRows(type, requests, options);
          })
          .then(function(results) {
            return GetDataRecords(_.pluck(results, 'id'), options);
          })
          .then(function(results) {
            _currentQuery = {};
            return results;
          })
          .catch(function(err) {
            _currentQuery = {};
            throw err;
          });
      };
    }
  );

}());
