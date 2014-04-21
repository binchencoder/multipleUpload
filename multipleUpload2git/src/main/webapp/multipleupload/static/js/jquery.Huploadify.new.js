/*
Huploadify
version : 2.1.1
*/
function genfid(){
	var result = '';
	for(var i = 0; i < 32; i++){
		result += Math.floor(Math.random() * 16).toString(16).toUpperCase();
	}
	return result;
};

(function ($) {
    $.fn.Huploadify = function (opts) {
        var itemTemp = '<div id="${fileID}" class="uploadify-queue-item">' +
        					'<div class="uploadify-progress"><div class="uploadify-progress-bar"></div></div>' +
        					'<span class="up_filename">${fileName}</span>' + 
        					'<span class="uploadbtn">上传</span><span class="delfilebtn">删除</span>' +
        				'</div>';
        var defaults = {
            fileTypeExts: '*.*', //允许上传的文件类型，格式'*.jpg;*.doc'
            uploader: '', //文件提交的地址
            auto: false, //是否开启自动上传
            method: 'post', //发送请求的方式，get或post
            multi: false, //是否允许选择多个文件
            formData: {}, //发送给服务端的参数，格式：{key1:value1,key2:value2}
            fileObjName: 'file', //在后端接受文件的参数名称，如PHP中的$_FILES['file']
            fileSizeLimit: 2048, //允许上传的文件大小，单位KB
            showUploadedPercent: true, //是否实时显示上传的百分比，如20%
            showUploadedSize: false, //是否实时显示已上传的文件大小，如1M/2M
            showAverageSpeed: false, //是否实时显示当前上传文件的速度
            buttonText: '选择文件', //上传按钮上的文字
            removeTimeout: 1000, //上传完成后进度条的消失时间
            itemTemplate: itemTemp, //上传队列显示的模板
            breakPoints: false, //是否开启断点续传
            fileSplitSize: 1024 * 1024, //断点续传的文件块大小，单位Byte，默认1M
            getUploadedSize: null, //类型：function，自定义获取已上传文件的大小函数，用于开启断点续传模式，可传入一个参数file，即当前上传的文件对象，需返回number类型
            saveUploadedSize: null, //类型：function，自定义保存已上传文件的大小函数，用于开启断点续传模式，可传入两个参数：file：当前上传的文件对象，value：已上传文件的大小，单位Byte
            saveInfoLocal: false, //用于开启断点续传模式，是否使用localStorage存储已上传文件大小
            onUploadStart: null, //上传开始时的动作
            onUploadSuccess: null, //上传成功的动作
            onUploadComplete: null, //上传完成的动作
            onUploadError: null, //上传失败的动作
            onInit: null, //初始化时的动作
            onCancel: null, //删除掉某个文件后的回调函数，可传入参数file
            onSelect: null //选择文件后执行的动作，可传入参数files，文件列表
        };

        var option = $.extend(defaults, opts);
        
        //将文件的单位由bytes转换为KB或MB，若第二个参数指定为true，则永远转换为KB
        var formatFileSize = function (size, byKB) {
            if (size > 1024 * 1024 && !byKB) {
                size = (Math.round(size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
            } else {
                size = (Math.round(size * 100 / 1024) / 100).toString() + 'KB';
            }
            return size;
        };
        
        //将输入的文件类型字符串转化为数组,原格式为*.jpg;*.png
        var getFileTypes = function (str) {
            var result = [];
            var arr1 = str.split(";");
            for (var i = 0, len = arr1.length; i < len; i++) {
                result.push(arr1[i].split(".").pop());
            }
            return result;
        };

        var mimetypeMap = {
            zip: ['application/x-zip-compressed'],
            jpg: ['image/jpeg'],
            png: ['image/png'],
            gif: ['image/gif'],
            doc: ['application/msword'],
            xls: ['application/msexcel'],
            docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
            ppt: ['application/vnd.ms-powerpoint '],
            pptx: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
            mp3: ['audio/mp3'],
            mp4: ['video/mp4'],
            pdf: ['application/pdf']
        };

        //根据后缀名获得文件的mime类型
        var getMimetype = function (name) {
            return mimetypeMap[name];
        };

        //根据配置的字符串，获得上传组件accept的值
        var getAcceptString = function (str) {
            var types = getFileTypes(str);
            var result = [];
            for (var i = 0, len = types.length; i < len; i++) {
                var mime = getMimetype(types[i]);
                if (mime) {
                    result.push(mime);
                }
            }
            return result.join(',');
        };

        //发送文件块函数
        var sendBlob = function (url, xhr, file, formdata) {
            xhr.open(option.method, url, true);
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            var fd = new FormData();
            fd.append(option.fileObjName, file);
            if (formdata) {
                for (key in formdata) {
                    fd.append(key, formdata[key]);
                }
            }
            xhr.send(fd);
        };
        
        // 封装文件上传所有的业务逻辑
        var fileObj = null;

        this.each(function () {
            var _this = $(this);
            
            //先添加上file按钮和上传列表
            var inputDiv = $('<div class="fileUpload btn btn-primary"></div>');
            	inputDiv.append('<span>' + option.buttonText + '</span>');
            
            var instanceNumber = $('.uploadify').length + 1;
            var inputStr = '<input id="select_btn_' + instanceNumber + '" class="selectbtn" type="file" name="fileselect[]"';
	            inputStr += option.multi ? ' multiple' : '';
	            inputStr += ' accept="';
	            inputStr += getAcceptString(option.fileTypeExts);
	            inputStr += '"/>';
            var uploadFileListStr = '<div id="file_upload_' + instanceNumber + '-queue" class="uploadify-queue"></div>';
            
            inputDiv.append(inputStr);
            _this.append(inputDiv);
            
            //_this.append(uploadFileListStr); //附件内容在选择按钮下面
            $(uploadFileListStr).insertBefore(inputDiv); //附件内容在选择按钮上面

            //创建文件对象
            fileObj = {
                uploadAllowed: true,
                fileInput: _this.find('.selectbtn'), //html file控件
                uploadFileList: _this.find('.uploadify-queue'),
                container: _this, //上传控件的外层div引用
                url: option.uploader, //ajax地址
                fileFilter: [], //过滤后的文件数组
                fileNames: [], // 上传的所有文件的名称数组
                uploadedSuccessFiles: [], // 已经上传成功的文件列表
                
                uploadOver: true, //一次上传是否真正结束，用于断点续传的情况
                
                queueData: {
        			averageSpeed  : 0, // The average speed of the uploads in KB
        			queueSize     : 0, // The size in bytes of the entire queue
        			uploadSize    : 0, // The size in bytes of the upload queue
        			uploadQueue   : [], // The files currently to be uploaded
            		uploadingFile : null // The file currently to be uploading
                },
                
                filter: function (files) { //选择文件组的过滤方法
                    var arr = [];
                    var typeArray = getFileTypes(option.fileTypeExts);
                    if (typeArray.length > 0) {
                        for (var i = 0, len = files.length; i < len; i++) {
                            var thisFile = files[i];
                            
                            // 判断是否包含相同名称文件
                            if ($.inArray(thisFile.name, this.fileNames) >= 0) {
                            	alert("包含相同名称的文件！");
                            	continue;
                            }
                            if (parseInt(formatFileSize(thisFile.size, true)) > option.fileSizeLimit) {
                                alert('文件' + thisFile.name + '大小超出限制！');
                                continue;
                            }
                            if ($.inArray(thisFile.name.split('.').pop().toLowerCase(), typeArray) >= 0 || $.inArray('*', typeArray) >= 0) {
                                arr.push(thisFile);
                            } else {
                                alert('文件' + thisFile.name + '类型不允许！');
                            }
                        }
                    }
                    return arr;
                },
                
                createFileDOM: function(file){
                	//处理模板中使用的变量
                    var $html = $(option.itemTemplate.replace(/\${fileID}/g, 'fileupload_' + instanceNumber + '_' + file.index)
                    		.replace(/\${fileName}/g, file.name)
                    		.replace(/\${fileSize}/g, formatFileSize(file.size))
                    		.replace(/\${instanceID}/g, _this.attr('id')));
                    
                    //如果是自动上传，去掉上传按钮
                    if (option.auto) {
                        $html.find('.uploadbtn').hide();
                    }
                    
                    // 已经上传的附件
                    if (file.id > 0) {
                    	$html.find('.uploadify-progress').remove();
                    }
                    
                    // 为上传按钮绑定处理事件
                    $html.find('.uploadbtn').on('click', (function (file) {
                        return function () {
                        	$(this).hide();
                            fileObj.funUploadFile(file);
                        };
                    })(file));
                    
                    //为删除文件按钮绑定删除文件事件
                    $html.find('.delfilebtn').on('click', (function (file) {
                        return function () {
                            fileObj.funDeleteFile(file);
                        };
                    })(file));
                    
                    this.uploadFileList.append($html);
                    
                    return $html;
                },
                
                //文件选择后
                funSelect: function (files) {
                    for (var i = 0, len = files.length; i < len; i++) {
                        var file = files[i];

                        var fileDOM = this.createFileDOM(file);
                        // 已经上传过的附件
                        if (file.id <= 0) {
                        	//如果开启断点续传，先初始化原来上传的文件大小
                            var initFileSize = '0KB',
                                initUppercent = '0%';

                            //判断是否显示已上传文件大小
                            if (option.showUploadedSize) {
                                var num = '<span class="progressnum"><span class="uploadedsize">' + initFileSize 
                                		+ '</span>/<span class="totalsize">${fileSize}</span></span>'.replace(/\${fileSize}/g, formatFileSize(file.size));
                                fileDOM.find('.uploadify-progress').after(num);
                            }

                            //判断是否显示上传百分比	
                            if (option.showUploadedPercent) {
                                var percentText = '<span class="up_percent">' + initUppercent + '</span>';
                                fileDOM.find('.uploadify-progress').after(percentText);
                            }
                            
                            // Add the file item to the queue
                            fileObj.queueData.queueSize += file.size;
                            fileObj.queueData.uploadQueue.push(file);
                        } 
                        
            			// Call the user-defined event handler
                        option.onSelect && option.onSelect(files);
                    };
                    
                    //判断是否是自动上传
                    if (option.auto) {
                    	if (fileObj.queueData.uploadingFile) { // 有正在上传的文件，续传该文件
                    		if (fileObj.uploadOver){
                    			fileObj.funUploadFile(fileObj.queueData.uploadingFile);
                    		}
                    	} else {
                    		if (fileObj.queueData.uploadQueue.length > 0) {
                    			fileObj.funUploadFile(fileObj.queueData.uploadQueue.shift());
                    		}
                    	}
                    }
                },
                
                onProgress: function (file, fileBytesLoaded) {
                    var eleProgress = _this.find('#fileupload_' + instanceNumber + '_' + file.index + ' .uploadify-progress');
                    
                    var uploadedSize = fileObj.funGetUploadedSize(file);

                    var percent = (uploadedSize / file.size * 100).toFixed(2);
                	var percentText = percent > 100 ? '99.99%' : percent + '%'; //校正四舍五入的计算误差
                    if (option.showUploadedSize) {
                        eleProgress.nextAll('.progressnum').find('.uploadedsize').text(formatFileSize(uploadedSize));
                        eleProgress.nextAll('.progressnum').find('.totalsize').text(formatFileSize(file.size));
                        
                        eleProgress.nextAll('.up_percent').text(percentText);
                    }
                    
                    eleProgress.children('.uploadify-progress-bar').css('width', percentText);
                    
                    // show upload averageSpeed
                    if (option.showAverageSpeed) {
                    	// Setup all the variables
            			var timer      = new Date(),
    	        			newTime    = timer.getTime(),
    	        			lapsedTime = newTime - fileObj.timer;
            			if (lapsedTime > 500) {
            				fileObj.timer = newTime;
            			}
            			
            			// Calculate the average speed
            			var suffix = 'KB/s';
            			var mbs = 0;
            			var kbs = (fileBytesLoaded / 1024) / (lapsedTime / 1000);
            			    kbs = Math.floor(kbs * 10) / 10;
            			if (fileObj.queueData.averageSpeed > 0) {
            				fileObj.queueData.averageSpeed = Math.floor((fileObj.queueData.averageSpeed + kbs) / 2);
            			} else {
            				fileObj.queueData.averageSpeed = Math.floor(kbs);
            			}
            			if (kbs > 1000) {
            				mbs = (kbs * .001);
            				fileObj.queueData.averageSpeed = Math.floor(mbs);
            				suffix = 'MB/s';
            			}
            			
            			if (lapsedTime > 500) {
            				var averageSpeedStr = fileObj.queueData.averageSpeed + suffix;
                			console.log(averageSpeedStr);
            			}
                    }
                }, //文件上传进度

                /* 开发参数和内置方法分界线 */

                //获取已上传的文件片大小，当开启断点续传模式
                funGetUploadedSize: function (file) {
                    if (option.getUploadedSize) {
                        return option.getUploadedSize(file);
                    } else {
                        if (option.saveInfoLocal) {
                            return parseInt(sessionStorage.getItem(file.fid)) || 0;
                        }
                    }
                },

                funSaveUploadedSize: function (file, value) {
                    if (option.saveUploadedSize) {
                        option.saveUploadedSize(file, value);
                    } else {
                        if (option.saveInfoLocal) {
                            sessionStorage.setItem(file.fid, value);
                        }
                    }
                },

                //获取选择文件，file控件
                funGetFiles: function (e) {
                    // 获取文件列表对象
                    var files = e.target.files;
                    //继续添加文件
                    files = this.filter(files);
                    
                    if (files.length > 0) {
                    	for (var i = 0, len = files.length; i < len; i++) {
                        	var file = files[i];
                        	file.fid = genfid(); // 生成fid
                        	// 针对已经上传的附件
                        	file.id = 0;
                        	file.deleted = false; 
                        	
                            this.fileFilter.push(file);
                            this.fileNames.push(files[i].name);
                        }
                        this.funDealFiles(files);
                    }
                    return this;
                },

                //选中文件的处理与回调
                funDealFiles: function (files) {
                    var fileCount = _this.find('.uploadify-queue .uploadify-queue-item').length; //队列中已经有的文件个数
                    
                    for (var i = 0, len = files.length; i < len; i++) {
                    	var file = files[i];
                    	file.index = ++fileCount;
                    	file.domId = 'fileupload_' + instanceNumber + '_' + files[i].index;
                        
                    	// 已上传的文件
                        if (option.attached && file.id > 0) {
                        	fileObj.uploadedSuccessFiles.push(file);
                        }
                    }
                    //执行选择回调
                    this.funSelect(files);

                    return this;
                },

                //删除对应的文件
                funDeleteFile: function (file) {
                	var fileInstance = _this.find('#fileupload_' + instanceNumber + '_' + file.index);
                	if (fileInstance) {
                		fileInstance.fadeOut();
                		option.onCancel && option.onCancel(file);
                	}
                	
                	var delfile = {};
                    for (var i = 0, len = this.fileFilter.length; i < len; i++) {
                    	delfile = this.fileFilter[i];
                        if (delfile.index == file.index) {
                        	this.fileFilter.splice(i, 1); this.fileNames.splice(i, 1); // 从文件数组中删除
                            fileObj.fileInput.val('');
                            
                            sessionStorage.getItem(delfile.fid) && sessionStorage.removeItem(delfile.fid);
                            break;
                        }
                    }
                    
                    // 判断删除的文件是不是正在上传
                    if (fileObj.queueData.uploadingFile && 
                    		fileObj.queueData.uploadingFile.fid == delfile.fid) {
                    	fileObj.queueData.uploadingFile = null;
                    	console.error("delete uploadingFile");
                    	if (option.breakPoints) {
                            this.uploadAllowed = false;
                            return this;
                        }
                    }
                    
                    // 同时判断删除的文件是不是上传队列中的文件
                    for (var j = 0, len = fileObj.queueData.uploadQueue.length; j < len; j++) {
                    	console.error("delete uploadQueueFile");
                        if (fileObj.queueData.uploadQueue[j].fid == delfile.fid) {
                        	fileObj.queueData.uploadQueue.splice(j, 1);
                        	return this;
                        }
                    }
                    
                    // 判断删除的文件是否已经上传成功
                    for (var n = 0, len = fileObj.uploadedSuccessFiles.length; n < len; n++) {
                    	console.error("delete uploadedSuccessFiles");
                    	var succFile = fileObj.uploadedSuccessFiles[n];
                    	if ('fid' in succFile && succFile.fid === delfile.fid) {
                    		fileObj.uploadedSuccessFiles.splice(n, 1);
                    		return this;
                    	}
                    	if ('id' in succFile && succFile.id === file.id) {
                    		succFile.deleted = true;
                    		return this;
                    	}
                    }
                    
                    return this;
                },
                
                // Triggered right before a file is uploaded
                funUploadStart: function(file){
                	if (option.showAverageSpeed) {
                		var timer = new Date();
                    	fileObj.timer = timer.getTime();
                	}
                	
                	$.extend(option.formData, {fileId: file.fid, fileSize: file.size});
                	
                	// 队列中正在上传的文件
                	fileObj.queueData.uploadingFile = file;
                	
                	option.onUploadStart && option.onUploadStart(file);
                },
                
                // Triggered when a file upload returns a successful code	
                funUploadSuccess: function(file, response){
                	try {
                		var data = JSON.parse(response);
                		if (data.localPath) {
            				var uploadedFile = {
            					id: file.id,
            					deleted: file.deleted,
        						localPath: data.localPath,
        						server: data.server,
        						size: file.size,
        						name: file.name,
        						fid: file.fid
            				};
            				fileObj.uploadedSuccessFiles.push(uploadedFile);
            			}
					} catch (e) {
						throw "uploadSuccess pase responseText error!";
					}
        			
        			// 上传完成， 去掉"上传" 和 "删除" 按钮
        			var fileContainer = fileObj.container.find("#" + file.domId);
        			if (fileContainer) {
        				fileContainer.find(".uploadbtn").remove();
        				fileContainer.find(".uploadify-progress").remove();
        			}
        			
        			// Call the user-defined event handler
                	option.onUploadSuccess && option.onUploadSuccess(file, response);
                	
                	/**
                	 * 清除队列中正在上传的文件
                	 * 上一个上传成功之后，如果文件队列中还有文件，则继续上传
                	 */
                	fileObj.queueData.uploadingFile = null;
                	if (fileObj.queueData.uploadQueue.length > 0) {
                		fileObj.funUploadFile(fileObj.queueData.uploadQueue.shift());
                	}
                },
                
                funUploadComplete: function(file, response){
                	var postedSize = 0;
                	if (response != "") {
                		try {
                			postedSize = parseInt(JSON.parse(response).postSize);
                		} catch (e) {
                			throw "uploadComplete pase responseText error!";
                		}
                	}
        			if (postedSize < file.size) {
        				fileObj.container.find("#" + file.domId).find(".uploadbtn").show().text("续传");	
        			}
        			
        			// Call the user-defined event handler
                	option.onUploadComplete && option.onUploadComplete(file, response);
                },
                
                /**
                 * 真正上传的业务方法
                 * @param file
                 */
                funUploadFile: function (file) {
                	fileObj.uploadOver = false;
                	var xhr = false;
                	var originalFile = file; //保存原始为切割的文件
                	
                    var thisfile = _this.find('#fileupload_' + instanceNumber + '_' + file.index);
                    var regulateView = function () {
                        if (fileObj.uploadOver) {
                        	thisfile.find('.uploadify-progress-bar').css('width', '100%');
                            option.showUploadedSize && thisfile.find('.uploadedsize').text(thisfile.find('.totalsize').text());
                            option.showUploadedPercent && thisfile.find('.up_percent').text('100%');
                        }
                    }; //校正进度条和上传比例的误差
                    
                    try {
                        xhr = new XMLHttpRequest(); //尝试创建 XMLHttpRequest 对象，除 IE 外的浏览器都支持这个方法。
                    } catch (e) {
                        xhr = ActiveXobject("Msxml12.XMLHTTP"); //使用较新版本的 IE 创建 IE 兼容的对象（Msxml2.XMLHTTP）。
                    }

                    if (option.breakPoints) {
                        var fileName = file.name,
                            fileId = file.domId,
                            fileIndex = file.index; //先保存原来的文件名称
                        var uploadedSize = this.funGetUploadedSize(originalFile);
                        //对文件进行切割，并保留原来的信息			  	
                        file = originalFile.slice(uploadedSize, uploadedSize + option.fileSplitSize);
                        file.name = fileName;
                        file.domId = fileId;
                        file.index = fileIndex;
                    }
                    
                    if (xhr.upload) {
                        // 上传中，XmlHttpReqeust 注册progress事件解决firefox问题
                    	xhr.addEventListener("progress", function (e) {
                       		fileObj.onProgress(originalFile, e.loaded);
                        }, false);
                    	
                        xhr.upload.addEventListener("progress", function (e) {
                        	if (e.lengthComputable) {
                        		fileObj.onProgress(originalFile, e.loaded);
                        	}
                        }, false);

                        // 文件上传成功或是失败
                        xhr.onreadystatechange = function (e) {
                            if (xhr.readyState == 4) {
                                fileObj.uploadOver = true;
                                
                                if (xhr.status == 200) {
                                    var returnData = xhr.responseText ? JSON.parse(xhr.responseText) : {};
                                    //将文件块数据更新到本地记录
                                    if (option.breakPoints) {
                                        //更新已上传文件大小，保存到本地
                                    	var uploadedSize = fileObj.funGetUploadedSize(originalFile);
                                    	
                                    	uploadedSize += option.fileSplitSize;
                                        fileObj.funSaveUploadedSize(originalFile, uploadedSize);
                                        
                                        //继续上传其他片段
                                        if (uploadedSize < originalFile.size) {
                                            fileObj.uploadOver = false;
                                            if (fileObj.uploadAllowed) {
                                                file = originalFile.slice(uploadedSize, uploadedSize + option.fileSplitSize);
                                                file.name = originalFile.name;
                                                file.domId = originalFile.domId;
                                                file.index = originalFile.index;
                                                file.size = originalFile.size;
                                                sendBlob(fileObj.url, xhr, file, option.formData);
                                            } else {
                                            	if (fileObj.queueData.uploadQueue.length > 0) {
                                            		fileObj.funUploadFile(fileObj.queueData.uploadQueue.shift());
                                            	}
                                            }
                                        } else {
                                            regulateView();
                                        }
                                    } else {
                                        regulateView();
                                    }

                                    if (fileObj.uploadOver) {
                                    	fileObj.funUploadSuccess(originalFile, xhr.responseText);
                                    	
                                        //在指定的间隔时间后删掉进度条
                                        /*setTimeout(function () {
                                            _this.find('#fileupload_' + instanceNumber + '_' + originalFile.index).fadeOut();
                                        }, option.removeTimeout);*/
                                    }
                                } else {
                                    fileObj.uploadOver && option.onUploadError && option.onUploadError(originalFile, xhr.responseText);
                                }
                                
                                if (fileObj.uploadOver) {
                                	fileObj.funUploadComplete(originalFile, xhr.responseText);
                                    //清除文件选择框中的已有值
                                    fileObj.fileInput.val('');
                                };
                            }
                        };

                        fileObj.funUploadStart(originalFile);
                        // 开始上传
                        //option.formData['file_name'] = originalFile.name;
                        //option.formData['last_time'] = originalFile.lastModifiedDate.getTime();

                        option.formData.fileName = originalFile.name;
                        option.formData.lastModifiedDate = originalFile.lastModifiedDate.getTime();
                        fileObj.uploadAllowed = true; //重置允许上传为true
                        sendBlob(this.url, xhr, file, option.formData);
                    }
                },
                
                // 获取上传成功的文件集合
                getSuccessFiles: function(){
                	var result = [], file;
                	
                	var succFiles = fileObj.uploadedSuccessFiles, succFile;
                	for (var i = 0; i < succFiles.length; i++) {
                		succFile = succFiles[i]; 
                		
                		file = {};
                		file.id = 'id' in succFile ? succFile.id : 0;
                		file.deleted = succFile.deleted;
                		file.size = succFile.size;
                		file.fileName = succFile.name;
                		file.localPath = 'localPath' in succFile ? succFile.localPath : '';
                		file.extra = 'server' in succFile ? succFile.server : '';
                		
                		result.push(file);
                	}
                	return result;
                },

                init: function () {
                    //文件选择控件选择
                    if (this.fileInput.length > 0) {
                        this.fileInput.change(function (e) {
                            fileObj.funGetFiles(e);
                        });
                    }

                    //点击上传按钮时触发file的click事件
                    _this.find('.uploadify-button').on('click', function () {
                        _this.find('.selectbtn').trigger('click');
                    });
                    
                    // 初始化已经上传的附件列表
                    if (option.hasOwnProperty("attached")) {
                    	var attachedFiles = option.attachedFiles;
                        if (attachedFiles && attachedFiles.length > 0) {
                        	this.funDealFiles(attachedFiles);
                        }
                    }
                    option.onInit && option.onInit();
                }
            };
            
            //初始化文件对象
            fileObj.init();
        });
        
        return fileObj;
    };

})(jQuery);