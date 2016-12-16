'use strict';

var _semver = require('../semver.js');

describe('semver', function () {
  describe('stringToVersion', function () {
    it('parses concrete versions', function () {
      expect((0, _semver.stringToVersion)('v0.0.0')).toEqual({ major: 0, minor: 0, patch: 0 });
      expect((0, _semver.stringToVersion)('v0.0.3')).toEqual({ major: 0, minor: 0, patch: 3 });
      expect((0, _semver.stringToVersion)('v0.2.3')).toEqual({ major: 0, minor: 2, patch: 3 });
      expect((0, _semver.stringToVersion)('v1.2.3')).toEqual({ major: 1, minor: 2, patch: 3 });
    });

    it('parses ranged versions', function () {
      expect((0, _semver.stringToVersion)('v0.0.0').range).toBe(undefined);
      expect((0, _semver.stringToVersion)('>=v0.0.0').range).toBe('>=');
      expect((0, _semver.stringToVersion)('<=v0.0.0').range).toBe('<=');
    });

    it('parses wildcard versions', function () {
      expect((0, _semver.stringToVersion)('v1.2.x')).toEqual({ major: 1, minor: 2, patch: 'x' });
      expect((0, _semver.stringToVersion)('v1.x.3')).toEqual({ major: 1, minor: 'x', patch: 3 });

      // No wildcards on majors. This is rarely useful, so we assume it's a
      // mistake for now.
      expect(function () {
        return (0, _semver.stringToVersion)('vx.2.3');
      }).toThrow();
    });

    it('parses a little of everything', function () {
      expect((0, _semver.stringToVersion)('>=v1.2.x')).toEqual({
        range: '>=',
        major: 1,
        minor: 2,
        patch: 'x'
      });
    });
  });

  describe('sortVersions', function () {
    it('sorts versions correctly', function () {
      var a = (0, _semver.stringToVersion)('v2.x.x');
      var b = (0, _semver.stringToVersion)('v2.1.x');
      var res = (0, _semver.sortVersions)(a, b);
      expect(res).toEqual(-1);

      a = (0, _semver.stringToVersion)('v1.x.x');
      b = (0, _semver.stringToVersion)('v2.1.x');
      res = (0, _semver.sortVersions)(a, b);
      expect(res).toEqual(-1);

      a = (0, _semver.stringToVersion)('v1.2.1');
      b = (0, _semver.stringToVersion)('v0.2.0');
      res = (0, _semver.sortVersions)(a, b);
      expect(res).toEqual(1);
    });
  });

  describe('disjointVersions', function () {
    it('checks disjointness of versions correctly', function () {
      var a = (0, _semver.stringToVersion)('v2.x.x');
      var b = (0, _semver.stringToVersion)('v2.1.x');
      var res = (0, _semver.disjointVersions)(a, b);
      expect(res).toEqual(false);

      a = (0, _semver.stringToVersion)('v1.x.x');
      b = (0, _semver.stringToVersion)('v2.1.x');
      res = (0, _semver.disjointVersions)(a, b);
      expect(res).toEqual(true);

      a = (0, _semver.stringToVersion)('>=v1.2.1');
      b = (0, _semver.stringToVersion)('>=v0.2.0');
      res = (0, _semver.disjointVersions)(a, b);
      expect(res).toEqual(false);

      a = (0, _semver.stringToVersion)('<=v1.2.1');
      b = (0, _semver.stringToVersion)('<=v0.2.0');
      res = (0, _semver.disjointVersions)(a, b);
      expect(res).toEqual(false);

      a = (0, _semver.stringToVersion)('<=v1.2.1');
      b = (0, _semver.stringToVersion)('>=v0.2.0');
      res = (0, _semver.disjointVersions)(a, b);
      expect(res).toEqual(false);

      a = (0, _semver.stringToVersion)('>=v1.2.1');
      b = (0, _semver.stringToVersion)('<=v0.2.0');
      res = (0, _semver.disjointVersions)(a, b);
      expect(res).toEqual(true);

      a = (0, _semver.stringToVersion)('>=v1.2.1');
      b = (0, _semver.stringToVersion)('>=v0.2.0_<=v1.2.0');
      res = (0, _semver.disjointVersions)(a, b);
      expect(res).toEqual(true);

      a = (0, _semver.stringToVersion)('>=v1.2.1');
      b = (0, _semver.stringToVersion)('>=v0.2.0_<=v1.2.x');
      res = (0, _semver.disjointVersions)(a, b);
      expect(res).toEqual(false);

      a = (0, _semver.stringToVersion)('>=v1.2.1');
      b = (0, _semver.stringToVersion)('>=v0.2.x_<=v1.2.0');
      res = (0, _semver.disjointVersions)(a, b);
      expect(res).toEqual(true);

      a = (0, _semver.stringToVersion)('>=v1.2.x');
      b = (0, _semver.stringToVersion)('>=v0.2.x_<=v1.2.0');
      res = (0, _semver.disjointVersions)(a, b);
      expect(res).toEqual(false);

      a = (0, _semver.stringToVersion)('<=v1.3.x_>=v1.2.1');
      b = (0, _semver.stringToVersion)('>=v0.2.x_<=v1.2.0');
      res = (0, _semver.disjointVersions)(a, b);
      expect(res).toEqual(true);
    });
  });

  describe('disjointVersionsAll', function () {
    it('checks mutual disjointness of versions correctly', function () {
      var a = (0, _semver.stringToVersion)('v1.1.x');
      var b = (0, _semver.stringToVersion)('v0.1.x');
      var c = (0, _semver.stringToVersion)('v1.x.x');
      var res = (0, _semver.disjointVersionsAll)([a, b, c]);
      expect(res).toEqual(false);
    });
  });

  describe('isSatVersion', function () {
    it('checks satisfiability of versions correctly', function () {
      var res = (0, _semver.isSatVersion)((0, _semver.stringToVersion)('v1.0.0'));
      expect(res).toEqual(true);

      res = (0, _semver.isSatVersion)((0, _semver.stringToVersion)('<=v0.1.x'));
      expect(res).toEqual(true);

      res = (0, _semver.isSatVersion)((0, _semver.stringToVersion)('>=v1.1.x'));
      expect(res).toEqual(true);

      res = (0, _semver.isSatVersion)((0, _semver.stringToVersion)('>=v1.1.x_<=v0.1.x'));
      expect(res).toEqual(false);

      res = (0, _semver.isSatVersion)((0, _semver.stringToVersion)('<=v0.1.x_>=v1.1.x'));
      expect(res).toEqual(false);

      res = (0, _semver.isSatVersion)((0, _semver.stringToVersion)('v0.1.x_>=v1.1.x'));
      expect(res).toEqual(false);

      res = (0, _semver.isSatVersion)((0, _semver.stringToVersion)('v1.1.x_<=v0.1.x'));
      expect(res).toEqual(false);
    });
  });
});