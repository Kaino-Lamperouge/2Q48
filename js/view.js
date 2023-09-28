var View = (function () {

    var tileContainer = $('.tile-container')[0];
    var scoreContainer = $('.score-container')[0];
    var scoreDom = $('.score-container .score')[0];
    var scoreAddition = $('.score-addition')[0];
    var bestDom = $('.best-container .score')[0];
    var failureContainer = $('.failure-container')[0];
    var winningContainer = $('.winning-container')[0];

    var timeDom = $(".time")[0];

    var game = null;
    var View = function () {

    };

    View.prototype = {
        init: function (g, data) {
            game = g;
            this.updateTime(data.time);
        },
        two_char: function (n) {
            return n >= 10 ? n : "0" + n;
        },
        updateTime: function (time) {
            var m = 0;
            var h = 0;
            if (time > 60) {
                m = parseInt(time / 60);
                time = parseInt(time % 60);
                if (m > 60) {
                    h = parseInt(m / 60);
                    m = parseInt(m % 60);
                }
            }
            timeDom.innerHTML =
                this.two_char(h) +
                ":" +
                this.two_char(m) +
                ":" +
                this.two_char(time);
        },

        setup: function () {
            // failureContainer.classList.remove('action');
            // winningContainer.classList.remove('action');
            this.updateScore(data.score);
            this.updateBest();
        },
        restart: function () {
            tileContainer.innerHTML = "";
        },
        resize: function () {
            var _this = this;
            data.cell.forEach(function (el, index) {
                var tile = _this.getTile(index);
                if (!tile) return;
                var pos = _this.getPos(indexToPos(index));
                _this.setPos(tile, pos);
            });
        },
        restoreTile: function () {
            var _this = this;
            data.cell.forEach(function (el, index) {
                if (el.val !== 0) {
                    _this.appear(index);
                }
            });
        },
        addScoreAnimation: function (score) {
            if (!score) return;
            scoreAddition.innerHTML = '+' + score;
            scoreAddition.classList.add('action');
            setTimeout(function () {
                scoreAddition.classList.remove('action');
            }, 500);
        },
        updateScore: function (score) {
            scoreDom.innerHTML = data.score;
            this.addScoreAnimation(score);
        },
        updateBest: function () {
            bestDom.innerHTML = data.best;
        },
        setInfo: function (elem, pos, index) {
            elem.style.left = pos.left + 'px';
            elem.style.top = pos.top + 'px';
            elem.setAttribute('data-index', index);
        },
        getTile: function (index) {
            return $(`.tile[data-index='${index}']`)[0];
        },
        getPos: function (pos) {
            var gridCell = $(`.grid-row:nth-child(${pos.y + 1}) .grid-cell:nth-child(${pos.x + 1})`)[0];
            return {
                left: gridCell.offsetLeft,
                top: gridCell.offsetTop,
            }
        },
        setPos: function (elem, pos) {
            elem.style.left = pos.left + 'px';
            elem.style.top = pos.top + 'px';
        },
        setImg: function (val) {
            switch (val) {
                case 2: return "https://pic.imgdb.cn/item/64d86d751ddac507cc63be9b.jpg";
                case 4: return "https://pic.imgdb.cn/item/64d86d751ddac507cc63bebb.jpg";
                case 8: return "https://pic.imgdb.cn/item/64d86d751ddac507cc63bece.jpg";
                case 16: return "https://pic.imgdb.cn/item/64d86d751ddac507cc63befa.jpg";
                case 32: return "https://pic.imgdb.cn/item/64d86d751ddac507cc63bf0a.jpg";
                case 64: return "https://pic.imgdb.cn/item/64d86d751ddac507cc63bc8f.jpg";
                case 128: return "https://pic.imgdb.cn/item/64d86d751ddac507cc63bcba.jpg";
                case 256: return "https://pic.imgdb.cn/item/64d86d751ddac507cc63bce4.jpg";
                case 512: return "https://pic.imgdb.cn/item/64d86d751ddac507cc63bd1c.jpg";
                case 1024: return "https://pic.imgdb.cn/item/64d86d751ddac507cc63bd4a.jpg";
                case 2048: return "https://pic.imgdb.cn/item/64d86d751ddac507cc63bd72.jpg";
                case 4096: return "https://pic.imgdb.cn/item/64d86d751ddac507cc63bdd0.jpg";
                case 8192: return "https://pic.imgdb.cn/item/64d86d751ddac507cc63be01.jpg";
                case 16384: return "https://pic.imgdb.cn/item/64d86d751ddac507cc63be35.jpg";
                case 32768: return "https://pic.imgdb.cn/item/64d86d751ddac507cc63be67.jpg";
                // case 65536: return "images/11.jpg"; break;
                // case 131072: return "images/12.jpg"; break;
            }
            return "";
        },
        createTileHTML: function (obj) {
            var tile = document.createElement('img');
            tile.className = obj.classNames;
            tile.src = this.setImg(obj.val)
            tile.setAttribute('data-index', obj.index);
            tile.setAttribute('data-val', obj.val);
            this.setPos(tile, obj.pos);
            return tile;
        },
        appear: function (index) {
            var last = data.cell[index];
            var pos = this.getPos(indexToPos(index));
            var newTile = this.createTileHTML({
                val: last.val,
                pos: pos,
                index: index,
                classNames: " tile new-tile",
            });
            tileContainer.appendChild(newTile);
        },
        remove: function (index) {
            var tile = this.getTile(index);
            tile.parentElement.removeChild(tile);
        },
        move: function (old_index, index) {
            var tile = this.getTile(old_index);
            var pos = this.getPos(indexToPos(index));
            this.setInfo(tile, pos, index);
        },
        updateVal: function (index) {
            var tile = this.getTile(index);
            var val = data.cell[index].val;
            tile.setAttribute('data-val', val);
            tile.src = this.setImg(val)
            tile.classList.add('addition');
            setTimeout(function () {
                tile.classList.remove('addition');
                tile.classList.remove('new-tile');
            }, 300);
        },
    }

    return View;

})();