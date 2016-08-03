.pragma library
.import "rpc.js" as Rpc
.import QtQuick.Signals 2.0 as QS
.import QtQuick.LocalStorage 2.0 as Sql

// Init, login
var init, login, isLogged, logout;

// Update local cache from server
var update;

// Read local data
var getName, getLevel, getHp, getHpMax, getMp, getMpMax, getXp, getXpNext,
        getGold, getGems;
var listHabits;
var getProfilePictureUrl;

// Mutate local and remote data
var habitClick;

// Signals
var signals = Qt.createQmlObject("\
    import QtQuick 2.0;
    QtObject {
        signal updateStats()
        signal updateTasks()
    }", Qt.application, "signals");

 (function () {

     var db;
     var configCache = {};
     var configDefaults = {
         apiUrl: "https://habitica.com",
     };
     var data = {};

     function setupRpc() {
         if (configGet("apiUser")) {
             Rpc.apiUrl = configGet("apiUrl");
             Rpc.apiUser = configGet("apiUser");
             Rpc.apiKey = configGet("apiKey");
         }
     }

     function colorForValue(value) {
         // Stolen from HabitRPG/common/script/libs/taskClasses.js
         if (value < -20) {
             return "#cc5f49"; // "#e6b8af";
         } else if (value < -10) {
             return "#db6060"; // "#f4cccc";
         } else if (value < -1) {
             return "#e2a25d"; // "#fce5cd";
         } else if (value < 1) {
             return "#e5c35b"; // "#fff2cc";
         } else if (value < 5) {
             return "#84d168"; // "#d9ead3"
         } else if (value < 10) {
             return "#68bac9"; // "#d0e0e3";
         } else {
             return "#5a8add"; // "#c9daf8";
         }
     }

     function sortTasks(ids, tasks) {
         var r = [];
         for (var i in ids) {
             for (var j in tasks) {
                 if (tasks[j].id === ids[i]) r.push(tasks[j]);
             }
         }
         return r;
     }

     init = function () {
         db = Sql.LocalStorage.openDatabaseSync("HabitSailor", "", "HabitSailor", 1000000);
         print("DB: version: " + db.version)
         if (db.version === "") {
             db.changeVersion(db.version, "0.0.1", function (tx) {
                 print("DB: updating to 0.0.1")
                 tx.executeSql("create table config (k text primary key, v text)");
             });
         }
         db.readTransaction(function (tx) {
             var r = tx.executeSql("select k, v from config");
             for (var i = 0; i < r.rows.length; i++) {
                 configCache[r.rows.item(i).k] = r.rows.item(i).v;
             }
         })
         setupRpc();
     }

     // TODO signal connect for updates

     function configGet(key) {
         return configCache[key];
     }

     function configSet(key, value, tx) {
         if (configCache[key] !== value) {
             configCache[key] = value;
             db.transaction(function (tx) {
                 tx.executeSql("insert or replace into config (k, v) values (?, ?)", [ key, value ]);
             });
         }
     }

     isLogged = function () {
         return !!(configGet("apiUser") && configGet("apiKey"));
     }

     update = function (cb) {
         var cs = new Rpc.CallSeq(function () { if (cb) cb(false); });
         cs.autofail = true;
         cs.push("/user", "get", {}, function (ok, r) {
             data.tasksOrder = r.tasksOrder;
             data.balance = r.balance;
             data.name = r.profile.name;
             data.stats = r.stats;
             signals.updateStats();
             return true;
         });
         cs.push("/tasks/user", "get", {}, function (ok, r) {
             data.habits = [];
             for (var i in r) {
                 var item = r[i];
                 item.color = colorForValue(item.value);
                 switch (item.type) {
                 case "habit": data.habits.push(item); break;
                     //case "todo": data.todos.push(item); break;
                     //case "daily": data.dailies.push(item); break;
                 }
             }
             data.habits = sortTasks(data.tasksOrder.habits, data.habits)
             signals.updateTasks();
             if (cb) cb(true);
             return true;
         });
         cs.run();
     }

     getName = function () { return data.name; }
     getLevel = function () { return data.stats.lvl; }
     getHp = function () { return data.stats.hp; }
     getHpMax = function () { return data.stats.maxHealth; }
     getMp = function () { return data.stats.mp; }
     getMpMax = function () { return data.stats.maxMP; }
     getXp = function () { return data.stats.exp; }
     getXpNext = function () { return data.stats.toNextLevel; }
     getGold = function () { return Math.floor(parseFloat(data.stats.gp)); }
     getGems = function () { return Math.floor(parseFloat(data.balance) * 4); }

     listHabits = function () { return data.habits; }

     getProfilePictureUrl = function () {
         return configGet("apiUrl") + "/export/avatar-" + configGet("apiUser") + ".png"
     }

     login = function (url, login, password, success, error) {
         url = url || configDefaults.apiUrl;
         Rpc.setUrl(url);
         Rpc.call("/user/auth/local/login", "post",
                  { username: login, password: password },
                  function (ok, r) {
                      if (ok) {
                          configSet("apiUrl", url);
                          configSet("apiUser", r.id);
                          configSet("apiKey", r.apiToken);
                          setupRpc();
                          success();
                      } else {
                          error(Rpc.err(r));
                      }
                  });
     }

     logout = function () {
         configSet("apiUrl", null);
         configSet("apiUser", null);
         configSet("apiKey", null);
     }

     function partialStatsUpdate(stats) {
         if (stats.lvl !== data.stats.lvl) {
             update();
         } else {
             ["gp", "hp", "mp", "exp"].every(function (k) {
                 if (stats.hasOwnProperty(k))
                    data.stats[k] = stats[k];
                 return true;
             });
             signals.updateStats();
         }
     }

     habitClick = function (tid, orientation, cb) {
         var habit;
         if (data.habits.every(function (item) { return item.id !== tid || !(habit = item); })) return;

         Rpc.call("/tasks/:tid/score/:dir", "post-no-body", { tid: tid, dir: orientation }, function (ok, o) {
             if (ok) {
                 habit.value += o.delta;
                 partialStatsUpdate(o);
                 cb(true, colorForValue(habit.value));
             } else {
                 cb(false);
             }
         });
     }

 })()
