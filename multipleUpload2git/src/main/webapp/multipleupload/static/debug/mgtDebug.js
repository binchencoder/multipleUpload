// =============================================DivWindow start===============================================
var isIE = (document.all) ? true : false;
var Extend = function (destination, source) {
    for (var property in source) {
        destination[property] = source[property];
    }
};

var Bind = function (object, fun, args) {
    return function () {
        return fun.apply(object, args || []);
    };
};

var BindAsEventListener = function (object, fun) {
    var args = Array.prototype.slice.call(arguments).slice(2);
    return function (event) {
        return fun.apply(object, [event || window.event].concat(args));
    };
};

var CurrentStyle = function (element) {
    return element.currentStyle || document.defaultView.getComputedStyle(element, null);
};

function create(elm, parent, fn) { // 创建元素
    var element = document.createElement(elm);
    fn && fn(element);
    parent && parent.appendChild(element);
    return element;
};

function remove(elm, fn){ //从文档中移除元素
	if (elm)
		top.document.body.removeChild(elm);
};

function addListener(element, e, fn) { // 为元素增加监听事件
	if (element)
		element.addEventListener ? element.addEventListener(e, fn, false) : element.attachEvent("on" + e, fn);
};

function removeListener(element, e, fn) { // 移除元素监听事件
	if (element)
		element.removeEventListener ? element.removeEventListener(e, fn, false) : element.detachEvent("on" + e, fn);
};

var Class = function (properties) {
    var _class = function () {
        return (arguments[0] !== null && this.initialize && typeof (this.initialize) == 'function') ? this.initialize.apply(this, arguments) : this;
    };
    _class.prototype = properties;
    return _class;
};
var DivWindow = new Class({
    options: {
        width: 400, height: 400,
        left: 100, top: 100,
        minWidth: 200, minHeight: 200,
        closeIco: true,
        resizeIco: false,
        titleInfo: "调试输出",
        content: "无内容",
        zIndex: 2
    },
    initialize: function (options) {
        this.dragObj = null;
        this.resize = null;
        this.close = null;
        this.body = null;
        this.x = 0, this.y = 0;
        this.funM = BindAsEventListener(this, this.Move);
        this.funS = Bind(this, this.Stop);
        this.isDrag = true;
        this.css = null;
        Extend(this.options, options);
        Extend(this, this.options);
        DivWindow.zIndex = this.zIndex;
        //////////////////////////////////////////////////////////////////////////////// 构造DivWindow
        var obj = ['windowContainter', 'windowTitle', 'windowTitleInfo', 'windowClose', 'windowToolBar', 'windowBody', 'windowBottom', 'clear', 'windowMin', 'windowMax', 'windowMini', 'windowExpand'];
        for (var i = 0; i < obj.length; i++) {
            obj[i] = create('div', null, function (elm) {
                elm.className = obj[i];
                elm.id = obj[i];
            });
        }
        obj[1].innerHTML = this.titleInfo;
        obj[3].innerHTML = "X";
        obj[5].innerHTML = this.content;
        //obj[6].innerHTML = "resize";
        obj[7].innerHTML = "<span style='color:red;'>清除<span>";
        obj[8].innerHTML = "▣";
        obj[9].innerHTML = "〇";
        obj[10].innerHTML = "—";
        obj[11].innerHTML = "口";
        
        obj[1].appendChild(obj[2]);
        obj[1].appendChild(obj[3]);
        obj[1].appendChild(obj[8]); // 最小化
        obj[1].appendChild(obj[9]); // 最大化
        obj[1].appendChild(obj[10]);  // 迷你窗口
        obj[1].appendChild(obj[11]);  // 展开窗口
        
        obj[4].appendChild(obj[7]);
        
        obj[0].appendChild(obj[1]);
        obj[0].appendChild(obj[4]);
        obj[0].appendChild(obj[5]);
        //obj[0].appendChild(obj[6]);
        
        top.document.body.appendChild(obj[0]);
        
        this.container = obj[0];
        this.body = obj[5];
        this.toolBar = obj[4];
        this.title = obj[1];
        this.dragObj = obj[0];
        this.resize = obj[6];
        this.close = obj[3];
        this.clear = obj[7];
        this.min = obj[8];
        this.max = obj[9];
        this.mini = obj[10];
        this.expand = obj[11];
        ////////////////////////////////////////////////////////////////////////////////o,x1,x2 
        ////设置Dialog的长 宽 ,left ,top 
        this.InitShow(this.top, this.left, this.height-75);
        this.titleHeight = this.title.offsetHeight, this.toolBarHeight = this.toolBar.offsetHeight;
        /////////////////////////////////////////////////////////////////////////////// 添加事件 
        addListener(this.dragObj, 'mousedown', BindAsEventListener(this, this.Start, this.isDrag));
        addListener(this.close, 'mouseover', Bind(this, this.Changebg, [this.close, '0px 0px', '-21px 0px']));
        addListener(this.close, 'mouseout', Bind(this, this.Changebg, [this.close, '0px 0px', '-21px 0px']));
        addListener(this.close, 'mousedown', BindAsEventListener(this, this.Disappear));
        addListener(this.body, 'mousedown', BindAsEventListener(this, this.Cancelbubble));
        addListener(this.resize, 'mousedown', BindAsEventListener(this, this.Start, false));
        addListener(this.clear, 'click', BindAsEventListener(this, this.Clear, false));
        addListener(this.min, 'mousedown', BindAsEventListener(this, this.Min, false));
        addListener(this.max, 'mousedown', BindAsEventListener(this, this.Max, false));
        addListener(this.mini, 'mousedown', BindAsEventListener(this, this.Mini, false));
        addListener(this.expand, 'mousedown', BindAsEventListener(this, this.Expand, false));
    },
    InitShow: function(_top, _left, _bodyHeight){
    	with(this.container.style) {
            height = this.height + "px";
            top = _top + "px";
            width = this.width + "px";
            left = _left + "px";
            zIndex = this.zIndex;
        }
        this.body.style.height = _bodyHeight + 'px';
    },
    Disappear: function (e) {
    	this.Cancelbubble(e);
        remove(this.dragObj);
    },
    Cancelbubble: function (e) {
        this.dragObj.style.zIndex = DivWindow.zIndex;
        top.document.all ? (e.cancelBubble = true) : (e.stopPropagation());
    },
    Changebg: function (o, x1, x2) {
        o.style.backgroundPosition = (o.style.backgroundPosition == x1) ? x2 : x1;
    },
    Start: function (e, isdrag) {
        if (!isdrag) {
            this.Cancelbubble(e);
        }
        this.css = isdrag ? {x: "left", y: "top"} : {x: "width", y: "height"};
        this.dragObj.style.zIndex = DivWindow.zIndex;
        this.x = isdrag ? (e.clientX - this.dragObj.offsetLeft || 0) : (this.dragObj.offsetLeft || 0);
        this.y = isdrag ? (e.clientY - this.dragObj.offsetTop || 0) : (this.dragObj.offsetTop || 0);
        if (isIE) {
            addListener(this.dragObj, "losecapture", this.funS);
            this.dragObj.setCapture();
        } else {
            e.preventDefault();
            addListener(top, "blur", this.funS);
        }
        addListener(top.document, 'mousemove', this.funM);
        addListener(top.document, 'mouseup', this.funS);
    },
    Move: function (e) {
    	top.getSelection ? window.getSelection().removeAllRanges() : top.document.selection.empty();
        var ix = e.clientX - this.x,
            iy = e.clientY - this.y;
        this.dragObj.style[this.css.x] = (this.isDrag ? Math.max(ix, 0) : Math.max(ix, this.minWidth)) + 'px';
        this.dragObj.style[this.css.y] = (this.isDrag ? Math.max(iy, 0) : Math.max(iy, this.minHeight)) + 'px';
        //if (!this.isDrag) this.body.style.height = Math.max(iy - this.titleHeight, this.minHeight - this.titleHeight) - 2 * parseInt(CurrentStyle(this.body).paddingLeft) + 'px';
    },
    Stop: function () {
        removeListener(top.document, 'mousemove', this.funM);
        removeListener(top.document, 'mouseup', this.funS);
        if (isIE) {
            removeListener(this.dragObj, "losecapture", this.funS);
            this.dragObj.releaseCapture();
        } else {
            removeListener(top, "blur", this.funS);
        };
    },
    Clear: function () {
    	this.body.innerHTML = "";
    },
    Min: function(){
    	this.InitShow(this.top, this.left, this.height-75);
    	
    	this.min.style.display="none";
    	this.max.style.display="block";
    },
    Max: function(){
    	this.InitShow(20, 20, this.height-(this.titleHeight+this.toolBarHeight)-20);
    	this.container.style.height = this.height + "px";
    	this.container.style.width = (top.innerWidth - 50) + "px";
    	
    	this.min.style.display="block";
    	this.max.style.display="none";
    },
    Mini: function () {
    	this.InitShow(this.top+this.body.offsetHeight, this.left, this.height-75);
    	this.container.style.height="55px";
    	
    	this.body.style.display="none";
    	
    	this.mini.style.display="none";
    	this.expand.style.display="block";
    },
    Expand: function () {
    	this.InitShow(this.top, this.left, this.height-(this.titleHeight+this.toolBarHeight)-20);
    	
    	this.body.style.display="block";
    	
    	this.expand.style.display="none";
    	this.mini.style.display="block";
    }
});
//=============================================DivWindow end===============================================
/** 
 * This is a very simple logger that sends all log messages to a specified
 */
var MgtDebugger = function () {
    this.LEVEL_DEBUG = 1;
    this.LEVEL_INFO = 2;
    this.LEVEL_ERROR = 3;
    
    this.LEVEL_DEBUG_COLOR = "64c864";
    this.LEVEL_INFO_COLOR = "000000";
    this.LEVEL_ERROR_COLOR = "E10601";
    
    this.logLevel = 3;
    this.debugDiv = null;
    
    this.setLevel = function (inLevel) {
    	if (inLevel == undefined || inLevel == null) return; 
        if (inLevel < 0) {
            this.logLevel = this.LEVEL_TRACE;
        } else if (inLevel > this.LEVEL_FATAL) {
            this.logLevel = this.LEVEL_FATAL;
        } else {
        	this.logLevel = inLevel;
        }
    }; 
    this.setDebugDiv = function (inDebugDiv) {
        if (inDebugDiv !== undefined &&
        		inDebugDiv !== null) {
            this.debugDiv = inDebugDiv;
            this.debugDiv.innerHTML = "";
        }
    };
    this.shouldBeLogged = function (inLevel) {
        if (inLevel >= this.logLevel)
            return true;
        return false;
    };
    this.debug = function (inMessage) {
        if (this.shouldBeLogged(this.LEVEL_DEBUG) && this.debugDiv) {
            this.debugDiv.innerHTML += "<div style='color:#" + this.LEVEL_DEBUG_COLOR + ";'>" + "[DEBUG] " + inMessage + "</div></br>";
        }
    };
    this.info = function (inMessage) {
        if (this.shouldBeLogged(this.LEVEL_INFO) && this.debugDiv) {
            this.debugDiv.innerHTML += "<div style='color:#" + this.LEVEL_INFO_COLOR + ";'>" + "[INFO] " + inMessage + "</div></br>";
        }
    };
    this.error = function (inMessage) {
        if (this.shouldBeLogged(this.LEVEL_ERROR) && this.debugDiv) {
            this.debugDiv.innerHTML += "<div style='color:#" + this.LEVEL_ERROR_COLOR + ";'>" + "[ERROR] " + inMessage + "</div></br>";
        }
    };
    var debugWidth = 400, debugHeight=400;
	this.debugWindow = new DivWindow({
         titleInfo: "mgt调试输出窗口",
         width: debugWidth, height: debugHeight,
         left: top.innerWidth-debugWidth-20,
         top: top.innerHeight-debugHeight-20,
         content: '输出内容',
         zIndex: 1,
         isDrag: true
     });
};