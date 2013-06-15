// JavaScript Document
var cal = new Object();

cal.init = function(){//do only one
	cal.calDate = cal.reDate(new Date(),"month");
	cal.selDayDate = cal.reDate(new Date(),"day");
	cal.weeks = 0;
	cal.dayDetail=0;
	cal.setCalTable();
	cal.touchEventX = 0;
	cal.touchEventY = 0;
	cal.touchEvent = Object();
	cal.doSelDay("calDateId_"+cal.reTime(cal.selDayDate.getTime()));
	
	//按鈕變色動畫，與點擊事件
	$("#lastMonth").bind( "touchstart", function(){
		cal.setCalTable(cal.calDate.getFullYear(),cal.calDate.getMonth());
		$("#calDayDetail").hide();
	});
	$("#nextMonth").bind( "touchstart", function(){
		cal.setCalTable(cal.calDate.getFullYear(),cal.calDate.getMonth()+2);
		$("#calDayDetail").hide();
	});
	$("#newRecord").bind( "touchstart",function(){
		rc.editor.saveRecordId = 0;
		rc.editor.initPage();
		$("#deleteRecord").hide();
		//
		rc.editor.type = "record";
		$(".unTF").show();
		$(".TF").hide();
		
		//setTimeout("test();",2000);
	});
	
	
}
function test(){
	var t = document.getElementById("recordMoney");
	
	var r ="";
	for(k in t){
		r+=k+" : "+t[k]+"\n";
	}
	alert(r);
}
cal.setCalTable=function(year,month){
	if(year != undefined)cal.calDate.setFullYear(year);
	if(month != undefined)cal.calDate.setMonth(month-1);
	$("#calTable").html(cal.html.calTable(cal.calDate.getFullYear(),cal.calDate.getMonth()+1));
	$("#showYear").html(cal.calDate.getFullYear());
	$("#showMonth").html(cal.calDate.getMonth()+1);
	//$("#lastMonth").html(new Date(cal.calDate.getFullYear(),cal.calDate.getMonth(),1).getMonth()+"月");
	//$("#nextMonth").html(new Date(cal.calDate.getFullYear(),cal.calDate.getMonth()+2,1).getMonth()+"月");
	
	//月曆禮拜數不同，高度不同
	var calTdHeight = ($("body").height()-$(".toolbar").outerHeight()-$("#calTable tr:eq(0) td").outerHeight())/cal.weeks;
	$("#calTable tr:gt(0) td").height(calTdHeight);
	
	console.log("A");
	
	//設定月曆日期內容
	cal.setCalDay();
	
	//設定點擊月曆的天
	$(".calDay").bind("tap",function(){
		if($(this).css("background-color")=="rgb(238, 238, 238)"){
			//已經選取，在點一下則跳出詳細框
			//設定詳細記帳框
			var thisLeft = parseInt($(this).offset().left);
			var thisTop = parseInt($(this).offset().top);
			var thisHeight = parseInt($(this).height());
			var tableHeight = thisHeight*cal.weeks;
			if(thisLeft>150){
				$("#calDayDetail").css("left",thisLeft-125);
			}else{
				$("#calDayDetail").css("left",thisLeft+50);
			}
			var detailHeight = parseInt($("#calDayDetail").height());
			
			var height = (thisTop-50)-(thisTop-50)/(tableHeight+30)*detailHeight+50;
			$("#calDayDetail").css("top",height);
			//alert(height);
			
			if(cal.dayDetail==1){
				$("#calDayDetail").hide();
				cal.dayDetail=0;
			}else{
				$("#calDayDetail").show();
				cal.dayDetail=1;
			}
		}else{
			//尚未選取
			cal.doSelDay(this.id);
			$("#calDayDetail").hide();
			cal.dayDetail=0;
		}
		
		
	});
}
cal.doSelDay=function(id){
	//設定參數
	var tmp = id.split("_");
	cal.selDayDate.setTime(tmp[1]*1000);
	cal.selDayDate.setHours(0,0,0,0);
	//設定背景顏色
	$(".calDay").css("background","");
	$("#"+id).css("background","#eee");
	
	//設定動作
	//讀取day詳細資料
	
	var tmpDate = new Date(cal.selDayDate.getTime());
	var minT = cal.reTime(tmpDate.getTime());
	tmpDate.setDate((cal.selDayDate.getDate()+1));
	var maxT = cal.reTime(tmpDate.getTime());
	tmpDate.setDate(cal.selDayDate.getDate());
	$("#calDayDetail").html("");
	db.query("SELECT record.*"
	+", (SELECT name FROM item WHERE id = record.itemId) name"
	+", (SELECT name FROM account WHERE id = record.accountId) account"
	+", (SELECT name FROM currency WHERE id = record.currencyId) currency"
	+", (SELECT value FROM currency WHERE id = record.currencyId) currencyValue"
	+" FROM record "
	+" WHERE record.ownerId='"+mb.id+"' AND record.date >= "+minT+" AND record.date < "+maxT
	+" ORDER BY date ASC",function(r){
		
		var totalMoney =0;
		var html = "";
		html+="<div id='detail_title' class='detail'>"+tmpDate.getFullYear()+"年"+(tmpDate.getMonth()+1)+"月"+tmpDate.getDate()+"日"+"</div>";
		for(var i=0;i<r.rows.length;i++){
			
			tmpDate.setTime(parseInt(r.rows.item(i).date)*1000);
			
			if(r.rows.item(i).name==null) var name = "未分類";
			else var name = r.rows.item(i).name;
			//if($("#calDateId_"+cal.reTime(tmpDate.getTime())).children().length >= 30)continue;
			if(r.rows.item(i).pn ==0)	totalMoney += r.rows.item(i).money*r.rows.item(i).currencyValue;
			else	totalMoney -= r.rows.item(i).money*r.rows.item(i).currencyValue;
			
			html +="<div id='calDayDetailRecordId_"+r.rows.item(i).id+"' class='calDayDetailRecord'>";
			
			html +="<div id='detail_time' class='detail'>"+tmpDate.getHours()+"點"+tmpDate.getMinutes()+"分"+"</div>";
			html +="<div id='detail_account' class='detail'>"+r.rows.item(i).account+"</div>";
			
			html +="<div id='detail_item' class='detail'>"+name+"</div>";
			if(r.rows.item(i).pn ==0)	var pn="P";
			else	var pn="N";
			html +="<div id='detail_money' class='detail "+pn+"'>"+r.rows.item(i).money+"</div>";
			html +="<div id='detail_currency' class='detail'>"+r.rows.item(i).currency+"</div>";
			html +="</div>";
			html +="<hr>";
			
		}
		html +="<div id='detail_totalF' class='detail'>總結：</div>";
		if(totalMoney >0)	var pn="P";
		else	var pn="N";
		html +="<div id='detail_totalM' class='detail "+pn+"'>"+f.reMoney(totalMoney/localStorage.currencyValue);
		html+="</div>";
		html +="<div id='detail_currency' class='detail'>"+localStorage.currencyName+"</div>";
		$("#calDayDetail").html(html);
		
		//設定點擊編輯動作
		$(".calDayDetailRecord").bind("touchstart",function(){
			$(this).css("background-color","#ccc");
		}).bind("touchend",function(){
			$(this).css("background-color","");
		}).bind("tap",function(){
			$("#deleteRecord").show();
			$("#newRecord").tap();
			
			var tmp = $(this).attr("id").split("_");
			db.autoSql("record","id = '"+tmp[1]+"'");
			
			rc.editor.saveRecord = new Object();
			db.sel(function(r){
				
				if(r.rows.length ==0)return 0;
				//設定暫存
				rc.editor.saveRecord = r.rows.item(0);
				//設定編輯選單
				cal.selDayDate.setTime(r.rows.item(0).date*1000);
				rc.editor.saveRecordId = r.rows.item(0).id;
				rc.editor.initPage(true);
				
				$("#recordMoney").val(r.rows.item(0).money);
				
				$("#recordCurrency option").attr("selected",false);
				$("#recordCurrency option[value="+r.rows.item(0).currencyId+"]").attr("selected",true);
				$("#recordAccount option").attr("selected",false);
				$("#recordAccount option[value="+r.rows.item(0).accountId+"]").attr("selected",true);
				
				$("#recordNote").val(r.rows.item(0).note);
				
				rc.editor.itemSelTouchDo(r.rows.item(0).itemId);
				
				var pn =0;
				if($("#moneyPN").html()=="支")pn=1;
				if(r.rows.item(0).pn != pn)	$("#moneyPN").tap()
				
			});
			
		});
		
	});
	
}
cal.setCalDay=function(){
	
	var tmpDate = new Date(cal.calDate.getTime());
	
	var minT = cal.reTime(tmpDate.getTime());
	tmpDate.setMonth((cal.calDate.getMonth()+1),1);
	var maxT = cal.reTime(tmpDate.getTime());
	tmpDate.setMonth(cal.calDate.getMonth(),1);
	
	$(".calDayRecord").remove();
	db.query("SELECT record.*,  (SELECT name FROM item WHERE id = record.itemId) name "
	+" FROM record "
	+" WHERE record.ownerId='"+mb.id+"' AND record.date >= "+minT+" AND record.date < "+maxT
	+" ORDER BY date ASC",function(r){
		for(var i=0;i<r.rows.length;i++){
			
			tmpDate.setTime(parseInt(r.rows.item(i).date)*1000);
			tmpDate.setHours(0,0,0,0);
			
			if(r.rows.item(i).name==null) var name = "未分類";
			else var name = r.rows.item(i).name;
			if($("#calDateId_"+cal.reTime(tmpDate.getTime())).children().length*12 >= $("#calDateId_"+cal.reTime(tmpDate.getTime())).height()-12 ){
				continue;
			}
			$("#calDateId_"+cal.reTime(tmpDate.getTime())).append(
				"<div id='calDayRecordId_"+r.rows.item(i).id+"' class='calDayRecord'>"+name+"</div>"
			);
		}
	});
	
}
cal.html = new Object();
cal.html.calTable = function(year,month){
	var tDate = new Date(year,month-1,1);
	var html = "";
	html+="<table><tr><td>星期日</td><td>星期一</td><td>星期二</td><td>星期三</td><td>星期四</td><td>星期五</td><td>星期六</td></tr>";
	cal.weeks = 0;
	for(var i=0,calFirst = 1-tDate.getDay() ; i < 42  ; i++, calFirst++){
		
		tDate.setFullYear(year,month-1,calFirst);
		if(i%7==0)html+="<tr>";
		html+="<td class='calDay' id='calDateId_"+cal.reTime(tDate.getTime())+"'>";
		if(tDate.getMonth()+1 == month){
			if(tDate.getDay()==0){
				html+="<div class='calSundayInfo'>"+tDate.getDate()+"</div>";
			}else if(tDate.getDay()==6){
				html+="<div class='calSaturdayInfo'>"+tDate.getDate()+"</div>";
			}else{
				html+="<div class='calDayInfo'>"+tDate.getDate()+"</div>";
			}
		}else{
			html+="<div class='calOutDayInfo'>"+tDate.getDate()+"</div>";
		}
		html+="</td>";
		if(i%7==6){
			cal.weeks++;
			html+="</tr>";
			if(tDate.getMonth() == month){
				break;
			}
			
		}
	}
	html+="</table>";
	return html;
}
cal.reTime=function(time){
	return Math.floor(time/1000);
}
cal.reDate=function(date,type){
	if(type=="month"){
		return new Date(date.getFullYear(),date.getMonth(),1);
	}else if(type=="day"){
		return new Date(date.getFullYear(),date.getMonth(),date.getDate());
	}else if(type=="hour"){
		return new Date(date.getFullYear(),date.getMonth(),date.getDate(),date.getHours(),0,0);
	}else if(type=="minute"){
		return new Date(date.getFullYear(),date.getMonth(),date.getDate(),date.getHours(),date.getMinutes(),0);
	}else{//second
		return new Date(date.getFullYear(),date.getMonth(),date.getDate(),date.getHours(),date.getMinutes(),date.getSeconds());
	}
}



