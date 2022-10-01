(() => {
  // ../node_modules/@tauri-apps/api/tslib.es6-9bc0804d.js
  var t = function(n4, r6) {
    return (t = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t2, n5) {
      t2.__proto__ = n5;
    } || function(t2, n5) {
      for (var r7 in n5)
        Object.prototype.hasOwnProperty.call(n5, r7) && (t2[r7] = n5[r7]);
    })(n4, r6);
  };
  function n(n4, r6) {
    if ("function" != typeof r6 && null !== r6)
      throw new TypeError("Class extends value " + String(r6) + " is not a constructor or null");
    function e3() {
      this.constructor = n4;
    }
    t(n4, r6), n4.prototype = null === r6 ? Object.create(r6) : (e3.prototype = r6.prototype, new e3());
  }
  var r = function() {
    return (r = Object.assign || function(t2) {
      for (var n4, r6 = 1, e3 = arguments.length; r6 < e3; r6++)
        for (var o7 in n4 = arguments[r6])
          Object.prototype.hasOwnProperty.call(n4, o7) && (t2[o7] = n4[o7]);
      return t2;
    }).apply(this, arguments);
  };
  function o(t2, n4, r6, e3) {
    return new (r6 || (r6 = Promise))(function(o7, a6) {
      function c5(t3) {
        try {
          i3(e3.next(t3));
        } catch (t4) {
          a6(t4);
        }
      }
      function l4(t3) {
        try {
          i3(e3.throw(t3));
        } catch (t4) {
          a6(t4);
        }
      }
      function i3(t3) {
        var n5;
        t3.done ? o7(t3.value) : (n5 = t3.value, n5 instanceof r6 ? n5 : new r6(function(t4) {
          t4(n5);
        })).then(c5, l4);
      }
      i3((e3 = e3.apply(t2, n4 || [])).next());
    });
  }
  function a(t2, n4) {
    var r6, e3, o7, a6, c5 = { label: 0, sent: function() {
      if (1 & o7[0])
        throw o7[1];
      return o7[1];
    }, trys: [], ops: [] };
    return a6 = { next: l4(0), throw: l4(1), return: l4(2) }, "function" == typeof Symbol && (a6[Symbol.iterator] = function() {
      return this;
    }), a6;
    function l4(a7) {
      return function(l5) {
        return function(a8) {
          if (r6)
            throw new TypeError("Generator is already executing.");
          for (; c5; )
            try {
              if (r6 = 1, e3 && (o7 = 2 & a8[0] ? e3.return : a8[0] ? e3.throw || ((o7 = e3.return) && o7.call(e3), 0) : e3.next) && !(o7 = o7.call(e3, a8[1])).done)
                return o7;
              switch (e3 = 0, o7 && (a8 = [2 & a8[0], o7.value]), a8[0]) {
                case 0:
                case 1:
                  o7 = a8;
                  break;
                case 4:
                  return c5.label++, { value: a8[1], done: false };
                case 5:
                  c5.label++, e3 = a8[1], a8 = [0];
                  continue;
                case 7:
                  a8 = c5.ops.pop(), c5.trys.pop();
                  continue;
                default:
                  if (!(o7 = c5.trys, (o7 = o7.length > 0 && o7[o7.length - 1]) || 6 !== a8[0] && 2 !== a8[0])) {
                    c5 = 0;
                    continue;
                  }
                  if (3 === a8[0] && (!o7 || a8[1] > o7[0] && a8[1] < o7[3])) {
                    c5.label = a8[1];
                    break;
                  }
                  if (6 === a8[0] && c5.label < o7[1]) {
                    c5.label = o7[1], o7 = a8;
                    break;
                  }
                  if (o7 && c5.label < o7[2]) {
                    c5.label = o7[2], c5.ops.push(a8);
                    break;
                  }
                  o7[2] && c5.ops.pop(), c5.trys.pop();
                  continue;
              }
              a8 = n4.call(t2, c5);
            } catch (t3) {
              a8 = [6, t3], e3 = 0;
            } finally {
              r6 = o7 = 0;
            }
          if (5 & a8[0])
            throw a8[1];
          return { value: a8[0] ? a8[1] : void 0, done: true };
        }([a7, l5]);
      };
    }
  }

  // ../node_modules/@tauri-apps/api/tauri-fa8f44bd.js
  function o2(n4, t2) {
    void 0 === t2 && (t2 = false);
    var e3 = window.crypto.getRandomValues(new Uint32Array(1))[0], o7 = "_".concat(e3);
    return Object.defineProperty(window, o7, { value: function(e4) {
      return t2 && Reflect.deleteProperty(window, o7), null == n4 ? void 0 : n4(e4);
    }, writable: false, configurable: true }), e3;
  }
  function r2(r6, c5) {
    return void 0 === c5 && (c5 = {}), o(this, void 0, void 0, function() {
      return a(this, function(n4) {
        return [2, new Promise(function(n5, t2) {
          var i3 = o2(function(t3) {
            n5(t3), Reflect.deleteProperty(window, "_".concat(a6));
          }, true), a6 = o2(function(n6) {
            t2(n6), Reflect.deleteProperty(window, "_".concat(i3));
          }, true);
          window.__TAURI_IPC__(r({ cmd: r6, callback: i3, error: a6 }, c5));
        })];
      });
    });
  }
  function c(n4, t2) {
    void 0 === t2 && (t2 = "asset");
    var e3 = encodeURIComponent(n4);
    return navigator.userAgent.includes("Windows") ? "https://".concat(t2, ".localhost/").concat(e3) : "".concat(t2, "://").concat(e3);
  }
  var i = Object.freeze({ __proto__: null, transformCallback: o2, invoke: r2, convertFileSrc: c });

  // ../node_modules/@tauri-apps/api/tauri-7cafdaf8.js
  function o3(o7) {
    return o(this, void 0, void 0, function() {
      return a(this, function(i3) {
        return [2, r2("tauri", o7)];
      });
    });
  }

  // ../node_modules/@tauri-apps/api/event-aba177ae.js
  function r3(e3, r6) {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Event", message: { cmd: "unlisten", event: e3, eventId: r6 } })];
      });
    });
  }
  function u(e3, r6, u6) {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        switch (t2.label) {
          case 0:
            return [4, o3({ __tauriModule: "Event", message: { cmd: "emit", event: e3, windowLabel: r6, payload: "string" == typeof u6 ? u6 : JSON.stringify(u6) } })];
          case 1:
            return t2.sent(), [2];
        }
      });
    });
  }
  function o4(u6, o7, s7) {
    return o(this, void 0, void 0, function() {
      var a6 = this;
      return a(this, function(c5) {
        return [2, o3({ __tauriModule: "Event", message: { cmd: "listen", event: u6, windowLabel: o7, handler: o2(s7) } }).then(function(i3) {
          return function() {
            return o(a6, void 0, void 0, function() {
              return a(this, function(t2) {
                return [2, r3(u6, i3)];
              });
            });
          };
        })];
      });
    });
  }
  function s(i3, e3, u6) {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o4(i3, e3, function(t3) {
          u6(t3), r3(i3, t3.id).catch(function() {
          });
        })];
      });
    });
  }

  // ../node_modules/@tauri-apps/api/event-1823ec51.js
  function e(o7, r6) {
    return o(this, void 0, void 0, function() {
      return a(this, function(n4) {
        return [2, o4(o7, null, r6)];
      });
    });
  }
  function u2(i3, r6) {
    return o(this, void 0, void 0, function() {
      return a(this, function(n4) {
        return [2, s(i3, null, r6)];
      });
    });
  }
  function s2(i3, o7) {
    return o(this, void 0, void 0, function() {
      return a(this, function(n4) {
        return [2, u(i3, void 0, o7)];
      });
    });
  }
  var a2 = Object.freeze({ __proto__: null, listen: e, once: u2, emit: s2 });

  // ../node_modules/@tauri-apps/api/dialog-37b7acba.js
  function e2(e3) {
    return void 0 === e3 && (e3 = {}), o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return "object" == typeof e3 && Object.freeze(e3), [2, o3({ __tauriModule: "Dialog", message: { cmd: "openDialog", options: e3 } })];
      });
    });
  }
  function n2(e3) {
    return void 0 === e3 && (e3 = {}), o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return "object" == typeof e3 && Object.freeze(e3), [2, o3({ __tauriModule: "Dialog", message: { cmd: "saveDialog", options: e3 } })];
      });
    });
  }
  function r4(e3, n4) {
    var r6;
    return o(this, void 0, void 0, function() {
      var t2;
      return a(this, function(i3) {
        return t2 = "string" == typeof n4 ? { title: n4 } : n4, [2, o3({ __tauriModule: "Dialog", message: { cmd: "messageDialog", message: e3.toString(), title: null === (r6 = null == t2 ? void 0 : t2.title) || void 0 === r6 ? void 0 : r6.toString(), type: null == t2 ? void 0 : t2.type } })];
      });
    });
  }
  function s3(e3, n4) {
    var r6;
    return o(this, void 0, void 0, function() {
      var t2;
      return a(this, function(i3) {
        return t2 = "string" == typeof n4 ? { title: n4 } : n4, [2, o3({ __tauriModule: "Dialog", message: { cmd: "askDialog", message: e3.toString(), title: null === (r6 = null == t2 ? void 0 : t2.title) || void 0 === r6 ? void 0 : r6.toString(), type: null == t2 ? void 0 : t2.type } })];
      });
    });
  }
  function u3(e3, n4) {
    var r6;
    return o(this, void 0, void 0, function() {
      var t2;
      return a(this, function(i3) {
        return t2 = "string" == typeof n4 ? { title: n4 } : n4, [2, o3({ __tauriModule: "Dialog", message: { cmd: "confirmDialog", message: e3.toString(), title: null === (r6 = null == t2 ? void 0 : t2.title) || void 0 === r6 ? void 0 : r6.toString(), type: null == t2 ? void 0 : t2.type } })];
      });
    });
  }
  var a3 = Object.freeze({ __proto__: null, open: e2, save: n2, message: r4, ask: s3, confirm: u3 });

  // ../node_modules/@tauri-apps/api/fs-c8f11a6d.js
  var o5;
  function i2(o7, i3) {
    return void 0 === i3 && (i3 = {}), o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Fs", message: { cmd: "readTextFile", path: o7, options: i3 } })];
      });
    });
  }
  function r5(o7, i3) {
    return void 0 === i3 && (i3 = {}), o(this, void 0, void 0, function() {
      var t2;
      return a(this, function(e3) {
        switch (e3.label) {
          case 0:
            return [4, o3({ __tauriModule: "Fs", message: { cmd: "readFile", path: o7, options: i3 } })];
          case 1:
            return t2 = e3.sent(), [2, Uint8Array.from(t2)];
        }
      });
    });
  }
  function s4(o7, i3, r6) {
    return o(this, void 0, void 0, function() {
      var t2, s7;
      return a(this, function(e3) {
        return "object" == typeof r6 && Object.freeze(r6), "object" == typeof o7 && Object.freeze(o7), t2 = { path: "", contents: "" }, s7 = r6, "string" == typeof o7 ? t2.path = o7 : (t2.path = o7.path, t2.contents = o7.contents), "string" == typeof i3 ? t2.contents = null != i3 ? i3 : "" : s7 = i3, [2, o3({ __tauriModule: "Fs", message: { cmd: "writeFile", path: t2.path, contents: Array.from(new TextEncoder().encode(t2.contents)), options: s7 } })];
      });
    });
  }
  function a4(o7, i3, r6) {
    return o(this, void 0, void 0, function() {
      var t2, s7;
      return a(this, function(e3) {
        return "object" == typeof r6 && Object.freeze(r6), "object" == typeof o7 && Object.freeze(o7), t2 = { path: "", contents: [] }, s7 = r6, "string" == typeof o7 ? t2.path = o7 : (t2.path = o7.path, t2.contents = o7.contents), i3 && "dir" in i3 ? s7 = i3 : "string" == typeof o7 && (t2.contents = null != i3 ? i3 : []), [2, o3({ __tauriModule: "Fs", message: { cmd: "writeFile", path: t2.path, contents: Array.from(t2.contents instanceof ArrayBuffer ? new Uint8Array(t2.contents) : t2.contents), options: s7 } })];
      });
    });
  }
  function u4(o7, i3) {
    return void 0 === i3 && (i3 = {}), o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Fs", message: { cmd: "readDir", path: o7, options: i3 } })];
      });
    });
  }
  function c2(o7, i3) {
    return void 0 === i3 && (i3 = {}), o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Fs", message: { cmd: "createDir", path: o7, options: i3 } })];
      });
    });
  }
  function d(o7, i3) {
    return void 0 === i3 && (i3 = {}), o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Fs", message: { cmd: "removeDir", path: o7, options: i3 } })];
      });
    });
  }
  function f(o7, i3, r6) {
    return void 0 === r6 && (r6 = {}), o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Fs", message: { cmd: "copyFile", source: o7, destination: i3, options: r6 } })];
      });
    });
  }
  function p(o7, i3) {
    return void 0 === i3 && (i3 = {}), o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Fs", message: { cmd: "removeFile", path: o7, options: i3 } })];
      });
    });
  }
  function l(o7, i3, r6) {
    return void 0 === r6 && (r6 = {}), o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Fs", message: { cmd: "renameFile", oldPath: o7, newPath: i3, options: r6 } })];
      });
    });
  }
  !function(t2) {
    t2[t2.Audio = 1] = "Audio", t2[t2.Cache = 2] = "Cache", t2[t2.Config = 3] = "Config", t2[t2.Data = 4] = "Data", t2[t2.LocalData = 5] = "LocalData", t2[t2.Desktop = 6] = "Desktop", t2[t2.Document = 7] = "Document", t2[t2.Download = 8] = "Download", t2[t2.Executable = 9] = "Executable", t2[t2.Font = 10] = "Font", t2[t2.Home = 11] = "Home", t2[t2.Picture = 12] = "Picture", t2[t2.Public = 13] = "Public", t2[t2.Runtime = 14] = "Runtime", t2[t2.Template = 15] = "Template", t2[t2.Video = 16] = "Video", t2[t2.Resource = 17] = "Resource", t2[t2.App = 18] = "App", t2[t2.Log = 19] = "Log", t2[t2.Temp = 20] = "Temp";
  }(o5 || (o5 = {}));
  var h = Object.freeze({ __proto__: null, get BaseDirectory() {
    return o5;
  }, get Dir() {
    return o5;
  }, readTextFile: i2, readBinaryFile: r5, writeTextFile: s4, writeFile: s4, writeBinaryFile: a4, readDir: u4, createDir: c2, removeDir: d, copyFile: f, removeFile: p, renameFile: l });

  // ../node_modules/@tauri-apps/api/os-check-094ffe86.js
  function n3() {
    return navigator.appVersion.includes("Win");
  }

  // ../node_modules/@tauri-apps/api/path-9581ef45.js
  function o6() {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Path", message: { cmd: "resolvePath", path: "", directory: o5.App } })];
      });
    });
  }
  function u5() {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Path", message: { cmd: "resolvePath", path: "", directory: o5.Audio } })];
      });
    });
  }
  function a5() {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Path", message: { cmd: "resolvePath", path: "", directory: o5.Cache } })];
      });
    });
  }
  function s5() {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Path", message: { cmd: "resolvePath", path: "", directory: o5.Config } })];
      });
    });
  }
  function c3() {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Path", message: { cmd: "resolvePath", path: "", directory: o5.Data } })];
      });
    });
  }
  function d2() {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Path", message: { cmd: "resolvePath", path: "", directory: o5.Desktop } })];
      });
    });
  }
  function h2() {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Path", message: { cmd: "resolvePath", path: "", directory: o5.Document } })];
      });
    });
  }
  function f2() {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Path", message: { cmd: "resolvePath", path: "", directory: o5.Download } })];
      });
    });
  }
  function v() {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Path", message: { cmd: "resolvePath", path: "", directory: o5.Executable } })];
      });
    });
  }
  function m() {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Path", message: { cmd: "resolvePath", path: "", directory: o5.Font } })];
      });
    });
  }
  function l2() {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Path", message: { cmd: "resolvePath", path: "", directory: o5.Home } })];
      });
    });
  }
  function _() {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Path", message: { cmd: "resolvePath", path: "", directory: o5.LocalData } })];
      });
    });
  }
  function P() {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Path", message: { cmd: "resolvePath", path: "", directory: o5.Picture } })];
      });
    });
  }
  function p2() {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Path", message: { cmd: "resolvePath", path: "", directory: o5.Public } })];
      });
    });
  }
  function g() {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Path", message: { cmd: "resolvePath", path: "", directory: o5.Resource } })];
      });
    });
  }
  function D(n4) {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Path", message: { cmd: "resolvePath", path: n4, directory: o5.Resource } })];
      });
    });
  }
  function M() {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Path", message: { cmd: "resolvePath", path: "", directory: o5.Runtime } })];
      });
    });
  }
  function y() {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Path", message: { cmd: "resolvePath", path: "", directory: o5.Template } })];
      });
    });
  }
  function b() {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Path", message: { cmd: "resolvePath", path: "", directory: o5.Video } })];
      });
    });
  }
  function j() {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Path", message: { cmd: "resolvePath", path: "", directory: o5.Log } })];
      });
    });
  }
  var x = n3() ? "\\" : "/";
  var A = n3() ? ";" : ":";
  function k() {
    for (var i3 = [], n4 = 0; n4 < arguments.length; n4++)
      i3[n4] = arguments[n4];
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Path", message: { cmd: "resolve", paths: i3 } })];
      });
    });
  }
  function z(i3) {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Path", message: { cmd: "normalize", path: i3 } })];
      });
    });
  }
  function R() {
    for (var i3 = [], n4 = 0; n4 < arguments.length; n4++)
      i3[n4] = arguments[n4];
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Path", message: { cmd: "join", paths: i3 } })];
      });
    });
  }
  function w(i3) {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Path", message: { cmd: "dirname", path: i3 } })];
      });
    });
  }
  function B(i3) {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Path", message: { cmd: "extname", path: i3 } })];
      });
    });
  }
  function C(i3, n4) {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Path", message: { cmd: "basename", path: i3, ext: n4 } })];
      });
    });
  }
  function L(i3) {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Path", message: { cmd: "isAbsolute", path: i3 } })];
      });
    });
  }
  var q = Object.freeze({ __proto__: null, appDir: o6, audioDir: u5, cacheDir: a5, configDir: s5, dataDir: c3, desktopDir: d2, documentDir: h2, downloadDir: f2, executableDir: v, fontDir: m, homeDir: l2, localDataDir: _, pictureDir: P, publicDir: p2, resourceDir: g, resolveResource: D, runtimeDir: M, templateDir: y, videoDir: b, logDir: j, get BaseDirectory() {
    return o5;
  }, sep: x, delimiter: A, resolve: k, normalize: z, join: R, dirname: w, extname: B, basename: C, isAbsolute: L });

  // ../node_modules/@tauri-apps/api/window-5b72c451.js
  var s6;
  var d3 = function(t2, e3) {
    this.type = "Logical", this.width = t2, this.height = e3;
  };
  var l3 = function() {
    function t2(t3, e3) {
      this.type = "Physical", this.width = t3, this.height = e3;
    }
    return t2.prototype.toLogical = function(t3) {
      return new d3(this.width / t3, this.height / t3);
    }, t2;
  }();
  var c4 = function(t2, e3) {
    this.type = "Logical", this.x = t2, this.y = e3;
  };
  var h3 = function() {
    function t2(t3, e3) {
      this.type = "Physical", this.x = t3, this.y = e3;
    }
    return t2.prototype.toLogical = function(t3) {
      return new c4(this.x / t3, this.y / t3);
    }, t2;
  }();
  function p3() {
    return new b2(window.__TAURI_METADATA__.__currentWindow.label, { skip: true });
  }
  function f3() {
    return window.__TAURI_METADATA__.__windows.map(function(t2) {
      return new b2(t2.label, { skip: true });
    });
  }
  !function(t2) {
    t2[t2.Critical = 1] = "Critical", t2[t2.Informational = 2] = "Informational";
  }(s6 || (s6 = {}));
  var m2;
  var y2 = ["tauri://created", "tauri://error"];
  var v2 = function() {
    function t2(t3) {
      this.label = t3, this.listeners = /* @__PURE__ */ Object.create(null);
    }
    return t2.prototype.listen = function(t3, n4) {
      return o(this, void 0, void 0, function() {
        var e3 = this;
        return a(this, function(i3) {
          return this._handleTauriEvent(t3, n4) ? [2, Promise.resolve(function() {
            var i4 = e3.listeners[t3];
            i4.splice(i4.indexOf(n4), 1);
          })] : [2, o4(t3, this.label, n4)];
        });
      });
    }, t2.prototype.once = function(t3, n4) {
      return o(this, void 0, void 0, function() {
        var e3 = this;
        return a(this, function(i3) {
          return this._handleTauriEvent(t3, n4) ? [2, Promise.resolve(function() {
            var i4 = e3.listeners[t3];
            i4.splice(i4.indexOf(n4), 1);
          })] : [2, s(t3, this.label, n4)];
        });
      });
    }, t2.prototype.emit = function(t3, n4) {
      return o(this, void 0, void 0, function() {
        var e3, o7;
        return a(this, function(i3) {
          if (y2.includes(t3)) {
            for (e3 = 0, o7 = this.listeners[t3] || []; e3 < o7.length; e3++)
              (0, o7[e3])({ event: t3, id: -1, windowLabel: this.label, payload: n4 });
            return [2, Promise.resolve()];
          }
          return [2, u(t3, this.label, n4)];
        });
      });
    }, t2.prototype._handleTauriEvent = function(t3, e3) {
      return !!y2.includes(t3) && (t3 in this.listeners ? this.listeners[t3].push(e3) : this.listeners[t3] = [e3], true);
    }, t2;
  }();
  var g2 = function(r6) {
    function a6() {
      return null !== r6 && r6.apply(this, arguments) || this;
    }
    return n(a6, r6), a6.prototype.scaleFactor = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "scaleFactor" } } } })];
        });
      });
    }, a6.prototype.innerPosition = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "innerPosition" } } } }).then(function(t3) {
            var e3 = t3.x, i3 = t3.y;
            return new h3(e3, i3);
          })];
        });
      });
    }, a6.prototype.outerPosition = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "outerPosition" } } } }).then(function(t3) {
            var e3 = t3.x, i3 = t3.y;
            return new h3(e3, i3);
          })];
        });
      });
    }, a6.prototype.innerSize = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "innerSize" } } } }).then(function(t3) {
            var e3 = t3.width, i3 = t3.height;
            return new l3(e3, i3);
          })];
        });
      });
    }, a6.prototype.outerSize = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "outerSize" } } } }).then(function(t3) {
            var e3 = t3.width, i3 = t3.height;
            return new l3(e3, i3);
          })];
        });
      });
    }, a6.prototype.isFullscreen = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "isFullscreen" } } } })];
        });
      });
    }, a6.prototype.isMaximized = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "isMaximized" } } } })];
        });
      });
    }, a6.prototype.isDecorated = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "isDecorated" } } } })];
        });
      });
    }, a6.prototype.isResizable = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "isResizable" } } } })];
        });
      });
    }, a6.prototype.isVisible = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "isVisible" } } } })];
        });
      });
    }, a6.prototype.theme = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "theme" } } } })];
        });
      });
    }, a6.prototype.center = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "center" } } } })];
        });
      });
    }, a6.prototype.requestUserAttention = function(t2) {
      return o(this, void 0, void 0, function() {
        var e3;
        return a(this, function(i3) {
          return e3 = null, t2 && (e3 = t2 === s6.Critical ? { type: "Critical" } : { type: "Informational" }), [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "requestUserAttention", payload: e3 } } } })];
        });
      });
    }, a6.prototype.setResizable = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e3) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setResizable", payload: t2 } } } })];
        });
      });
    }, a6.prototype.setTitle = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e3) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setTitle", payload: t2 } } } })];
        });
      });
    }, a6.prototype.maximize = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "maximize" } } } })];
        });
      });
    }, a6.prototype.unmaximize = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "unmaximize" } } } })];
        });
      });
    }, a6.prototype.toggleMaximize = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "toggleMaximize" } } } })];
        });
      });
    }, a6.prototype.minimize = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "minimize" } } } })];
        });
      });
    }, a6.prototype.unminimize = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "unminimize" } } } })];
        });
      });
    }, a6.prototype.show = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "show" } } } })];
        });
      });
    }, a6.prototype.hide = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "hide" } } } })];
        });
      });
    }, a6.prototype.close = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "close" } } } })];
        });
      });
    }, a6.prototype.setDecorations = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e3) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setDecorations", payload: t2 } } } })];
        });
      });
    }, a6.prototype.setAlwaysOnTop = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e3) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setAlwaysOnTop", payload: t2 } } } })];
        });
      });
    }, a6.prototype.setSize = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e3) {
          if (!t2 || "Logical" !== t2.type && "Physical" !== t2.type)
            throw new Error("the `size` argument must be either a LogicalSize or a PhysicalSize instance");
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setSize", payload: { type: t2.type, data: { width: t2.width, height: t2.height } } } } } })];
        });
      });
    }, a6.prototype.setMinSize = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e3) {
          if (t2 && "Logical" !== t2.type && "Physical" !== t2.type)
            throw new Error("the `size` argument must be either a LogicalSize or a PhysicalSize instance");
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setMinSize", payload: t2 ? { type: t2.type, data: { width: t2.width, height: t2.height } } : null } } } })];
        });
      });
    }, a6.prototype.setMaxSize = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e3) {
          if (t2 && "Logical" !== t2.type && "Physical" !== t2.type)
            throw new Error("the `size` argument must be either a LogicalSize or a PhysicalSize instance");
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setMaxSize", payload: t2 ? { type: t2.type, data: { width: t2.width, height: t2.height } } : null } } } })];
        });
      });
    }, a6.prototype.setPosition = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e3) {
          if (!t2 || "Logical" !== t2.type && "Physical" !== t2.type)
            throw new Error("the `position` argument must be either a LogicalPosition or a PhysicalPosition instance");
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setPosition", payload: { type: t2.type, data: { x: t2.x, y: t2.y } } } } } })];
        });
      });
    }, a6.prototype.setFullscreen = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e3) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setFullscreen", payload: t2 } } } })];
        });
      });
    }, a6.prototype.setFocus = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setFocus" } } } })];
        });
      });
    }, a6.prototype.setIcon = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e3) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setIcon", payload: { icon: "string" == typeof t2 ? t2 : Array.from(t2) } } } } })];
        });
      });
    }, a6.prototype.setSkipTaskbar = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e3) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setSkipTaskbar", payload: t2 } } } })];
        });
      });
    }, a6.prototype.setCursorGrab = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e3) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setCursorGrab", payload: t2 } } } })];
        });
      });
    }, a6.prototype.setCursorVisible = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e3) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setCursorVisible", payload: t2 } } } })];
        });
      });
    }, a6.prototype.setCursorIcon = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e3) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setCursorIcon", payload: t2 } } } })];
        });
      });
    }, a6.prototype.setCursorPosition = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e3) {
          if (!t2 || "Logical" !== t2.type && "Physical" !== t2.type)
            throw new Error("the `position` argument must be either a LogicalPosition or a PhysicalPosition instance");
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setCursorPosition", payload: { type: t2.type, data: { x: t2.x, y: t2.y } } } } } })];
        });
      });
    }, a6.prototype.startDragging = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "startDragging" } } } })];
        });
      });
    }, a6.prototype.onResized = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e3) {
          return [2, this.listen("tauri://resize", t2)];
        });
      });
    }, a6.prototype.onMoved = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e3) {
          return [2, this.listen("tauri://move", t2)];
        });
      });
    }, a6.prototype.onCloseRequested = function(t2) {
      return o(this, void 0, void 0, function() {
        var e3 = this;
        return a(this, function(i3) {
          return [2, this.listen("tauri://close-requested", function(i4) {
            var n4 = new _2(i4);
            Promise.resolve(t2(n4)).then(function() {
              if (!n4.isPreventDefault())
                return e3.close();
            });
          })];
        });
      });
    }, a6.prototype.onFocusChanged = function(t2) {
      return o(this, void 0, void 0, function() {
        var e3, o7;
        return a(this, function(i3) {
          switch (i3.label) {
            case 0:
              return [4, this.listen("tauri://focus", function(e4) {
                t2(r(r({}, e4), { payload: true }));
              })];
            case 1:
              return e3 = i3.sent(), [4, this.listen("tauri://blur", function(e4) {
                t2(r(r({}, e4), { payload: false }));
              })];
            case 2:
              return o7 = i3.sent(), [2, function() {
                e3(), o7();
              }];
          }
        });
      });
    }, a6.prototype.onScaleChanged = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e3) {
          return [2, this.listen("tauri://scale-change", t2)];
        });
      });
    }, a6.prototype.onMenuClicked = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e3) {
          return [2, this.listen("tauri://menu", t2)];
        });
      });
    }, a6.prototype.onFileDropEvent = function(t2) {
      return o(this, void 0, void 0, function() {
        var e3, o7, r7;
        return a(this, function(i3) {
          switch (i3.label) {
            case 0:
              return [4, this.listen("tauri://file-drop", function(e4) {
                t2(r(r({}, e4), { payload: { type: "drop", paths: e4.payload } }));
              })];
            case 1:
              return e3 = i3.sent(), [4, this.listen("tauri://file-drop-hover", function(e4) {
                t2(r(r({}, e4), { payload: { type: "hover", paths: e4.payload } }));
              })];
            case 2:
              return o7 = i3.sent(), [4, this.listen("tauri://file-drop-cancelled", function(e4) {
                t2(r(r({}, e4), { payload: { type: "cancel" } }));
              })];
            case 3:
              return r7 = i3.sent(), [2, function() {
                e3(), o7(), r7();
              }];
          }
        });
      });
    }, a6.prototype.onThemeChanged = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e3) {
          return [2, this.listen("tauri://theme-changed", t2)];
        });
      });
    }, a6;
  }(v2);
  var _2 = function() {
    function t2(t3) {
      this._preventDefault = false, this.event = t3.event, this.windowLabel = t3.windowLabel, this.id = t3.id;
    }
    return t2.prototype.preventDefault = function() {
      this._preventDefault = true;
    }, t2.prototype.isPreventDefault = function() {
      return this._preventDefault;
    }, t2;
  }();
  var b2 = function(r6) {
    function a6(t2, a7) {
      void 0 === a7 && (a7 = {});
      var u6 = r6.call(this, t2) || this;
      return (null == a7 ? void 0 : a7.skip) || o3({ __tauriModule: "Window", message: { cmd: "createWebview", data: { options: r({ label: t2 }, a7) } } }).then(function() {
        return o(u6, void 0, void 0, function() {
          return a(this, function(t3) {
            return [2, this.emit("tauri://created")];
          });
        });
      }).catch(function(t3) {
        return o(u6, void 0, void 0, function() {
          return a(this, function(e3) {
            return [2, this.emit("tauri://error", t3)];
          });
        });
      }), u6;
    }
    return n(a6, r6), a6.getByLabel = function(t2) {
      return f3().some(function(e3) {
        return e3.label === t2;
      }) ? new a6(t2, { skip: true }) : null;
    }, a6;
  }(g2);
  function w2() {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { cmd: { type: "currentMonitor" } } } })];
      });
    });
  }
  function M2() {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { cmd: { type: "primaryMonitor" } } } })];
      });
    });
  }
  function W() {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { cmd: { type: "availableMonitors" } } } })];
      });
    });
  }
  "__TAURI_METADATA__" in window ? m2 = new b2(window.__TAURI_METADATA__.__currentWindow.label, { skip: true }) : (console.warn('Could not find "window.__TAURI_METADATA__". The "appWindow" value will reference the "main" window label.\nNote that this is not an issue if running this frontend on a browser instead of a Tauri window.'), m2 = new b2("main", { skip: true }));
  var z2 = Object.freeze({ __proto__: null, WebviewWindow: b2, WebviewWindowHandle: v2, WindowManager: g2, CloseRequestedEvent: _2, getCurrent: p3, getAll: f3, get appWindow() {
    return m2;
  }, LogicalSize: d3, PhysicalSize: l3, LogicalPosition: c4, PhysicalPosition: h3, get UserAttentionType() {
    return s6;
  }, currentMonitor: w2, primaryMonitor: M2, availableMonitors: W });

  // index.jsx
  var makeAllWorkingDirs = async (sourcePath) => {
    const dir = await o6();
    const extension = await B(sourcePath);
    const fileStemName = (await C(sourcePath)).replace(`.${extension}`, "");
    const workingDir = await R(dir, fileStemName);
    await c2(workingDir, { recursive: true });
    await c2(await R(workingDir, "frames"), { recursive: true });
    await c2(await R(workingDir, "bridge_frames"), { recursive: true });
    await c2(await R(workingDir, "bridge_video"), { recursive: true });
    r2("set_working_dir", {
      workingDir
    });
    return workingDir;
  };
  var displayFrameDir = async (sourcePath) => {
    console.log("displayFrameDir", sourcePath);
    let isStartFrame = true;
    const frameEntries = await u4(sourcePath);
    console.log("frameEntries", frameEntries);
    const videoFrameList = document.getElementById("video-frame-list");
    for (let i3 = 0; i3 < frameEntries.length; i3++) {
      const frameEntry = frameEntries[i3];
      const frameEl = document.createElement("img");
      frameEl.src = await c(frameEntry.path);
      frameEl.realPath = frameEntry.path;
      frameEl.class = "video-frame";
      frameEl.width = 35;
      frameEl.height = 35;
      frameEl.style.margin = "10px";
      frameEl.addEventListener("click", (event) => {
        m2.emit("click", {
          path_to_frame: frameEl.realPath,
          is_start_frame: isStartFrame
        });
        isStartFrame = !isStartFrame;
      });
      videoFrameList.appendChild(frameEl);
    }
  };
  var f4 = async () => {
    const selected = await e2({
      multiple: false,
      filters: [{
        name: "Video",
        extensions: ["mov", "webm"]
      }]
    });
    if (selected === null) {
    } else {
      const workingDir = await makeAllWorkingDirs(selected);
      const result = await r2("framify_video_src", {
        srcVideoName: selected
      });
      await displayFrameDir(await R(workingDir, "frames"));
    }
  };
  f4();
})();
