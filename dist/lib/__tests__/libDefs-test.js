'use strict';

var _node = require('../node.js');

var _libDefs = require('../libDefs.js');

var _semver = require('../semver.js');

var _git = require('../git.js');

jest.enableAutomock();
jest.unmock('../libDefs.js');
jest.unmock('../semver.js');
jest.unmock('semver');

/**
 * Jest's process of mocking in place fools Flow, so we use this as an explicit
 * escape hatch when we need to side-step Flow.
 */
function _mock(mockFn) {
  return mockFn;
}

describe('libDefs', function () {
  describe('ensureCacheRepo', function () {
    beforeEach(function () {
      _mock(_git.cloneInto).mockClear();
      _mock(_git.rebaseRepoMaster).mockClear();
      _libDefs._cacheRepoAssure.lastAssured = 0;
      _libDefs._cacheRepoAssure.pendingAssure = Promise.resolve();
    });

    pit('clones the repo if not present on disk', function _callee() {
      return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return regeneratorRuntime.awrap((0, _libDefs._ensureCacheRepo)());

            case 2:
              expect(_mock(_git.cloneInto).mock.calls).toEqual([[_libDefs._REMOTE_REPO_URL, _libDefs._CACHE_REPO_DIR]]);
              expect(_mock(_node.fs.writeFile).mock.calls.length).toBe(1);
              expect(_mock(_node.fs.writeFile).mock.calls[0][0]).toBe(_libDefs._LAST_UPDATED_FILE);

            case 5:
            case 'end':
              return _context.stop();
          }
        }
      }, null, undefined);
    });

    pit('does NOT clone the repo if already present on disk', function _callee2() {
      return regeneratorRuntime.async(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _mock(_node.fs.exists).mockImplementation(function (dirPath) {
                return dirPath === _libDefs._CACHE_REPO_DIR || dirPath === _libDefs._CACHE_REPO_GIT_DIR;
              });

              _context2.next = 3;
              return regeneratorRuntime.awrap((0, _libDefs._ensureCacheRepo)());

            case 3:
              expect(_mock(_git.cloneInto).mock.calls).toEqual([]);

            case 4:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, undefined);
    });

    pit('rebases if present on disk + lastUpdated is old', function _callee3() {
      return regeneratorRuntime.async(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _mock(_node.fs.exists).mockImplementation(function (dirPath) {
                return dirPath === _libDefs._CACHE_REPO_DIR || dirPath === _libDefs._CACHE_REPO_GIT_DIR;
              });
              _mock(_node.fs.readFile).mockImplementation(function (filePath) {
                if (filePath === _libDefs._LAST_UPDATED_FILE) {
                  return String(Date.now() - _libDefs._CACHE_REPO_EXPIRY - 1);
                }
              });

              _context3.next = 4;
              return regeneratorRuntime.awrap((0, _libDefs._ensureCacheRepo)());

            case 4:
              expect(_mock(_git.rebaseRepoMaster).mock.calls[0]).toEqual([_libDefs._CACHE_REPO_DIR]);

            case 5:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, undefined);
    });

    pit('does NOT rebase if on disk, but lastUpdated is recent', function _callee4() {
      return regeneratorRuntime.async(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _mock(_node.fs.exists).mockImplementation(function (dirPath) {
                return dirPath === _libDefs._CACHE_REPO_DIR || dirPath === _libDefs._CACHE_REPO_GIT_DIR || dirPath === _libDefs._LAST_UPDATED_FILE;
              });
              _mock(_node.fs.readFile).mockImplementation(function (filePath) {
                if (filePath === _libDefs._LAST_UPDATED_FILE) {
                  return String(Date.now());
                }
              });

              _context4.next = 4;
              return regeneratorRuntime.awrap((0, _libDefs._ensureCacheRepo)());

            case 4:
              expect(_mock(_git.rebaseRepoMaster).mock.calls).toEqual([]);

            case 5:
            case 'end':
              return _context4.stop();
          }
        }
      }, null, undefined);
    });
  });

  describe('updateCacheRepo', function () {
    beforeEach(function () {
      _mock(_git.rebaseRepoMaster).mockClear();
      _libDefs._cacheRepoAssure.lastAssured = 0;
      _libDefs._cacheRepoAssure.pendingAssure = Promise.resolve();
    });

    pit('rebases if present on disk + lastUpdated is old', function _callee5() {
      return regeneratorRuntime.async(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _mock(_node.fs.exists).mockImplementation(function (dirPath) {
                return dirPath === _libDefs._CACHE_REPO_DIR || dirPath === _libDefs._CACHE_REPO_GIT_DIR;
              });

              _mock(_node.fs.readFile).mockImplementation(function (filePath) {
                if (filePath === _libDefs._LAST_UPDATED_FILE) {
                  return String(Date.now() - _libDefs._CACHE_REPO_EXPIRY - 1);
                }
              });

              _context5.next = 4;
              return regeneratorRuntime.awrap((0, _libDefs.updateCacheRepo)());

            case 4:
              expect(_mock(_git.rebaseRepoMaster).mock.calls).toEqual([[_libDefs._CACHE_REPO_DIR]]);

            case 5:
            case 'end':
              return _context5.stop();
          }
        }
      }, null, undefined);
    });
  });

  describe('filterLibDefs', function () {
    function _generateMockLibdef(name, verStr, flowVerStr) {
      return {
        pkgName: name,
        pkgVersionStr: verStr,
        flowVersion: (0, _semver.stringToVersion)(flowVerStr),
        flowVersionStr: flowVerStr,
        path: '',
        testFilePaths: []
      };
    }

    describe('fuzzy filter', function () {
      it('filters on exact name', function () {
        var fixture = [_generateMockLibdef('mori', 'v0.3.x', '>=v0.22.x'), _generateMockLibdef('mori', 'v0.3.x', '>=v0.18.x')];
        var filtered = (0, _libDefs.filterLibDefs)(fixture, { type: 'fuzzy', term: 'mori' });
        expect(filtered).toEqual([fixture[1], fixture[0]]);
      });

      it('filters on differently-cased name', function () {
        var fixture = [_generateMockLibdef('mori', 'v0.3.x', '>=v0.22.x'), _generateMockLibdef('mori', 'v0.3.x', '>=v0.18.x')];
        var filtered = (0, _libDefs.filterLibDefs)(fixture, { type: 'fuzzy', term: 'Mori' });
        expect(filtered).toEqual([fixture[1], fixture[0]]);
      });

      it('filters on partial name', function () {
        var fixture = [_generateMockLibdef('**mori', 'v0.3.x', '>=v0.22.x'), _generateMockLibdef('mori**', 'v0.3.x', '>=v0.18.x'), _generateMockLibdef('mo**ri', 'v0.3.x', '>=v0.18.x')];
        var filtered = (0, _libDefs.filterLibDefs)(fixture, { type: 'fuzzy', term: 'mori' });
        expect(filtered).toEqual([fixture[1], fixture[0]]);
      });

      it('filters on flow version', function () {
        var fixture = [_generateMockLibdef('mori', 'v0.3.x', '>=v0.22.x'), _generateMockLibdef('mori', 'v0.3.x', '>=v0.18.x')];
        var filtered = (0, _libDefs.filterLibDefs)(fixture, {
          type: 'fuzzy',
          term: 'mori',
          flowVersionStr: 'v0.19.0'
        });
        expect(filtered).toEqual([fixture[1]]);
      });
    });

    describe('exact-name filter', function () {
      it('filters on exact name', function () {
        var fixture = [_generateMockLibdef('mori', 'v0.3.x', '>=v0.22.x'), _generateMockLibdef('mori', 'v0.3.x', '>=v0.18.x')];
        var filtered = (0, _libDefs.filterLibDefs)(fixture, { type: 'exact-name', term: 'mori' });
        expect(filtered).toEqual([fixture[1], fixture[0]]);
      });

      it('filters on differently-cased name', function () {
        var fixture = [_generateMockLibdef('mori', 'v0.3.x', '>=v0.22.x'), _generateMockLibdef('mori', 'v0.3.x', '>=v0.18.x')];
        var filtered = (0, _libDefs.filterLibDefs)(fixture, { type: 'exact-name', term: 'Mori' });
        expect(filtered).toEqual([fixture[1], fixture[0]]);
      });

      it('DOES NOT filter on partial name', function () {
        var fixture = [_generateMockLibdef('**mori', 'v0.3.x', '>=v0.22.x'), _generateMockLibdef('mori', 'v0.3.x', '>=v0.18.x'), _generateMockLibdef('mo**ri', 'v0.3.x', '>=v0.18.x')];
        var filtered = (0, _libDefs.filterLibDefs)(fixture, { type: 'exact-name', term: 'mori' });
        expect(filtered).toEqual([fixture[1]]);
      });

      it('filters on flow version', function () {
        var fixture = [_generateMockLibdef('mori', 'v0.3.x', '>=v0.22.x'), _generateMockLibdef('mori', 'v0.3.x', '>=v0.18.x')];
        var filtered = (0, _libDefs.filterLibDefs)(fixture, {
          type: 'exact-name',
          term: 'mori',
          flowVersionStr: 'v0.19.0'
        });
        expect(filtered).toEqual([fixture[1]]);
      });
    });

    describe('exact filter', function () {
      it('filters on exact name', function () {
        var fixture = [_generateMockLibdef('mori', 'v0.3.x', '>=v0.22.x'), _generateMockLibdef('notmori', 'v0.3.x', '>=v0.22.x')];
        var filtered = (0, _libDefs.filterLibDefs)(fixture, {
          type: 'exact',
          flowVersionStr: 'v0.30.0',
          pkgName: 'mori',
          pkgVersionStr: 'v0.3.1'
        });
        expect(filtered).toEqual([fixture[0]]);
      });

      it('filters on differently-cased name', function () {
        var fixture = [_generateMockLibdef('mori', 'v0.3.x', '>=v0.22.x'), _generateMockLibdef('notmori', 'v0.3.x', '>=v0.22.x')];
        var filtered = (0, _libDefs.filterLibDefs)(fixture, {
          type: 'exact',
          flowVersionStr: 'v0.28.0',
          pkgName: 'Mori',
          pkgVersionStr: 'v0.3.x'
        });
        expect(filtered).toEqual([fixture[0]]);
      });

      it('DOES NOT filter on partial name', function () {
        var fixture = [_generateMockLibdef('**mori', 'v0.3.x', '>=v0.22.x'), _generateMockLibdef('mori**', 'v0.3.x', '>=v0.22.x'), _generateMockLibdef('mo**ri', 'v0.3.x', '>=v0.22.x'), _generateMockLibdef('mori', 'v0.3.x', '>=v0.22.x')];
        var filtered = (0, _libDefs.filterLibDefs)(fixture, {
          type: 'exact',
          flowVersionStr: 'v0.28.0',
          pkgName: 'mori',
          pkgVersionStr: 'v0.3.1'
        });
        expect(filtered).toEqual([fixture[3]]);
      });

      it('filters on flow version', function () {
        var fixture = [_generateMockLibdef('mori', 'v0.3.x', '>=v0.22.x'), _generateMockLibdef('mori', 'v0.3.x', '>=v0.18.x')];
        var filtered = (0, _libDefs.filterLibDefs)(fixture, {
          type: 'exact',
          flowVersionStr: 'v0.19.0',
          pkgName: 'mori',
          pkgVersionStr: 'v0.3.x'
        });
        expect(filtered).toEqual([fixture[1]]);
      });

      it('filters and orders from highest to lowest version', function () {
        var fixture = [_generateMockLibdef('mori', 'v2.x.x', '>=v0.22.x'), _generateMockLibdef('mori', 'v3.x.x', '>=v0.22.x'), _generateMockLibdef('mori', 'v2.3.x', '>=v0.22.x'), _generateMockLibdef('mori', 'v2.1.x', '>=v0.22.x')];
        var filtered = (0, _libDefs.filterLibDefs)(fixture, {
          type: 'exact',
          flowVersionStr: 'v0.22.0',
          pkgName: 'mori',
          pkgVersionStr: 'v2.3.0'
        });
        expect(filtered).toEqual([fixture[2], fixture[3], fixture[0]]);
      });

      it('filters using default (implied ^) and equals libdef versions', function () {
        var fixture = [_generateMockLibdef('mori', 'v2.3.x', '>=v0.22.x'), _generateMockLibdef('mori', '=v2.3.x', '>=v0.22.x')];
        var filtered = (0, _libDefs.filterLibDefs)(fixture, {
          type: 'exact',
          flowVersionStr: 'v0.22.0',
          pkgName: 'mori',
          pkgVersionStr: 'v2.4.0'
        });
        expect(filtered).toEqual([fixture[0]]);
      });

      describe('given a package range', function () {
        it("DOES NOT match when libdef range does not intersect package range", function () {
          var fixture = [_generateMockLibdef('mori', 'v0.2.x', '>=v0.22.x'), _generateMockLibdef('mori', 'v0.4.x', '>=v0.22.x')];
          var filtered = (0, _libDefs.filterLibDefs)(fixture, {
            type: 'exact',
            flowVersionStr: 'v0.x.x',
            pkgName: 'mori',
            pkgVersionStr: '^0.3.0'
          });
          expect(filtered).toEqual([]);
        });

        it("DOES NOT match when ranges intersect but package supports older " + "versions than libdef", function () {
          var fixture = [_generateMockLibdef('mori', 'v0.3.x', '>=v0.22.x')];
          var filtered = (0, _libDefs.filterLibDefs)(fixture, {
            type: 'exact',
            flowVersionStr: 'v0.22.0',
            pkgName: 'mori',
            pkgVersionStr: '>=0.2.9 <0.3.0'
          });
          expect(filtered).toEqual([]);
        });

        it("matches when ranges intersect and libdef supports older versions", function () {
          var fixture = [_generateMockLibdef('mori', 'v0.3.x', '>=v0.22.x'), _generateMockLibdef('mori', 'v0.3.8', '>=v0.22.x')];
          var filtered = (0, _libDefs.filterLibDefs)(fixture, {
            type: 'exact',
            flowVersionStr: 'v0.22.0',
            pkgName: 'mori',
            pkgVersionStr: '>=0.3.2 <0.3.8'
          });
          expect(filtered).toEqual([fixture[0]]);
        });
      });
    });
  });
});