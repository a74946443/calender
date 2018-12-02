function Calender(config) {
    const maxRow = 6,
        oneWeek = 7,
        oneDayMilliseconds = 86400000,
        day = {date: null, format: '', class: ['body_cell'], today: false, showDay: 0, curMonth: true},
        head_cn = ['日', '一', '二', '三', '四', '五', '六'],
        head_en = ['Sun.', 'Mon.', 'Tue.', 'Wen.', 'Thr.', 'Fri.', 'Sat.'];

    let dataArea = [],
        container = null,
        headHtml = null,
        bodyHtml = null,
        year = null,
        month = null,
        prev = null,
        next = null,
        clickDay = null,
        today = null,
        me = this;

    //todo 可直接设置已选中的日期列表；
    //todo 节日。
    //todo 集成样式？
    let currentPageDate = config['date'] || new Date();
    let elem = config['el'];
    let head = config['lang'] === 'cn' ? head_cn : head_en;
    let cellEvent = config['cellClick'] || null;
    today = new Date();

    function deepCopy(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * 下月按钮
     * @param e
     */
    let nextMonth = function (e) {
        e.stopPropagation();
        e.preventDefault();
        setDate(currentPageDate.getFullYear(), currentPageDate.getMonth() + 1);
        setInput(currentPageDate.getFullYear(), currentPageDate.getMonth() + 1);
        renderData();
    };

    /**
     * 上月按钮
     * @param e
     */
    let prevMonth = function (e) {
        e.stopPropagation();
        e.preventDefault();
        setDate(currentPageDate.getFullYear(), currentPageDate.getMonth() - 1);
        setInput(currentPageDate.getFullYear(), currentPageDate.getMonth() + 1);
        renderData();
    };

    /**
     * 监听输入框改变
     * @param e
     */
    let changeInput = function (e) {
        e.stopPropagation();
        e.preventDefault();

        //todo 输入校验
        setDate(year.value, month.value - 1);
        renderData();
    };

    /**
     * 日期点击事件
     * @param e
     */
    let cellClick = function (e) {
        let date = e.target._date;
        //todo 可多选日期；
        clickDay = clickDay ? (dateCompare(date.date, clickDay) ? null : date.date) : date.date;
        if (date.date.getMonth() !== currentPageDate.getMonth()) {
            setDate(date.date.getFullYear(), date.date.getMonth());
        }
        renderData();
        cellEvent ? cellEvent(date, e.target, e) : '';
    };

    /**
     * 格式化日期
     * @param date
     * @returns {string}
     */
    let format = function (date) {
        let y = date.getFullYear();
        let m = date.getMonth() + 1;
        let d = date.getDate();

        m = m > 10 ? m.toString() : '0' + m.toString();
        d = d > 10 ? d.toString() : '0' + d.toString();
        return y + '-' + m + '-' + d;
    };

    /**
     * 日期比较
     * @param date1
     * @param date2
     * @returns {boolean}
     */
    let dateCompare = function (date1, date2) {
        let d1 = format(date1);
        let d2 = format(date2);

        return d1 === d2;
    };

    /**
     * 生成元素
     * @param tag
     * @param options
     * @param children
     */
    function createElem(tag, options, children) {
        let tagElem = document.createElement(tag);
        let attrs = options['attrs'] || {};
        let events = options['events'] || {};
        let styles = options['styles'] || {};

        for (let p in attrs) {
            if (attrs.hasOwnProperty(p)) {
                tagElem[p] = attrs[p]
            }
        }

        for (let e in events) {
            if (events.hasOwnProperty(e)) {
                tagElem.addEventListener(e, events[e], false);
            }
        }

        for (let s in styles) {
            if (styles.hasOwnProperty(s)) {
                tagElem.style[s] = styles[s];
            }
        }

        if (children) {
            switch (children.__proto__.constructor.name) {
                case 'String':
                    tagElem.appendChild(children);
                    break;
                case 'Array':
                    for (let i = 0; i < children.length; i++) {
                        tagElem.appendChild(children[i]);
                    }
                    break;
            }

        }
        return tagElem;
    }

    /**
     * 创建一行日期格子
     * @returns {HTMLElement}
     */
    function createOneRow() {
        let rowChildren = [];
        for (let j = 0; j < oneWeek; j++) {
            let cell = createElem('div', {attrs: {className: 'body_cell cur_month'}, events: {click: cellClick}});
            rowChildren.push(cell);
        }
        return createElem('div', {attrs: {className: 'c_body'}}, rowChildren);
    }

    /**
     * 创建日历body
     * @returns {Array}
     */
    function createRowBody() {
        let rowBodies = [];
        for (let i = 0; i < maxRow; i++) {
            rowBodies.push(createOneRow());
        }
        return rowBodies;
    }

    /**
     * 设置输入框
     * @param y
     * @param m
     */
    function setInput(y, m) {
        year.value = y;
        month.value = m;
    }

    /**
     * 设置日期
     * @param year
     * @param month
     */
    function setDate(year, month) {
        currentPageDate.setFullYear(year, month);
    }

    /**
     * 初始化日期数据
     * @returns {Array}
     */
    function initAr() {
        let cur = new Date(currentPageDate),
            ar = [],
            weekStart = 0,
            weekLen = 7,
            oneWeek = [],
            curDate = 1,
            curMonth = cur.getMonth(),
            curYear = cur.getFullYear(),
            initMonth = cur.getMonth(),
            lastRow = false;

        for (let w = weekStart; w < weekLen; w++) {
            oneWeek[w] = deepCopy(day);

            cur.setDate(curDate);

            if (cur.getFullYear() > curYear || cur.getMonth() > curMonth) {
                curDate = 1;
                cur.setFullYear(cur.getFullYear(), cur.getMonth(), curDate);
                curYear = cur.getFullYear();
                curMonth = cur.getMonth();
                lastRow = true;
            }
            let curDay = cur.getDay(),
                newDate = null,
                isCurMonth = true;

            if (curDay === w) {
                newDate = new Date(cur);
                if (initMonth !== curMonth) {
                    isCurMonth = false;
                }
                curDate++;
            } else {
                newDate = new Date(cur.getTime() - oneDayMilliseconds * (curDay - w));
                isCurMonth = false;
            }

            oneWeek[w].date = newDate;
            oneWeek[w].format = format(newDate);
            oneWeek[w].showDay = newDate.getDate();
            oneWeek[w].curMonth = isCurMonth;
            oneWeek[w].today = dateCompare(oneWeek[w].date, today);

            if (w === 0 && lastRow) {
                break;
            }

            if (w === weekLen - 1) {
                ar.push(oneWeek.slice());
            }
            if (!lastRow && w === weekLen - 1) {
                w = -1;
            }
        }
        return ar;
    }

    /**
     * 创建日历结构
     */
    function dom() {
        prev = createElem('div', {
            attrs: {className: 'prev-month', textContent: '<'},
            events: {click: prevMonth}
        });

        next = createElem('div', {
            attrs: {className: 'next-month', textContent: '>'},
            events: {click: nextMonth}
        });

        year = createElem('input', {
            attrs: {className: 'year', name: 'year'},
            events: {change: changeInput},
        });

        month = createElem('input', {
            attrs: {className: 'month', name: 'month'},
            events: {change: changeInput},
        });

        let input_container = createElem('div', {attrs: {className: 'input-container'}}, [year, month]);

        let operate = createElem('div', {attrs: {className: 'operate'}}, [
            prev,
            input_container,
            next,
        ]);

        let headChildren = [];
        for (let i = 0; i < oneWeek; i++) {
            let tmpHeadCell = createElem('div', {attrs: {className: 'head_cell', textContent: head[i]}});
            headChildren.push(tmpHeadCell);
        }
        headHtml = createElem('div', {attrs: {className: 'c_head'}}, headChildren);

        dataArea = createRowBody();

        bodyHtml = createElem('div', {
            attrs: {className: 'body'},
            styles: {display: 'table-row-group'}
        }, dataArea);

        container = createElem('div', {attrs: {className: 'calender-container'}}, [
            operate,
            headHtml,
            bodyHtml
        ]);

        document.querySelector(elem).appendChild(container);
    }

    function renderData() {
        let ar = initAr(),
            weeks = ar.length,
            domLength = dataArea.length,
            filter = {
                acceptNode: function (node) {
                    return node.className === 'c_body' ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
                }
            };

        setInput(currentPageDate.getFullYear(), currentPageDate.getMonth() + 1);

        if (weeks > domLength) {
            let rowBody = createOneRow();
            bodyHtml.appendChild(rowBody);
            dataArea.push(rowBody);
        } else if (weeks < domLength) {
            bodyHtml.removeChild(dataArea[domLength - 1]);
            dataArea.pop();
        }

        let len = dataArea.length;
        for (let i = 0; i < len; i++) {
            let it = document.createNodeIterator(dataArea[i], NodeFilter.SHOW_ELEMENT, filter, false);
            let j = 0;
            while (true) {
                let node = it.nextNode();
                if (!node) {
                    break;
                }

                ar[i][j].class.push(ar[i][j].curMonth ? 'cur_month' : 'other_month');

                if (ar[i][j].today) {
                    ar[i][j].class.push('active');
                }

                if (clickDay && dateCompare(ar[i][j].date, clickDay)) {
                    ar[i][j].class.push('click-active');
                }

                node._date = ar[i][j];
                node.textContent = ar[i][j].showDay;
                node.className = ar[i][j].class.join(' ');
                j++;
            }
        }
    }

    // 日历结构
    dom();

    // 渲染数据；
    renderData();

    // todo 异常处理

    // todo 日历生命周期事件接口暴露。 文档结构生成前，生成后，（渲染数据前，）数据渲染中，生成后，
}