
工作日志：
方案1：
个性化：  64px,22px  1002px  16column
font-size: 12px;

20px 18px gridColumnWidth768


方案2：
个性化：  51px,18px  1002px  20column
font-size: 12px;

30px 10px gridColumnWidth768


#方案3：
个性化：  48px,8px  952px  20column
font-size: 12px;

30px 10px gridColumnWidth768


#方案4：
个性化：  40px,8px  952px  20column
font-size: 12px;

28px 10px gridColumnWidth768
50px 10px gridColumnWidth1200

font-family: "Lucida Grande",Verdana,Lucida,Arial,Helvetica,sans-serif;


---------------------------------------
.pagination-centered {
  text-align: center;
  color: #999999;   增加
}...

.modal {
  position: fixed;
  top: 0;  --》 修改
  left: 0; --》 修改
  z-index: 1050;
  width: 560px;
  margin: 0; --》 修改
  background-color: #ffffff;
  border: 1px solid #999;
  border: 1px solid rgba(0, 0, 0, 0.3);
  *border: 1px solid #999;
  
  background-image: url("img/glyphicons-halflings-white.png");   位置调整
  
  .modal-backdrop,
.modal-backdrop.fade.in {
  opacity: 0.1;
  filter: alpha(opacity=10);
}
========================================================================
bootstrap.js的修改：

修改一：

  $.fn.modal = function (option) {
    var t = this.each(function () {
      var $this = $(this)
        , data = $this.data('modal')
        , options = $.extend({}, $.fn.modal.defaults, $this.data(), typeof option == 'object' && option)
      if (!data) $this.data('modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option]()
      else if (options.show) data.show()
    });
    
    var me =$(this);
    var h1 = me.height(),h2= $(window).height();
    var w1 = me.width(),w2= $(window).width();
    
    var top0=0,left0=0;    
    if(h2>h1+102)  top0=(h2-h1-102)/2;
    if(h2<=550)  top0=-20;
    if(w2>w1)  left0=(w2-w1)/2;
    me.css({"top":top0,"left":left0,"margin-left":0,"margin-top":0});
    return t;
  }
  
  
-------------------------------------------------          
修改二：  popover:

  , setContent: function () {
      var $tip = this.tip()
        , title = this.getTitle()
        , content = this.getContent()

      $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
      $tip.find('.popover-content > *')[this.options.html ? 'html' : 'text'](content)

      $tip.removeClass('fade top bottom left right in')
    }
 修改为：
   , setContent: function () {
      var $tip = this.tip()
        , title = this.getTitle()
        , content = this.getContent()

      if(this.options.noTitle){
    	  $tip.find('.popover-title').remove();
      }else{
    	  $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title);
      }
      if (this.options.hasClose) {
    	  $tip.find('div.popover-header').append("<a class='popClose' href='javascript:void(0)'>×</a>");
    	  $tip.find('div.popover-header').find("a.popClose").css({color:'#000000'}).click(function(){
    		  $tip.remove();
    	  });
    	  $tip.find('div.popover-header').removeClass("hide");
      } else {
    	  $tip.find('div.popover-header').remove();
      }
      
      $tip.find('.popover-content > *')[this.options.html ? 'html' : 'text'](content);
      
      $tip.removeClass('fade top bottom left right in');
      if(this.options.css){
    	  $tip.addClass(this.options.css);  
      }
    }
 
   -------------------------------------------------
  修改四： template 修改了。
            $.fn.popover.defaults = $.extend({} , $.fn.tooltip.defaults, {
    placement: 'right'
  , trigger: 'click'
  , content: ''
  , template: '<div class="popover"><div class="arrow"></div><div class="popover-inner"><div class="popover-header hide">'+
	  '</div><h3 class="popover-title"></h3><div class="popover-content"><p></p></div></div></div>'
  })
 
 修改五： 为解决modal嵌套 ， 暂时注释掉 modal show 中 enforceFocus 方法。 并修改 modal和modal-backdrop的z-index 值
 	show: function () {
        var that = this
          , e = $.Event('show')

        this.$element.trigger(e)

        if (this.isShown || e.isDefaultPrevented()) return

        this.isShown = true

        this.escape()

        this.backdrop(function () {
          var transition = $.support.transition && that.$element.hasClass('fade')

          if (!that.$element.parent().length) {
            that.$element.appendTo(document.body) //don't move modals dom position
          }

          that.$element.show()

          if (transition) {
            that.$element[0].offsetWidth // force reflow
          }

          that.$element
            .addClass('in')
            .attr('aria-hidden', false)

            // 为解决嵌套弹出modal窗口问题，先将这个方法注释掉
//          that.enforceFocus()

          transition ?
            that.$element.one($.support.transition.end, function () { that.$element.focus().trigger('shown') }) :
            that.$element.focus().trigger('shown')

        })
      }  
      
    backdrop: function (callback) {
        var that = this
          , animate = this.$element.hasClass('fade') ? 'fade' : ''

        if (this.isShown && this.options.backdrop) {
          var doAnimate = $.support.transition && animate

          this.$backdrop = $('<div style="z-index:'+(beginIndex+1)+'" class="modal-backdrop ' + animate + '" />')
            .appendTo(document.body)

          this.$backdrop.click(
            this.options.backdrop == 'static' ?
              $.proxy(this.$element[0].focus, this.$element[0])
            : $.proxy(this.hide, this)
          )

          if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

          this.$backdrop.addClass('in')

          if (!callback) return

          doAnimate ?
            this.$backdrop.one($.support.transition.end, callback) :
            callback()

        } else if (!this.isShown && this.$backdrop) {
          this.$backdrop.removeClass('in')

          $.support.transition && this.$element.hasClass('fade')?
            this.$backdrop.one($.support.transition.end, callback) :
            callback()

        } else if (callback) {
          callback()
        }
      }        
          
   var old = $.fn.modal,
  	   beginIndex = 1040;

   $.fn.modal = function (option) {
	    var t = this.each(function () {
	      var $this = $(this)
	        , data = $this.data('modal')
	        , options = $.extend({}, $.fn.modal.defaults, $this.data(), typeof option == 'object' && option)
	      if (!data) $this.data('modal', (data = new Modal(this, options)))
	      if (typeof option == 'string') data[option]()
	      else if (options.show) data.show()
	    });
	    
	    var me =$(this);
	    var h1 = me.height(),h2= $(window).height();
	    var w1 = me.width(),w2= $(window).width();
	    
	    var top0=0,left0=0;    
	    if(h2>h1+102)  top0=(h2-h1-102)/2;
	    if(h1 > h2){ top0 = h2 - h1};
	    if(w2>w1)  left0=(w2-w1)/2;
	    me.css({"top":top0,"left":left0,"margin-left":0,"margin-top":0,"z-index":beginIndex+2});
	    
	    if (/(iPhone|iPad|iPod)/i.test(navigator.userAgent)) {  
			me[0].scrollIntoView();  
		};
	    
		beginIndex += 10;
	    return t;
	  }
	  
修改6：使bootstrap modal 可以进行拖动  在bootstrap.js 中将modal函数修改为
  $.fn.modal = function (option) {
    var t = this.each(function () {
      var $this = $(this)
        , data = $this.data('modal')
        , options = $.extend({}, $.fn.modal.defaults, $this.data(), typeof option == 'object' && option)
      if (!data) $this.data('modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option]()
      else if (options.show) data.show()
    });
    
    var me =$(this);
    var h1 = me.height(),h2= $(window).height();
    var w1 = me.width(),w2= $(window).width();
    
    var top0=0,left0=0;    
    if(h2>h1+102)  top0=(h2-h1-102)/2;
    if(h1 > h2){ top0 = h2 - h1};
    if(w2>w1)  left0=(w2-w1)/2;
    me.css({"top":top0,"left":left0,"margin-left":0,"margin-top":0,"z-index":beginIndex+2});
    
    if (/(iPhone|iPad|iPod)/i.test(navigator.userAgent)) {  
		me[0].scrollIntoView();  
	};
    
	beginIndex += 10;
	me.draggable({ handle: '.modal-header' });
    return t;
  }	  
-------------------------------------------------


关于 bootstrap-confirm 的使用 可以参考  http://iamlze.cn/demo/bootstrap-confirm/test.html

