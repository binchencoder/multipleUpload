var debugLevel = 0;
var realDebug ={
	dump:function(){}
};
function log(text, level){
	if(debugLevel==0){
		var href = window.location.href;		
		if(/debug/.test(href)){
			debugLevel =1;
			$.loadScript(globalCp+"/static/debug/jquery.debug.js", 'js');
			realDebug = new $.debug({
				continuous : true,
				posTo : { x:'right', y:'bottom' },
				width: '375px',
				height: '150px',
				background: '#600',
				color: '#ffc',
				labelColor: '#996'
				});
		}else{
			debugLevel =-1;
		}
	}
	realDebug.dump(text);		
};