(() => {
  // ../node_modules/@tauri-apps/api/tslib.es6-9bc0804d.js
  var t = function(n2, r4) {
    return (t = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t2, n3) {
      t2.__proto__ = n3;
    } || function(t2, n3) {
      for (var r5 in n3)
        Object.prototype.hasOwnProperty.call(n3, r5) && (t2[r5] = n3[r5]);
    })(n2, r4);
  };
  function n(n2, r4) {
    if ("function" != typeof r4 && null !== r4)
      throw new TypeError("Class extends value " + String(r4) + " is not a constructor or null");
    function e2() {
      this.constructor = n2;
    }
    t(n2, r4), n2.prototype = null === r4 ? Object.create(r4) : (e2.prototype = r4.prototype, new e2());
  }
  var r = function() {
    return (r = Object.assign || function(t2) {
      for (var n2, r4 = 1, e2 = arguments.length; r4 < e2; r4++)
        for (var o5 in n2 = arguments[r4])
          Object.prototype.hasOwnProperty.call(n2, o5) && (t2[o5] = n2[o5]);
      return t2;
    }).apply(this, arguments);
  };
  function o(t2, n2, r4, e2) {
    return new (r4 || (r4 = Promise))(function(o5, a3) {
      function c3(t3) {
        try {
          i2(e2.next(t3));
        } catch (t4) {
          a3(t4);
        }
      }
      function l2(t3) {
        try {
          i2(e2.throw(t3));
        } catch (t4) {
          a3(t4);
        }
      }
      function i2(t3) {
        var n3;
        t3.done ? o5(t3.value) : (n3 = t3.value, n3 instanceof r4 ? n3 : new r4(function(t4) {
          t4(n3);
        })).then(c3, l2);
      }
      i2((e2 = e2.apply(t2, n2 || [])).next());
    });
  }
  function a(t2, n2) {
    var r4, e2, o5, a3, c3 = { label: 0, sent: function() {
      if (1 & o5[0])
        throw o5[1];
      return o5[1];
    }, trys: [], ops: [] };
    return a3 = { next: l2(0), throw: l2(1), return: l2(2) }, "function" == typeof Symbol && (a3[Symbol.iterator] = function() {
      return this;
    }), a3;
    function l2(a4) {
      return function(l3) {
        return function(a5) {
          if (r4)
            throw new TypeError("Generator is already executing.");
          for (; c3; )
            try {
              if (r4 = 1, e2 && (o5 = 2 & a5[0] ? e2.return : a5[0] ? e2.throw || ((o5 = e2.return) && o5.call(e2), 0) : e2.next) && !(o5 = o5.call(e2, a5[1])).done)
                return o5;
              switch (e2 = 0, o5 && (a5 = [2 & a5[0], o5.value]), a5[0]) {
                case 0:
                case 1:
                  o5 = a5;
                  break;
                case 4:
                  return c3.label++, { value: a5[1], done: false };
                case 5:
                  c3.label++, e2 = a5[1], a5 = [0];
                  continue;
                case 7:
                  a5 = c3.ops.pop(), c3.trys.pop();
                  continue;
                default:
                  if (!(o5 = c3.trys, (o5 = o5.length > 0 && o5[o5.length - 1]) || 6 !== a5[0] && 2 !== a5[0])) {
                    c3 = 0;
                    continue;
                  }
                  if (3 === a5[0] && (!o5 || a5[1] > o5[0] && a5[1] < o5[3])) {
                    c3.label = a5[1];
                    break;
                  }
                  if (6 === a5[0] && c3.label < o5[1]) {
                    c3.label = o5[1], o5 = a5;
                    break;
                  }
                  if (o5 && c3.label < o5[2]) {
                    c3.label = o5[2], c3.ops.push(a5);
                    break;
                  }
                  o5[2] && c3.ops.pop(), c3.trys.pop();
                  continue;
              }
              a5 = n2.call(t2, c3);
            } catch (t3) {
              a5 = [6, t3], e2 = 0;
            } finally {
              r4 = o5 = 0;
            }
          if (5 & a5[0])
            throw a5[1];
          return { value: a5[0] ? a5[1] : void 0, done: true };
        }([a4, l3]);
      };
    }
  }

  // ../node_modules/@tauri-apps/api/tauri-fa8f44bd.js
  function o2(n2, t2) {
    void 0 === t2 && (t2 = false);
    var e2 = window.crypto.getRandomValues(new Uint32Array(1))[0], o5 = "_".concat(e2);
    return Object.defineProperty(window, o5, { value: function(e3) {
      return t2 && Reflect.deleteProperty(window, o5), null == n2 ? void 0 : n2(e3);
    }, writable: false, configurable: true }), e2;
  }
  function r2(r4, c3) {
    return void 0 === c3 && (c3 = {}), o(this, void 0, void 0, function() {
      return a(this, function(n2) {
        return [2, new Promise(function(n3, t2) {
          var i2 = o2(function(t3) {
            n3(t3), Reflect.deleteProperty(window, "_".concat(a3));
          }, true), a3 = o2(function(n4) {
            t2(n4), Reflect.deleteProperty(window, "_".concat(i2));
          }, true);
          window.__TAURI_IPC__(r({ cmd: r4, callback: i2, error: a3 }, c3));
        })];
      });
    });
  }
  function c(n2, t2) {
    void 0 === t2 && (t2 = "asset");
    var e2 = encodeURIComponent(n2);
    return navigator.userAgent.includes("Windows") ? "https://".concat(t2, ".localhost/").concat(e2) : "".concat(t2, "://").concat(e2);
  }
  var i = Object.freeze({ __proto__: null, transformCallback: o2, invoke: r2, convertFileSrc: c });

  // ../node_modules/@tauri-apps/api/tauri-7cafdaf8.js
  function o3(o5) {
    return o(this, void 0, void 0, function() {
      return a(this, function(i2) {
        return [2, r2("tauri", o5)];
      });
    });
  }

  // ../node_modules/@tauri-apps/api/event-aba177ae.js
  function r3(e2, r4) {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Event", message: { cmd: "unlisten", event: e2, eventId: r4 } })];
      });
    });
  }
  function u(e2, r4, u3) {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        switch (t2.label) {
          case 0:
            return [4, o3({ __tauriModule: "Event", message: { cmd: "emit", event: e2, windowLabel: r4, payload: "string" == typeof u3 ? u3 : JSON.stringify(u3) } })];
          case 1:
            return t2.sent(), [2];
        }
      });
    });
  }
  function o4(u3, o5, s4) {
    return o(this, void 0, void 0, function() {
      var a3 = this;
      return a(this, function(c3) {
        return [2, o3({ __tauriModule: "Event", message: { cmd: "listen", event: u3, windowLabel: o5, handler: o2(s4) } }).then(function(i2) {
          return function() {
            return o(a3, void 0, void 0, function() {
              return a(this, function(t2) {
                return [2, r3(u3, i2)];
              });
            });
          };
        })];
      });
    });
  }
  function s(i2, e2, u3) {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o4(i2, e2, function(t3) {
          u3(t3), r3(i2, t3.id).catch(function() {
          });
        })];
      });
    });
  }

  // ../node_modules/@tauri-apps/api/window-5b72c451.js
  var s2;
  var d = function(t2, e2) {
    this.type = "Logical", this.width = t2, this.height = e2;
  };
  var l = function() {
    function t2(t3, e2) {
      this.type = "Physical", this.width = t3, this.height = e2;
    }
    return t2.prototype.toLogical = function(t3) {
      return new d(this.width / t3, this.height / t3);
    }, t2;
  }();
  var c2 = function(t2, e2) {
    this.type = "Logical", this.x = t2, this.y = e2;
  };
  var h = function() {
    function t2(t3, e2) {
      this.type = "Physical", this.x = t3, this.y = e2;
    }
    return t2.prototype.toLogical = function(t3) {
      return new c2(this.x / t3, this.y / t3);
    }, t2;
  }();
  function p() {
    return new b(window.__TAURI_METADATA__.__currentWindow.label, { skip: true });
  }
  function f() {
    return window.__TAURI_METADATA__.__windows.map(function(t2) {
      return new b(t2.label, { skip: true });
    });
  }
  !function(t2) {
    t2[t2.Critical = 1] = "Critical", t2[t2.Informational = 2] = "Informational";
  }(s2 || (s2 = {}));
  var m;
  var y = ["tauri://created", "tauri://error"];
  var v = function() {
    function t2(t3) {
      this.label = t3, this.listeners = /* @__PURE__ */ Object.create(null);
    }
    return t2.prototype.listen = function(t3, n2) {
      return o(this, void 0, void 0, function() {
        var e2 = this;
        return a(this, function(i2) {
          return this._handleTauriEvent(t3, n2) ? [2, Promise.resolve(function() {
            var i3 = e2.listeners[t3];
            i3.splice(i3.indexOf(n2), 1);
          })] : [2, o4(t3, this.label, n2)];
        });
      });
    }, t2.prototype.once = function(t3, n2) {
      return o(this, void 0, void 0, function() {
        var e2 = this;
        return a(this, function(i2) {
          return this._handleTauriEvent(t3, n2) ? [2, Promise.resolve(function() {
            var i3 = e2.listeners[t3];
            i3.splice(i3.indexOf(n2), 1);
          })] : [2, s(t3, this.label, n2)];
        });
      });
    }, t2.prototype.emit = function(t3, n2) {
      return o(this, void 0, void 0, function() {
        var e2, o5;
        return a(this, function(i2) {
          if (y.includes(t3)) {
            for (e2 = 0, o5 = this.listeners[t3] || []; e2 < o5.length; e2++)
              (0, o5[e2])({ event: t3, id: -1, windowLabel: this.label, payload: n2 });
            return [2, Promise.resolve()];
          }
          return [2, u(t3, this.label, n2)];
        });
      });
    }, t2.prototype._handleTauriEvent = function(t3, e2) {
      return !!y.includes(t3) && (t3 in this.listeners ? this.listeners[t3].push(e2) : this.listeners[t3] = [e2], true);
    }, t2;
  }();
  var g = function(r4) {
    function a3() {
      return null !== r4 && r4.apply(this, arguments) || this;
    }
    return n(a3, r4), a3.prototype.scaleFactor = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "scaleFactor" } } } })];
        });
      });
    }, a3.prototype.innerPosition = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "innerPosition" } } } }).then(function(t3) {
            var e2 = t3.x, i2 = t3.y;
            return new h(e2, i2);
          })];
        });
      });
    }, a3.prototype.outerPosition = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "outerPosition" } } } }).then(function(t3) {
            var e2 = t3.x, i2 = t3.y;
            return new h(e2, i2);
          })];
        });
      });
    }, a3.prototype.innerSize = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "innerSize" } } } }).then(function(t3) {
            var e2 = t3.width, i2 = t3.height;
            return new l(e2, i2);
          })];
        });
      });
    }, a3.prototype.outerSize = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "outerSize" } } } }).then(function(t3) {
            var e2 = t3.width, i2 = t3.height;
            return new l(e2, i2);
          })];
        });
      });
    }, a3.prototype.isFullscreen = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "isFullscreen" } } } })];
        });
      });
    }, a3.prototype.isMaximized = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "isMaximized" } } } })];
        });
      });
    }, a3.prototype.isDecorated = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "isDecorated" } } } })];
        });
      });
    }, a3.prototype.isResizable = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "isResizable" } } } })];
        });
      });
    }, a3.prototype.isVisible = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "isVisible" } } } })];
        });
      });
    }, a3.prototype.theme = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "theme" } } } })];
        });
      });
    }, a3.prototype.center = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "center" } } } })];
        });
      });
    }, a3.prototype.requestUserAttention = function(t2) {
      return o(this, void 0, void 0, function() {
        var e2;
        return a(this, function(i2) {
          return e2 = null, t2 && (e2 = t2 === s2.Critical ? { type: "Critical" } : { type: "Informational" }), [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "requestUserAttention", payload: e2 } } } })];
        });
      });
    }, a3.prototype.setResizable = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setResizable", payload: t2 } } } })];
        });
      });
    }, a3.prototype.setTitle = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setTitle", payload: t2 } } } })];
        });
      });
    }, a3.prototype.maximize = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "maximize" } } } })];
        });
      });
    }, a3.prototype.unmaximize = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "unmaximize" } } } })];
        });
      });
    }, a3.prototype.toggleMaximize = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "toggleMaximize" } } } })];
        });
      });
    }, a3.prototype.minimize = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "minimize" } } } })];
        });
      });
    }, a3.prototype.unminimize = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "unminimize" } } } })];
        });
      });
    }, a3.prototype.show = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "show" } } } })];
        });
      });
    }, a3.prototype.hide = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "hide" } } } })];
        });
      });
    }, a3.prototype.close = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "close" } } } })];
        });
      });
    }, a3.prototype.setDecorations = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setDecorations", payload: t2 } } } })];
        });
      });
    }, a3.prototype.setAlwaysOnTop = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setAlwaysOnTop", payload: t2 } } } })];
        });
      });
    }, a3.prototype.setSize = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e2) {
          if (!t2 || "Logical" !== t2.type && "Physical" !== t2.type)
            throw new Error("the `size` argument must be either a LogicalSize or a PhysicalSize instance");
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setSize", payload: { type: t2.type, data: { width: t2.width, height: t2.height } } } } } })];
        });
      });
    }, a3.prototype.setMinSize = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e2) {
          if (t2 && "Logical" !== t2.type && "Physical" !== t2.type)
            throw new Error("the `size` argument must be either a LogicalSize or a PhysicalSize instance");
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setMinSize", payload: t2 ? { type: t2.type, data: { width: t2.width, height: t2.height } } : null } } } })];
        });
      });
    }, a3.prototype.setMaxSize = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e2) {
          if (t2 && "Logical" !== t2.type && "Physical" !== t2.type)
            throw new Error("the `size` argument must be either a LogicalSize or a PhysicalSize instance");
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setMaxSize", payload: t2 ? { type: t2.type, data: { width: t2.width, height: t2.height } } : null } } } })];
        });
      });
    }, a3.prototype.setPosition = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e2) {
          if (!t2 || "Logical" !== t2.type && "Physical" !== t2.type)
            throw new Error("the `position` argument must be either a LogicalPosition or a PhysicalPosition instance");
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setPosition", payload: { type: t2.type, data: { x: t2.x, y: t2.y } } } } } })];
        });
      });
    }, a3.prototype.setFullscreen = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setFullscreen", payload: t2 } } } })];
        });
      });
    }, a3.prototype.setFocus = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setFocus" } } } })];
        });
      });
    }, a3.prototype.setIcon = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setIcon", payload: { icon: "string" == typeof t2 ? t2 : Array.from(t2) } } } } })];
        });
      });
    }, a3.prototype.setSkipTaskbar = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setSkipTaskbar", payload: t2 } } } })];
        });
      });
    }, a3.prototype.setCursorGrab = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setCursorGrab", payload: t2 } } } })];
        });
      });
    }, a3.prototype.setCursorVisible = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setCursorVisible", payload: t2 } } } })];
        });
      });
    }, a3.prototype.setCursorIcon = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setCursorIcon", payload: t2 } } } })];
        });
      });
    }, a3.prototype.setCursorPosition = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e2) {
          if (!t2 || "Logical" !== t2.type && "Physical" !== t2.type)
            throw new Error("the `position` argument must be either a LogicalPosition or a PhysicalPosition instance");
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "setCursorPosition", payload: { type: t2.type, data: { x: t2.x, y: t2.y } } } } } })];
        });
      });
    }, a3.prototype.startDragging = function() {
      return o(this, void 0, void 0, function() {
        return a(this, function(t2) {
          return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { label: this.label, cmd: { type: "startDragging" } } } })];
        });
      });
    }, a3.prototype.onResized = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e2) {
          return [2, this.listen("tauri://resize", t2)];
        });
      });
    }, a3.prototype.onMoved = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e2) {
          return [2, this.listen("tauri://move", t2)];
        });
      });
    }, a3.prototype.onCloseRequested = function(t2) {
      return o(this, void 0, void 0, function() {
        var e2 = this;
        return a(this, function(i2) {
          return [2, this.listen("tauri://close-requested", function(i3) {
            var n2 = new _(i3);
            Promise.resolve(t2(n2)).then(function() {
              if (!n2.isPreventDefault())
                return e2.close();
            });
          })];
        });
      });
    }, a3.prototype.onFocusChanged = function(t2) {
      return o(this, void 0, void 0, function() {
        var e2, o5;
        return a(this, function(i2) {
          switch (i2.label) {
            case 0:
              return [4, this.listen("tauri://focus", function(e3) {
                t2(r(r({}, e3), { payload: true }));
              })];
            case 1:
              return e2 = i2.sent(), [4, this.listen("tauri://blur", function(e3) {
                t2(r(r({}, e3), { payload: false }));
              })];
            case 2:
              return o5 = i2.sent(), [2, function() {
                e2(), o5();
              }];
          }
        });
      });
    }, a3.prototype.onScaleChanged = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e2) {
          return [2, this.listen("tauri://scale-change", t2)];
        });
      });
    }, a3.prototype.onMenuClicked = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e2) {
          return [2, this.listen("tauri://menu", t2)];
        });
      });
    }, a3.prototype.onFileDropEvent = function(t2) {
      return o(this, void 0, void 0, function() {
        var e2, o5, r5;
        return a(this, function(i2) {
          switch (i2.label) {
            case 0:
              return [4, this.listen("tauri://file-drop", function(e3) {
                t2(r(r({}, e3), { payload: { type: "drop", paths: e3.payload } }));
              })];
            case 1:
              return e2 = i2.sent(), [4, this.listen("tauri://file-drop-hover", function(e3) {
                t2(r(r({}, e3), { payload: { type: "hover", paths: e3.payload } }));
              })];
            case 2:
              return o5 = i2.sent(), [4, this.listen("tauri://file-drop-cancelled", function(e3) {
                t2(r(r({}, e3), { payload: { type: "cancel" } }));
              })];
            case 3:
              return r5 = i2.sent(), [2, function() {
                e2(), o5(), r5();
              }];
          }
        });
      });
    }, a3.prototype.onThemeChanged = function(t2) {
      return o(this, void 0, void 0, function() {
        return a(this, function(e2) {
          return [2, this.listen("tauri://theme-changed", t2)];
        });
      });
    }, a3;
  }(v);
  var _ = function() {
    function t2(t3) {
      this._preventDefault = false, this.event = t3.event, this.windowLabel = t3.windowLabel, this.id = t3.id;
    }
    return t2.prototype.preventDefault = function() {
      this._preventDefault = true;
    }, t2.prototype.isPreventDefault = function() {
      return this._preventDefault;
    }, t2;
  }();
  var b = function(r4) {
    function a3(t2, a4) {
      void 0 === a4 && (a4 = {});
      var u3 = r4.call(this, t2) || this;
      return (null == a4 ? void 0 : a4.skip) || o3({ __tauriModule: "Window", message: { cmd: "createWebview", data: { options: r({ label: t2 }, a4) } } }).then(function() {
        return o(u3, void 0, void 0, function() {
          return a(this, function(t3) {
            return [2, this.emit("tauri://created")];
          });
        });
      }).catch(function(t3) {
        return o(u3, void 0, void 0, function() {
          return a(this, function(e2) {
            return [2, this.emit("tauri://error", t3)];
          });
        });
      }), u3;
    }
    return n(a3, r4), a3.getByLabel = function(t2) {
      return f().some(function(e2) {
        return e2.label === t2;
      }) ? new a3(t2, { skip: true }) : null;
    }, a3;
  }(g);
  function w() {
    return o(this, void 0, void 0, function() {
      return a(this, function(t2) {
        return [2, o3({ __tauriModule: "Window", message: { cmd: "manage", data: { cmd: { type: "currentMonitor" } } } })];
      });
    });
  }
  function M() {
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
  "__TAURI_METADATA__" in window ? m = new b(window.__TAURI_METADATA__.__currentWindow.label, { skip: true }) : (console.warn('Could not find "window.__TAURI_METADATA__". The "appWindow" value will reference the "main" window label.\nNote that this is not an issue if running this frontend on a browser instead of a Tauri window.'), m = new b("main", { skip: true }));
  var z = Object.freeze({ __proto__: null, WebviewWindow: b, WebviewWindowHandle: v, WindowManager: g, CloseRequestedEvent: _, getCurrent: p, getAll: f, get appWindow() {
    return m;
  }, LogicalSize: d, PhysicalSize: l, LogicalPosition: c2, PhysicalPosition: h, get UserAttentionType() {
    return s2;
  }, currentMonitor: w, primaryMonitor: M, availableMonitors: W });

  // ../node_modules/@tauri-apps/api/event-1823ec51.js
  function e(o5, r4) {
    return o(this, void 0, void 0, function() {
      return a(this, function(n2) {
        return [2, o4(o5, null, r4)];
      });
    });
  }
  function u2(i2, r4) {
    return o(this, void 0, void 0, function() {
      return a(this, function(n2) {
        return [2, s(i2, null, r4)];
      });
    });
  }
  function s3(i2, o5) {
    return o(this, void 0, void 0, function() {
      return a(this, function(n2) {
        return [2, u(i2, void 0, o5)];
      });
    });
  }
  var a2 = Object.freeze({ __proto__: null, listen: e, once: u2, emit: s3 });

  // preview.jsx
  var video = void 0;
  var started = false;
  var videoSources = [];
  var curVideoIndex = 0;
  var addVideoSource = (videoElement, newSource) => {
    if (!videoSources.includes(newSource)) {
      videoSources.push(c(newSource));
    }
  };
  var onVideoEnded = () => {
    curVideoIndex++;
    console.log("video ended, switching to next video", curVideoIndex);
    if (curVideoIndex >= videoSources.length) {
      curVideoIndex = 0;
    }
    video.src = videoSources[curVideoIndex];
    console.log("set video src to", videoSources[curVideoIndex]);
    console.log("video sources", videoSources);
    video.play();
  };
  m.listen("video-ready", (event) => {
    addVideoSource(video, event.payload.message);
    if (!started) {
      started = true;
      video = document.getElementById("video");
      console.log("starting video");
      video.onended = onVideoEnded;
      video.src = videoSources[0];
      video.play();
    }
  });
})();
