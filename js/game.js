var Game = (function () {
    var cell = data.cell;
    var over = false;
    var move = false;

    var timeCooldown = 60;

    var Game = function (view) { };
    Game.prototype = {
        init: function (view) {
            var _this = this;
            this.view = view;
            var history = this.getHistory();
            if (history) {
                this.restoreHistory(history);
            } else {
                this.initCell();
                this.start();
            }
            this.view = new View();
            this.view.init(this, data);
            this.timeStart();
            this.setBest();
            setTimeout(function () {
                _this.view.setup();
            });
        },
        timeStart: function () {
            this.update();
        },
        update: function () {
            this.updateTime();
            window.requestAnimationFrame(this.update.bind(this));
        },

        updateTime: function () {
            timeCooldown--;
            if (!over) {
                if (!timeCooldown) {
                    timeCooldown = 60;
                    data.time++;
                    this.view.updateTime(data.time);
                }
            }
            localStorage.time = JSON.stringify({
                time: data.time,
            });
            if(over){
                localStorage.time = '';
            }
        },

        start: function () {
            for (var i = 0; i < 2; i++) {
                this.randomAddItem();
            }
        },
        restart: function () {
            var _this = this;
            over = false;
            this.initCell();
            this.view.restart();
            this.start();
            data.score = 0;
            this.save();
            setTimeout(function () {
                _this.view.setup();
            });
        },
        save: function () {
            localStorage.bestScore = data.best;
            localStorage.gameState = JSON.stringify({
                cell: data.cell,
                socre: data.score,
            });
        },
        winning() {
            over = false;
            localStorage.gameState = "";
            localStorage.time = '';
            setTimeout(function () {
                var str = "恭喜！你已经打败了100.00%的元气弹！";
                alert(str);
                location.reload();
            }, 300);
        },
        checkWinning() {
            var isWinning = cell.find(function (el) {
                return el.val === config.max;
            });
            if (isWinning) {
                this.winning();
            }
        },
        failure: function () {
            over = true;
            setTimeout(function () {
                if (0 <= data.score && data.score <= 250) {
                    alert("恭喜你已经打败了0.00……01%的元气弹~");
                } else if (250 <= data.score && data.score <= 700) {
                    alert("好玩吗？别忘了分享给弹弹们！");
                } else if (700 <= data.score && data.score <= 1300) {
                    alert("再来一次，挑战最高分吧！");
                } else if (1300 <= data.score && data.score <= 2700) {
                    alert("就差一点点啦！");
                } else if (2700 <= data.score && data.score <= 5500) {
                    alert("猜猜下一张图片是什么？");
                } else {
                    alert("神级操作！继续挑战更高难度吧！");
                }
                // location.reload();
            }, 300);
            localStorage.gameState = "";
            localStorage.time = '';
        },
        checkfailure: function () {
            var _this = this;
            var same = false;
            var called = function (arr, str) {
                if (same) return;
                same = arr.some(function (el) {
                    return _this.checkSame(el);
                });
            };
            called(this.chunkX(), "x");
            called(this.chunkY(), "y");
            setTimeout(function () {
                if (!same) {
                    _this.failure();
                }
            });
        },
        checkSame: function (arr, index) {
            same = arr.some(function (el, index, arr) {
                if (index === arr.length - 1) return;
                return el.val === arr[index + 1].val;
                return true;
            });
            return same;
        },
        setBest: function () {
            var best = getLocalStorage("bestScore");
            data.best = best || 0;
        },
        getHistory: function () {
            var gameState = getLocalStorage("gameState");
            var time = getLocalStorage("time");
            if (gameState && gameState.socre && gameState.cell && time) {
                const history = Object.assign(gameState, time)
                return history;
            }
        },
        restoreHistory: function (history) {
            data.cell = history.cell;
            data.score = history.socre;
            data.time = history.time;
            cell = data.cell;
            this.view.restoreTile();
        },
        initCell: function () {
            for (var i = 0; i < 16; i++) {
                cell[i] = {
                    val: 0,
                    index: i,
                };
            }
        },
        addScore: function (score) {
            data.score += score;
            if (data.best < data.score) {
                data.best = data.score;
                this.view.updateBest();
            }
            this.view.updateScore(score);
        },
        chunkX: function () {
            var new_cell = [];
            for (var i = 0; i < cell.length; i += 4) {
                new_cell.push(cell.slice(i, i + 4));
            }
            return new_cell;
        },
        chunkY: function () {
            var arr = this.chunkX();
            var new_cell = [[], [], [], []];
            for (var i = 0; i < arr.length; i++) {
                for (var j = 0; j < arr[i].length; j++) {
                    new_cell[j][i] = arr[i][j];
                }
            }
            return new_cell;
        },
        arrayInnerReverse: function (arr) {
            arr.forEach(function (el, index) {
                arr[index] = el.reverse();
            });
            return arr;
        },
        updatePos: function (old_index, index) {
            cell[index].val = cell[old_index].val;
            cell[old_index].val = 0;
            move = true;
            return old_index;
        },
        updateVal: function (index, val) {
            var _this = this;
            cell[index].val = val;
            setTimeout(function () {
                _this.view.updateVal(index);
            }, 0);
        },
        updateItem: function (old_index, index) {
            if (cell[old_index] === cell[index]) return;
            var old_index = this.updatePos(old_index, index);
            this.view.move(old_index, index);
        },
        removeItem: function (index) {
            cell[index].val = 0;
            this.view.remove(index);
        },
        getSum: function (obj, i, j) {
            return obj[i].val + obj[j].val;
        },
        move: function (dir) {
            if (over) return;
            var _this = this;
            var _score = 0;
            var _move = false;
            var new_cell = [];
            if (dir === 0 || dir === 2) {
                new_cell = this.chunkX();
            } else if (dir === 1 || dir === 3) {
                new_cell = this.chunkY();
            }
            if (dir === 2 || dir === 3) {
                new_cell = this.arrayInnerReverse(new_cell);
            }
            new_cell.forEach(function (arr, index) {
                var moveInfo = _this.moving(arr, indexs[dir][index]);
                _score += moveInfo.score;
            });
            this.addScore(_score);
            if (move) {
                this.randomAddItem();
                _move = true;
                move = false;
            }
            this.save();
            this.checkWinning();
            if (this.isFull()) {
                this.checkfailure();
            }
            return {
                move: _move,
            };
        },
        mergeMove: function (_cell, index, num1, num2, num3) {
            var sum = this.getSum(_cell, num1, num2);
            this.removeItem(_cell[num1].index);
            this.updateItem(_cell[num2].index, index[num3]);
            this.updateVal(index[num3], sum);
        },
        normalMove: function (_cell, index) {
            var _this = this;
            _cell.forEach(function (el, i) {
                _this.updateItem(_cell[i].index, index[i]);
            });
        },
        moving: function (arr, index) {
            var _this = this;
            var _score = 0;
            var _cell = arr.filter(function (el) {
                return el.val !== 0;
            });
            if (_cell.length === 0) {
                return {
                    score: 0,
                };
            }
            var calls = [
                function () {
                    _this.normalMove(_cell, index);
                },
                function () {
                    if (_cell[0].val === _cell[1].val) {
                        _this.mergeMove(_cell, index, 0, 1, 0);
                        _score += config.bonus_point;
                    } else {
                        _this.normalMove(_cell, index);
                    }
                },
                function () {
                    if (_cell[0].val === _cell[1].val) {
                        _this.mergeMove(_cell, index, 0, 1, 0);
                        _this.updateItem(_cell[2].index, index[1]);
                        _score += config.bonus_point;
                    } else if (_cell[1].val === _cell[2].val) {
                        _this.updateItem(_cell[0].index, index[0]);
                        _this.mergeMove(_cell, index, 1, 2, 1);
                        _score += config.bonus_point;
                    } else {
                        _this.normalMove(_cell, index);
                    }
                },
                function () {
                    if (_cell[0].val === _cell[1].val) {
                        _this.mergeMove(_cell, index, 0, 1, 0);
                        _score += config.bonus_point;
                        if (_cell[2].val === _cell[3].val) {
                            _this.mergeMove(_cell, index, 2, 3, 1);
                            _score += config.bonus_point;
                        } else {
                            _this.updateItem(_cell[2].index, index[1]);
                            _this.updateItem(_cell[3].index, index[2]);
                        }
                    } else if (_cell[1].val === _cell[2].val) {
                        _this.mergeMove(_cell, index, 1, 2, 1);
                        _this.updateItem(_cell[3].index, index[2]);
                        _score += config.bonus_point;
                    } else if (_cell[2].val === _cell[3].val) {
                        _this.mergeMove(_cell, index, 2, 3, 2);
                        _score += config.bonus_point;
                    }
                },
            ];
            calls[_cell.length - 1]();
            return {
                score: _score,
            };
        },
        isFull: function () {
            var full = cell.filter(function (el) {
                return el.val === 0;
            });
            return full.length === 0;
        },
        randomAddItem: function () {
            if (this.isFull()) return;
            while (true) {
                var index = random(0, data.cell.length - 1);
                var exist = data.cell[index].val !== 0;
                if (!exist) {
                    this.addItem(index, Math.random() < 0.5 ? 2 : 4);
                    break;
                }
            }
        },
        addItem: function (index, val) {
            data.cell[index] = {
                val: val,
                index: index,
            };
            this.view.appear(index);
        },
    };

    return Game;
})();
