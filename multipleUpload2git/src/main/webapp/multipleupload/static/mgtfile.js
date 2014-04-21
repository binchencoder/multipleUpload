/*
 * mgtfile
 */

/*
 * mgt file upload
 */
function mgtuid(){
	var result = '';
	for(var i = 0; i < 32; i++){
		result += Math.floor(Math.random() * 16).toString(16).toUpperCase();
	}
	return result;
};
function MgtFileuploadPageClass() {
	this.doms = [];	 
	this.getIframeName = function(){
		var n = "ifr" + mgtuid();
		var ifr = $("#" + n);		
		var io = $('<iframe name="' + n + '" id="' + n+ '" src="" />');
		io.css({ position: 'absolute', top: '-1000px', left: '-1000px' });
		io.appendTo('body');			
		
		return n; 
	};
	this.submit = function(){
		this.showResult();
		var on = null,next = null;
		$.each(this.doms, function(k,v){
			$.each(v,function(k1,v1){
				if(v1.ok == 1){
					on = v1;
				}
				if(v1.ok == 0 && !next){
					next = v1;
				}
			});		
		});
		if(!on && next){
			next.submit();
		}
	};
	this.setResult = function(idoo,ok,size){
		var on = null,g1 = null;
		$.each(this.doms, function(k,v){
			$.each(v,function(k1,v1){
				if(v1.idoo==idoo){
					on = v1;
				}
				if(v1.ok==1){
					g1=v1;//缺点：如何页面有2个文件上传，就可以错位了。
				}
			});		
		});
		if(idoo && idoo != null && idoo != ''){
			if(on){
				on.finish(size,ok);
				this.submit();
			}else if(g1){
				g1.finish(size,ok);
				this.submit();
			}
		}
	};
	this.showResult = function(){
		var r = "";
		$.each( this.doms, function(k,v){
			$.each(v,function(k1,v1){
				r += "idoo:" + v1.idoo;
				r += "ok:" + v1.ok +"<br/>";	
			});		
		});
		$("#log").html(r);
	};
	this.getFileName = function(o){
	    var pos = o.lastIndexOf("\\");
	    return o.substring(pos + 1);  
	};
	this.showSize = function(size){	
		var mb = 1024 * 1024;
		var kb = 1024;		
		var temp2;
		if( size >= mb ){			
			temp2 = (size / mb) + "";			
			if(temp2.indexOf(".") > 0){				
				temp2 = temp2.substring(0, (temp2.indexOf(".") + 3));
			}	
			return  temp2 + " MB";
		}else if( size >= kb ){			
			temp2 = (size / kb)+"";			
			if(temp2.indexOf(".")>0){
				temp2 = temp2.substring(0, (temp2.indexOf(".") + 3));
			}
			return  temp2 + " KB";
		}else{
			return size + " B";
		}
	};
};
var mgtFileuploadPage =  new MgtFileuploadPageClass();//

(function($) {
    $.fn.mgtfileupload = function(o) {
        var self = this;
        var options = {maxFile:300, num:2000, result:false, suffix:[], showname:'上传附件', msg:'请选择正确的图片格式',test:false};
        $.extend(options, o);
        
        //是否有即将或者正在上传的文件
        var hasOngoing = function(){
        	var arr = self.data("data");
        	var r = false;
        	$.each(arr,function(k,v){
        		if(v.ok == 0 || v.ok == 1 ){//some file wait to transfer
        			r = true;
        		}
        	});
        	return r;
        };
        
        if(options.ready){
        	if(hasOngoing()){
        		if(options.func){
    				self.data("func",options.func);// register callback
    			}
        		return false;
        	}
        	return true;        	
        }
        
        //取附件
        if(options.result){
        	var arr = self.data("data");
        	var result = [],file;
        	$.each(arr,function(key,item){
        		if(item.ok == 2 || item.id > 0 || options.test){
        			file = {};
        			file.id = item.id;
        			file.deleted = item.deleted;
        			file.localPath = item.idoo;
        			file.fileName = item.fileName;
        			if(options.test)
        				file.ok = item.ok;
        			result.push(file);
        		}
        	});
        	return result.reverse();
        }
        
        var maxNum = options.num, mgtData = [], limitsizename = [];
        
        mgtFileuploadPage.doms.push(mgtData);
        self.data("data",mgtData);
		self.empty();
		
		//是否已经有待选择文件的file选择框了
		var hasAttachButton = function(){
			var r = false;
			$.each(mgtData,function(k1,v1){
				if(v1.ok == -1){
					r = true;
				}
			});
			return r;
		};
		
		//是否有重名文件
		var hasDuplicateAttach = function(fullname){
			var r = false;
			$.each(mgtData,function(k1,v1){
				if((v1.fullname == fullname) && v1.ok != 4){
					for(var i = 0;i < limitsizename.length;i++){
						if((limitsizename[i] == fullname) || (fullname.lastIndexOf(limitsizename[i]) >= 0)){
							r = false; 
							return r;
						}
						else{
							r = true;
						}
					}
					
					if(limitsizename.length == 0){
						r = true;
				    }
				}
			});
			return r;
		};
		
		function createFile(){
			return {id : 0,//针对已经存在的附件
					deleted : false,
					idoo : mgtuid(),
					pb : null, //progress bar
					hasSize : false,
				    maxFile : options.maxFile * 1024 * 1024,//允许的文件最大大小
					ok : -1, //-1: no file seelcted,0:a file is selected,1:uploading, 2: success;3:error;4:deleted
					containerDiv : null,//最外层div
					form : null,
					fileName : null,
					fullname : '',
					showDiv : null,
					formDiv : null,
					submit : function(){
						this.ok = 1;
						this.showDiv.find("span[class=\"status\"]").text("");
						this.pb.show();						
						this.form.submit();
						this.pbFunc();
					},
					pbFunc : null,//callback when submit
					
					finish : function(size, ok){
						if(this.ok != 1 ){ // ajax has dealed
							return;
						}
						if(size == 0){//error occured
							this.ok = 3;
							//msg: 文件内容不能为空
							this.clear(i18n.fileNotEmpty);
						}else if(ok && this.setSize(size)){//上传完成
							this.ok = 2;
							this.clear();
						}else if(ok){
							this.ok = 3;
							this.clear("文件太大"); //msg: 文件太大
						}else{
							this.ok = 3;
							this.clear(i18n.fileUploadFail); // msg: 文件上传失败						
						}
						if(this.ok == 2){
							this.showDiv.find("span[class=\"attsize\"]").text( "("+mgtFileuploadPage.showSize(size)+")");//处理文件实际有大小展示进度条，但字节数显示0	
							if(!hasOngoing()){
								var f = self.data("func");// get callback
								if(f){
									f();
								}
							}
						}else{
							self.removeData("func");// remove callback
						}
					},
					setSize:function(size){//true:设置成功
						if(this.hasSize)
							return true;
							
						this.hasSize = true;						
						this.showDiv.find("span[class=\"attsize\"]").text("(" + mgtFileuploadPage.showSize(size) + ")");							

						if(size > this.maxFile){					
							mgtNotification( {message:"<i class='mpic-notify-error'></i>" + i18n.fileMaxSize + options.maxFile + "M",
				    			type: 'error',position:"top-center",closable:false});
							this.deleteme();
							limitsizename.push(this.fileName); 
							return;
						}
						return true;
					},
					clear : function(msg){						
						this.formDiv.remove();
						if(msg && msg.length > 0){							
							this.showDiv.find("span[class=\"status\"]").css({"color":"red"}).text(msg);
							this.showDiv.find("span[class=\"attsize\"]").text("");	//post请求先执行：文件内容为空，get请求请求头信息的字节大小B就无法清空
						}else{
							this.showDiv.find("span[class=\"status\"]").text("");
						}
						this.showDiv.find("div[class=\"bar\"]").parent().remove();		
					},
					deleteme : function(){
						this.deleted = true;
						log(" in deleteme func , this.ok:" +this.ok + ", options.attached: " +options.attached);
						this.ok = 4;
						if(options.attached){
							if(this.formDiv){
								log("in 009 " + this.formDiv.find("form").length   )
								var f = this.formDiv.find("form"); 
								f.attr("action", globalCp + "/mgtfileupload/status.do?X-Progress-ID=abort" );
								f.attr("method", "get" );								
								f.submit();
								this.formDiv.remove();
							}
							$(this.showDiv[0].parentNode).remove();
						}else{
							this.containerDiv.remove();
						}
						maxNum = maxNum + 1;
						createNew();
					}
				};
		}
		
		function createShowDiv(){
			var showDiv;
			if(!options.attached){
		    	showDiv = $("<div style=\"display:none\"></div>");
			    showDiv.html("<span class=\"name\"></span><span style=\"margin:0 0 0 10px;\" class=\"attsize\"></span><span style=\"margin:0 0 0 10px;\" class=\"status\">等待</span>" +
				"<i class=\"mpic-delete2 ch\"></i><div style=\"display:none;width:100px;height:16px;margin-top:2px;padding:0;\" class=\"progress\"><div class=\"bar\" style=\"width: 0%;\"></div></div>");
		    }else{
		    	showDiv = $(Editor.createAttachShowDiv(options.attached));
		    }
			return showDiv;
		}
		
		function showFileName(aFile){
			aFile.showDiv.show();
			aFile.showDiv.parent().show();
			
			aFile.formDiv && aFile.formDiv.hide();
			
			aFile.showDiv.find("i[class=\"mpic-delete2 ch\"]").bind("click",function(){
				log(" in aFile.deleteme " );
				var k = aFile.ok; 
				aFile.deleteme();
				if(k==1){
					mgtFileuploadPage.submit();
				}
			});
			
			var showfileLength = 18,s = aFile.showDiv.find("span[class=\"name\"]");
			
			if(aFile.fileName.length <= showfileLength){
				s.text(aFile.fileName);
			}else{
				s.text(aFile.fileName.substring(0,showfileLength - 3) + "...");
				s.attr("title",aFile.fileName);
			}
		}
		
		var createNew = function(){
			if (/(iPhone|iPad|iPod)/i.test(navigator.userAgent)) {  
			    return;  
			}; 
			//如果已经有了afile对象或者可以上传的数量为0，则返回
			if(hasAttachButton() || maxNum <= 0){
				return;
			}
			//可用数量-1
			maxNum = maxNum - 1;
			
			var aFile = createFile();
			mgtData.push(aFile);
	    
			var pb;
		    
			//展示附件区域
		    var showDiv = createShowDiv();
		    aFile.showDiv = showDiv;
			
			var furlpost = globalCp + "/mgtfileupload/post.do?idoo=" + aFile.idoo + "&X-Progress-ID=" + aFile.idoo;			
			var furlstatus = globalCp + "/mgtfileupload/status.do?X-Progress-ID=" + aFile.idoo;
			
			var uploadDiv = $("<div><form action=\"" + furlpost + "\" method=\"post\" style=\"margin:0;padding:0;\" enctype=\"multipart/form-data\" ></form></div>");
			var form = uploadDiv.find("form");
			
			if(!options.attached){
				var containerDiv = $("<li style=\"list-style:none;\"></li>");
				containerDiv.append(showDiv).append($("<div class=\"cb\"></div>")).append(uploadDiv);
				self.append(containerDiv);
				aFile.containerDiv = containerDiv;
			}else{
				self.append(uploadDiv);
			}
			aFile.formDiv = uploadDiv;
			aFile.form = form;
		
			var formInner = $('<div style="width: 70px; height: 20px; overflow:hidden;" class="upatt"></div>');
			formInner.append($('<i class="mpic-att"></i>'));
			
			var outerSpan = $('<span style="position:relative;display:inline-block;"></span>');
			var innerSpan = $('<span></span>');
			innerSpan.css({
				'position':'absolute', 
				'top':'0px', 
				'left':'0px', 
				'cursor':'pointer',
				'width':'50px', 
				'height':'15px', 
				'overflow':'hidden', 
				'opacity':'0', 
				'z-index':'1', 
				'background-color':'rgb(255, 255,255)'
			});
			
			var bottomAnchor = $('<a href="javascript:;" onclick="return false;" onmousedown="return false;" style="font-family:Verdana">' + options.showname + '</a>');
			var input = $('<input type="file" id="mgtfile" name="file" tabindex="-1"/>');
			var ua = navigator.userAgent.toLowerCase();
			var ie11 = ua.indexOf("trident") > 0;
			input.css({
				'width':'200px', 
				'height':'200px', 
				'font-family':'Times', 
				'position':'absolute', 
				'font-size':'50px', 
				'right': (ie11 || $.browser.msie || $.browser.webkit || ($.browser.mozilla && $.browser.version > 21.0))  ? '0px' : '426px', 
				'cursor':'pointer'
			});
			$(input).on("click", function(){
				$(".tooltip").hide();
			});
			
			if($.browser.msie){
				innerSpan.css({
					'filter': 'alpha(opacity=0)',
					'zoom' : '1'
				});
			}
			innerSpan.hover(function(){bottomAnchor.css({'text-decoration':'underline'});},function(){bottomAnchor.css({'text-decoration':'none'});});
			// 如果公司有存储容量才能上传
			if (options.maxFile > 0) {
				innerSpan.append(input);
			}
			outerSpan.append(innerSpan);
			outerSpan.append(bottomAnchor);
			formInner.append(outerSpan);
			form.append(formInner);
			
			var statusNum = 0;
			aFile.pbFunc = function(){
				statusNum = statusNum + 1;
				if(statusNum > 7200)
					return;
				
				$.ajax({dataType: "json",
					    url: furlstatus + '&t=' + statusNum,
					    global:false,
					    success: function(data) {
							if(aFile.ok != 1) return;
							if(data.state =="error") return;
							
							var again = false;
							log("data.received: "+ data.received +",data.size: "+data.size);
							if(data.received && data.received  > 0){
								
								var cent  = 0;
								if(data.size > 0)
									cent = 100 * data.received / data.size;
								pb.width(cent + "%");						
								if(aFile.setSize(data.size)){						
									if(cent < 100){
										again = true;
									}
								}else{
									aFile.ok = 3;
									aFile.clear("文件太长了");
								}
							}else{
								again = true;
							}
							log("again:"+again);
							if(again){
								 setTimeout(aFile.pbFunc,2000);
							}
						}
					});				
			};
			
			function emptyFile(form){ //alert("zhixing"); 
				//$('#mgtfile').replaceWith($('#mgtfile').clone(true));
				form[0].reset();
			}  

			var fileupload = function() {
				var me=$(this);
				if(me.data("hasactive"))
					return;
				me.data("hasactive","true");					
						
				var format = false,fright = false;
			    var fname = mgtFileuploadPage.getFileName($(this).val());
			    var f1 = fname.split(".");
			    var fsuffix = f1[f1.length - 1];
			    
			    if(options.suffix.length > 0){
				    $.each(options.suffix,function(k1,v1){
						if(fsuffix.toLowerCase() == v1.toLowerCase()){
							fright = true;
						}
					});	
				    if(!fright){
				    	mgtNotification( {message:"<i class='mpic-notify-error'></i>" + options.msg + "！",
			    			type: 'error',position:"top-center",closable:false});
				    	format = true;
				    }
			    }
			    form[0].target = mgtFileuploadPage.getIframeName();			    
			    if(f1[0].length > 216){
			    	mgtNotification( {message:"<i class='mpic-notify-error'></i>"+i18n.fileMaxLength, //文件名长度不能超过216字！
		    			type: 'error',position:"top-center",closable:false});
			    	aFile.deleteme();
					createNew();
		        }else if(hasDuplicateAttach($(this).val())){
		        	mgtNotification( {message:"<i class='mpic-notify-error'></i>"+i18n.fileExist,
		    			type: 'error',position:"top-center",closable:false});
			    	
					aFile.deleteme();
					createNew();
				}else{					
					aFile.ok = 0;
					aFile.fileName = mgtFileuploadPage.getFileName($(this).val());
					aFile.fullname = $(this).val();
	
					showFileName(aFile);
					
					pb = aFile.showDiv.find(".bar");
					pb.parent().toggle();				
					pb.width("1%");
					aFile.pb = pb;
					
					if(!format){
						log("00 1");
						mgtFileuploadPage.submit();
					}
					else{
						log("00 2");
						aFile.deleteme();
					}
					log("00 3");
					createNew();
			    }				
			}
			
			// 如果企业空间容量大于零，才可以上传文件
			if ($.browser.msie) { //IE浏览器
				log("in msie ");
				input.bind("input", fileupload);
				input.bind("change", fileupload);
				input.live("change", fileupload);
			} else { //ff浏览器
				log("in not msie ");
				input.bind("change",fileupload);
			}
		};
		
		//取出已经存在的附件
		var domId = options.attached;
		if(domId){
			var files = document['attachs_' + domId];
			if(files){
				for(var i = 0;i < files.length;i++){
					var aFile = createFile(),file = files[i];
					aFile.id = file.id;
					aFile.deleted = file.deleted;
					aFile.fileName = file.fileName;
					aFile.size = file.size;
					aFile.ok = 2;
					
					mgtData.push(aFile);
					aFile.showDiv = createShowDiv();
					showFileName(aFile);
					aFile.showDiv.find("span[class=\"status\"]").text("");
					aFile.showDiv.find("span[class=\"attsize\"]").text( "(" + mgtFileuploadPage.showSize(aFile.size) + ")");
					
					maxNum--;
				}
			}
		}
		createNew();
	};    
})(jQuery);
