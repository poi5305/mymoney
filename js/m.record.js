// JavaScript Document
var rc = new Object();

rc.editor = new Object();
rc.editor.selItemId = 0;
rc.editor.saveRecordId = 0;//0 > new, other > edit
rc.editor.saveRecord = new Object();
rc.editor.type = "record";

rc.editor.init=function(){//一次
	rc.editor.createItemSelPage(rc.editor.itemSelEvent);
	rc.editor.setItemQSel();
	$("#recordYear, #recordMonth").change(function(){
		$("#recordDay").html(rc.html.dayOption($("#recordDay").val(),$("#recordYear").val(),$("#recordMonth").val()));
		//cal.selDayDate.setFullYear($("#recordYear").val());
		//cal.selDayDate.setMonth($("#recordMonth").val());
		//cal.selDayDate.setDate($("#recordDay").val());
	});
	$("#recordYear, #recordMonth, #recordDay").change(function(){
		$("#editor h1").html($("#recordYear").val()+"/"+$("#recordMonth").val()+"/"+$("#recordDay").val());
	});
	rc.editor.accountOption();
	rc.editor.currencyOption();
	
	
	$("#moneyPN").bind("tap",function(){
		if($(this).html()=="支")$(this).html("收").css("color","#6FF");
		else $(this).html("支").css("color","#F36");
	});
	
	$("#newItemButton").bind("tap",function(){
		var name = $("#newItem").val();
		if(name != ""){
			rc.newItem(name,rc.editor.selItemId,function(id){
				setTimeout("rc.editor.createItemSelPage(rc.editor.itemSelEvent,"+id+")",160);
				setTimeout("rc.editor.setItemQSel()",180);
			});
			$("#newItem").val("");
		}
	});
	$("#recordSelItem").bind("tap",function(){
		if(rc.editor.selItemId == 0){
			$("#itemSelBack_0").removeClass("slideright").tap().addClass("slideright");
		}else{
			var tmpId = rc.editor.getItemParentId(rc.editor.selItemId);
			if(tmpId==0){
				$("#itemSelBack_0").removeClass("slideright").tap().addClass("slideright");
			}else{
				$("#itemSel_"+tmpId).tap();
			}
		}
	});
	$("#saveRecord").bind("tap",function(){
		if(rc.editor.type=="record"){
			if(rc.editRecord(rc.editor.saveRecordId)){
				$("#recordBackHome").tap();
			}
		}else{
			//transfer
			
		}
	});
	$("#deleteRecord").bind("tap",function(){
		if(rc.editor.type=="record"){
			rc.deleteRecord(rc.editor.saveRecordId);
		}else{
			//transfer
			
		}
		$("#recordBackHome").tap();
	});
	$("#saveItem").click(function(){
		if(rc.editItem($("#itemId").val())){
			$("#backItemSel").tap();
		}
	});
	$("#deleteItem").click(function(){
		if(rc.editor.selItemId == $("#itemId").val())rc.editor.itemSelTouchDo(rc.editor.getItemParentId($("#itemId").val()));
		rc.deleteItem($("#itemId").val());
		//$("#backItemSel").tap();
		setTimeout('rc.editor.createItemSelPage(rc.editor.itemSelEvent)',200);
		setTimeout('rc.editor.setItemQSel()',200);
	});
}
rc.editor.initPage=function(isSetTime){
	$("#editor h1").html(cal.selDayDate.getFullYear()+"/"+(1+cal.selDayDate.getMonth())+"/"+cal.selDayDate.getDate());
	rc.editor.setSelectDate(cal.selDayDate.getFullYear(),cal.selDayDate.getMonth()+1,cal.selDayDate.getDate());
	if(isSetTime)	rc.editor.setSelectTime(cal.selDayDate.getHours(),cal.selDayDate.getMinutes());
	else	rc.editor.setSelectTime();
	$("#recordMoney").val("");
	$("#newItem").val("");
	$("#recordNote").val("");
}
rc.editor.setItemQSel=function(){
	//read data and set data
	var setItemQSelOption=function(r){
		var t = 0;
		for(var i=0;i<9;i++){
			t = Math.floor(i/3);
			if(i < r.rows.length)
			$("#itemQSelLine_"+t).append(" <div class='recordQSelItem'><a id='itemQSel_"+r.rows.item(i).id+"' class='itemSel' href='#itemSelPage_"+r.rows.item(i).id+"' >"+r.rows.item(i).name+"</a></div> ");
			else
			$("#itemQSelLine_"+t).append(" <div class='recordQSelItem'><a href='#'> &nbsp;</a></div> ");
		}
	}
	$("#itemQSelLine_0, #itemQSelLine_1, #itemQSelLine_2").html("");
	db.autoSql("item","ownerId='"+mb.id+"'"," ORDER BY useTimes DESC LIMIT 9");
	db.sel(function(r){
		setItemQSelOption(r);
		db.autoSql("item","ownerId='"+mb.id+"'"," ORDER BY passTimes DESC LIMIT 9");
		db.sel(function(r){
			setItemQSelOption(r);
			db.autoSql("item","ownerId='"+mb.id+"'"," ORDER BY sort DESC LIMIT 9");
			db.sel(function(r){
				setItemQSelOption(r);
				rc.editor.itemSelEvent();
				rc.editor.itemQSelSortEvent();
			});
		});
	});	
}
rc.editor.itemQSelSortEvent=function(){
	$(".sortEvent").click(function(){
		var tmp = $(this).attr("id");
		if(tmp == "orderByPassTimes"){
			var left = -295;
		}else if(tmp == "orderBySort"){
			var left = -595;
		}else{
			var left = 0;
		}
		$(".itemQSel:gt(0)").animate({
			"left":left
		},100);
	});
}
rc.editor.createItemSelPage=function(afterEvent,afterEventId){
	db.autoSql("item","ownerId='"+mb.id+"'","ORDER BY pid,useTimes, passTimes DESC");
	db.sel(function(r){
		var tmpD = new Object();
		//if(r.rows.length == 0){alert("第一次記帳，請先新增分類");};
		for(var i=0;i<r.rows.length;i++){
			if(tmpD[r.rows.item(i).pid] == undefined){
				tmpD[r.rows.item(i).pid] = new Object();
				tmpD[r.rows.item(i).pid].html = "";
				tmpD[r.rows.item(i).pid].pid = 0;
				tmpD[r.rows.item(i).pid].name ="目錄";
			}
			if(tmpD[r.rows.item(i).id] != undefined){
				tmpD[r.rows.item(i).id].pid = r.rows.item(i).pid;
				tmpD[r.rows.item(i).pid].name = r.rows.item(i).name;
			}
tmpD[r.rows.item(i).pid].html += "<li><a id='itemSel_"+r.rows.item(i).id+"' href='#itemSelPage_"+r.rows.item(i).id+"' class='itemSel'>"+r.rows.item(i).name+"</a><a href='#editItem' id='editItem_"+r.rows.item(i).id+"' class='editItem more'></a></li>";
		}
		var html = "";
		for(key in tmpD){
			html = "";
			if($("#itemSelPage_"+key).attr("id")==undefined){
				html+="<div id='itemSelPage_"+key+"' class='itemSelPage'>";
				html+="<div class='toolbar'><h1>"+tmpD[key].name+"</h1><a href='#editor' class='button slideright'>完成</a></div>";
				html+="<ul class='rounded'>";
				if(key == tmpD[key].pid)
					html+="<li><a id='itemSelBack_"+tmpD[key].pid+"' href='#itemSelPage_"+tmpD[key].pid+"' class='itemSel slideright'>目錄</a></li>";
				else
					html+="<li><a id='itemSelBack_"+tmpD[key].pid+"' href='#itemSelPage_"+tmpD[key].pid+"' class='itemSel slideright'>回上頁</a></li>";
				html+=tmpD[key].html;
				html+="</ul>";
				html+="</div>";
				$("body").append(html);
			}else{
				if(key == tmpD[key].pid)
					html+="<li><a id='itemSelBack_"+tmpD[key].pid+"' href='#itemSelPage_"+tmpD[key].pid+"' class='itemSel slideright'>目錄</a></li>";
				else
					html+="<li><a id='itemSelBack_"+tmpD[key].pid+"' href='#itemSelPage_"+tmpD[key].pid+"' class='itemSel slideright'>回上頁</a></li>";
				html+=tmpD[key].html;
				$("#itemSelPage_"+key+" ul").html(html);
				
			}
				
		}
		if(afterEvent != undefined)afterEvent(afterEventId);
	});
}
rc.editor.itemSelEvent = function(id){
	$(".itemSel").bind("tap",function(){
		var tmpThis = $(this).attr("id").split("_");
		rc.editor.itemSelTouchDo(tmpThis[1]);
	});
	if(id!= undefined)rc.editor.itemSelTouchDo(id);
	//設定編輯item頁面
	$(".editItem").bind("tap",function(){
		var tmpThis = $(this).attr("id").split("_");
		db.autoSql("item","ownerId ='"+mb.id+"' AND id='"+tmpThis[1]+"'");
		db.sel(function(r){
			if(r.rows.length>0){
				$("#itemId").val(r.rows.item(0).id);
				$("#itemName").val(r.rows.item(0).name);
				$("#itemSort").val(r.rows.item(0).sort);
			}else{
				alert("error!! 沒有此分類");
			}
		});
	});
}
rc.editor.itemSelTouchDo=function(thisId){//更改title
	if(thisId== 0){
		$(".itemSelPage h1").html("目錄");
		$("#recordSelItem").html("目錄");
		rc.editor.selItemId = 0;
	}else{
		var tmpValue = $("#itemSel_"+thisId).html();
		$(".itemSelPage h1").html(tmpValue);
		$("#recordSelItem").html(tmpValue);
		rc.editor.selItemId = thisId;
	}
}
rc.editor.getItemParentId=function(id){
	var tmp = $("#itemSel_"+id).parent().parent().parent().attr("id").split('_');
	return tmp[1];
}
rc.editor.setSelectDate=function(year,month,day){
	$("#recordYear").html(rc.html.yearOption(year));
	$("#recordMonth").html(rc.html.monthOption(month));
	$("#recordDay").html(rc.html.dayOption(day,year,month));
}
rc.editor.setSelectTime=function(hour,minute){
	$("#recordHour").html(rc.html.hourOption(hour));
	$("#recordMinute").html(rc.html.minuteOption(minute));
}
rc.newItem=function(name,pid,success){
	//id unique, pid, ownerId, name, type, useTimes, passTimes, sort
	var tmp = new Object();
	if(pid != undefined)tmp.pid=pid;
	else tmp.pid=0;
	tmp.ownerId = mb.id;
	tmp.name = name.replace("'","");
	tmp.type=0;
	tmp.useTimes=0;
	tmp.passTimes=0;
	tmp.sort = 0;
	db.autoSql("item");
	db.ins(tmp,success);
}
rc.editItem=function(itemId){
	var tmp = new Object();
	tmp.name = $("#itemName").val();
	tmp.sort = parseInt($("#itemSort").val());
	if(itemId == 0)return true;
	if(tmp.name==""){
		alert("請輸入分類名稱");
		return false;
	}
	if(isNaN(tmp.sort)){
		tmp.sort = 0;
	}
	db.autoSql("item","id = '"+itemId+"'");
	db.upd(tmp,function(){
		rc.editor.createItemSelPage(rc.editor.itemSelEvent,itemId);
		rc.editor.setItemQSel();
	});
	return true;
}

rc.deleteItem=function(itemId){
	if(itemId == 0)return true;
	db.autoSql("item","id = "+itemId);
	db.sel(function(r){
		db.autoSql("item","pid = "+r.rows.item(0).pid);
		db.sel(function(r2){
			if(r2.rows.length==0){
				var tmpId = rc.editor.getItemParentId(r.rows.item(0).pid);
				if(tmpId==0){
					$("#itemSelBack_0").tap();
				}else{
					$("#itemSel_"+tmpId).tap();
				}
				$("#itemSelPage_"+r.rows.item(0).pid).remove();
			}else{
				$("#backItemSel").tap();
			}
		});
	});
	
	rc.deleteItemChild(itemId);
	return true;
}
rc.deleteItemChild=function(itemId){
	db.autoSql("item","id = "+itemId);
	db.del(function(){
		$("#itemSel_"+itemId).parent().remove();
	});
	db.autoSql("item","pid = "+itemId);
	db.sel(function(r){
		if(r.rows.length>0){
			for(var i=0;i<r.rows.length;i++){
				rc.deleteItemChild(r.rows.item(0).id);
			}
		}
	});
}
rc.editRecord=function(recordId){
	var recordDate = new Date($("#recordYear").val(),$("#recordMonth").val()-1,$("#recordDay").val(),$("#recordHour").val(),$("#recordMinute").val(),0);
	var tmp = new Object();
	tmp.ownerId = mb.id;
	tmp.accountId = $("#recordAccount").val();
	tmp.date = cal.reTime(recordDate.getTime());
	tmp.currencyId = $("#recordCurrency").val();
	if($("#moneyPN").html()=="收")	tmp.pn = 0;
	else	tmp.pn = 1;
	tmp.money = $("#recordMoney").val();
	tmp.itemId = rc.editor.selItemId;
	tmp.editDate = cal.reTime(new Date());
	tmp.note = $("#recordNote").val();
	if(tmp.money==""){
		alert("請輸入金額");
		return false;
	}
	if(recordId == 0){//新增記錄
		db.autoSql("record");
		db.ins(tmp,undefined,function(){
			cal.setCalTable(recordDate.getFullYear(),recordDate.getMonth()+1);
			cal.doSelDay("calDateId_"+cal.reTime(cal.reDate(recordDate,"day").getTime()));
			rc.editor.createItemSelPage(rc.editor.itemSelEvent,tmp.itemId);
			rc.editor.setItemQSel();
			rc.accountAddMoney(tmp.accountId,tmp.pn,tmp.money,tmp.currencyId);
			rc.recordAddTimes(tmp.itemId,"+1",false);
			//update export
			ep.drawInit();
		});
	}else{//編輯記錄
		var old = rc.editor.saveRecord;
		db.autoSql("record","id = '"+recordId+"'");
		db.upd(tmp,function(){
			cal.setCalTable(recordDate.getFullYear(),recordDate.getMonth()+1);
			cal.doSelDay("calDateId_"+cal.reTime(cal.reDate(recordDate,"day").getTime()));
			rc.editor.createItemSelPage(rc.editor.itemSelEvent,tmp.itemId);
			rc.editor.setItemQSel();
			if(tmp.money != old.money || tmp.accountId != old.accountId){
				var pn = 0;if(old.pn == 0) pn =1;
				rc.accountAddMoney(old.accountId,pn,old.money,tmp.currencyId);
				rc.accountAddMoney(tmp.accountId,tmp.pn,tmp.money,tmp.currencyId);
			}
			if(tmp.itemId != old.itemId){
				rc.recordAddTimes(old.itemId,"-1",false);
				rc.recordAddTimes(tmp.itemId,"+1",false);
			}
			//update export
			ep.drawInit();
		});
	}
	return true;
}
rc.deleteRecord=function(recordId){
	
	if(recordId != 0){
		var old = rc.editor.saveRecord;
		db.autoSql("record","id = '"+recordId+"'");
		db.del(function(){
			cal.setCalTable();
			cal.doSelDay("n_"+old.date);
			//cal.doSelDay("calDateId_"+cal.reTime(cal.reDate(recordDate,"day").getTime()));
			//rc.editor.createItemSelPage(rc.editor.itemSelEvent,tmp.itemId);
			//rc.editor.setItemQSel();
			var pn = 0;if(old.pn == 0) pn =1;
			rc.accountAddMoney(old.accountId,pn,old.money,old.currencyId);
			rc.recordAddTimes(old.itemId,"-1",false);
		});
	}
}




rc.accountAddMoney=function(thisId,pn,value,currencyId){
	db.autoSql("currency","id="+currencyId);
	db.sel(function(r){
		if(r.rows.length ==0){
			if(pn==0){
				db.query("UPDATE account SET money = money +"+value+" WHERE id = '"+thisId+"'");
			}else{
				db.query("UPDATE account SET money = money -"+value+" WHERE id = '"+thisId+"'");
			}
		}else{
			if(pn==0){
				db.query("UPDATE account SET money = money +"+(value*r.rows.item(0).value)+" WHERE id = '"+thisId+"'");
			}else{
				db.query("UPDATE account SET money = money -"+(value*r.rows.item(0).value)+" WHERE id = '"+thisId+"'");
			}
		}
		cl.account.showList();
	});
	
}
rc.recordAddTimes=function(thisId,typeValue,isSort){
	if(isSort){//sort
		db.query("UPDATE item SET sort = sort "+typeValue+" WHERE id = '"+thisId+"'");
	}else{
		db.query("UPDATE item SET useTimes = useTimes "+typeValue+" WHERE id = '"+thisId+"'");
		rc.recordAddPassTimes(thisId,typeValue);
	}
}
rc.recordAddPassTimes = function(childId,typeValue){
	db.autoSql("item","id = '"+childId+"'");
	db.sel(function(r){
		if(r.rows.length==1){
			var pid = r.rows.item(0).pid;
			if(pid != 0){
				db.query("UPDATE item SET passTimes = passTimes "+typeValue+" WHERE id = '"+pid+"'");
				addPassTimes(pid);
			}
		}
	});
}
rc.editor.accountOption=function(){
	db.autoSql("account","ownerId='"+mb.id+"'");
	db.sel(function(r){
		var html = "<optgroup label='請選擇帳戶'>";
		for(var i=0;i<r.rows.length;i++){
			if(r.rows.item(i).activity == 1){
				html+="<option value='"+r.rows.item(i).id+"' selected='selected'>"+r.rows.item(i).name+"</option>";
			}else{
				html+="<option value='"+r.rows.item(i).id+"'>"+r.rows.item(i).name+"</option>";
			}
		}
		html+="</optgroup>";
		$("#recordAccount, #recordTFFrom, #recordTFTo").html(html);
	});
}
rc.editor.currencyOption=function(){
	db.autoSql("currency","activity=1");
	db.sel(function(r){
		var html = "<optgroup label='請選擇貨幣'>";
		for(var i=0;i<r.rows.length;i++){
			if(r.rows.item(i).id == localStorage.currencyId){
				html+="<option value='"+r.rows.item(i).id+"' selected='selected'>"+r.rows.item(i).name+"</option>";
			}else{
				html+="<option value='"+r.rows.item(i).id+"'>"+r.rows.item(i).name+"</option>";
			}
		}
		html+="</optgroup>";
		$("#recordCurrency").html(html);
	});
}

rc.html = new Object();

rc.html.yearOption=function(dfYear,num){
	if(dfYear == undefined)dfYear = new Date().getFullYear();
	if(num == undefined)num = 5;
	var html = "";
	for(var i = dfYear-1;i<dfYear+num;i++){
		if(i == dfYear)
			html += "<option value='"+i+"' selected='selected'>"+i+"年</option>";
		else
			html += "<option value='"+i+"'>"+i+"年</option>";
	}
	return html;
}
rc.html.monthOption=function(dfMonth){
	if(dfMonth == undefined)dfMonth = new Date().getMonth()+1;
	var html = "";
	for(var i = 1;i<=12;i++){
		if(i == dfMonth)
			html += "<option value='"+i+"' selected='selected'>"+i+"月</option>";
		else
			html += "<option value='"+i+"'>"+i+"月</option>";
	}
	return html;
}
rc.html.dayOption=function(dfDay,dfYear,dfMonth){
	if(dfDay == undefined)dfDay = new Date().getDate();
	if(dfYear == undefined)dfYear = new Date().getFullYear();
	if(dfMonth == undefined)dfMonth = new Date().getMonth()+1;
	var html = "";
	for(var i = 1;i<=new Date(dfYear,dfMonth,0).getDate();i++){
		if(i == dfDay)
			html += "<option value='"+i+"' selected='selected'>"+i+"日</option>";
		else
			html += "<option value='"+i+"'>"+i+"日</option>";
	}
	return html;
}
rc.html.hourOption=function(dfHour){
	if(dfHour == undefined)dfHour = new Date().getHours();
	var html = "";
	for(var i = 0;i<24;i++){
		if(i == dfHour)
			html += "<option value='"+i+"' selected='selected'>"+i+"點</option>";
		else
			html += "<option value='"+i+"'>"+i+"點</option>";
	}
	return html;
}
rc.html.minuteOption=function(dfMinute){
	if(dfMinute == undefined)dfMinute = new Date().getMinutes();
	var html = "";
	for(var i = 0;i<=60;i++){
		if(i == dfMinute)
			html += "<option value='"+i+"' selected='selected'>"+i+"分</option>";
		else
			html += "<option value='"+i+"'>"+i+"分</option>";
	}
	return html;
}


//轉帳功能













