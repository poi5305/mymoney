// JavaScript Document
var cl = new Object();

cl.account = new Object();
cl.account.saveId = 0;


/* ctrl  Account  */
cl.account.init = function(){
	cl.account.initPage();
	$("#saveAccount").bind("tap",function(){
		if(cl.account.edit()){
			setTimeout("cl.account.showList();cal.setCalTable();jQT.goBack();",200);
		}
	});
	$("#ctrl_account_new").bind("touchstart",function(){
		cl.account.saveId = 0;
		$("#ctrl_account_editor h1").html("新增帳戶");
		$("#accountName").val("");
		$("#accountMoney").val("");
		$("#accountSpMoney").val("");
		$("#accountActivity").attr("checked",false);
		$(".accountType").attr("disabled",false);
		cl.account.setEditorPidOption(0,0);
	});
	$(".accountType").bind("tap",function(){
		cl.account.typeCtrl($(this).val());
	});
}
cl.account.initPage = function(){
	cl.account.showList();
}
cl.account.showList = function(){
	var chAccountType = function(type){
		if(type==1)return "信用帳戶";
		else if(type==2)return "代幣帳戶";
		else return "一般用戶";
	}
	var ckAccountTypeLength = function(){
		db.autoSql("account","ownerId="+mb.id+" AND type=0");
		db.sel(function(r){
			if(r.rows.length<=1){
				$(".accountType").attr("disabled",true);
			}
		});
	}
	db.autoSql("account","ownerId = '"+mb.id+"'");
	db.sel(function(r){
		if(r.rows.length==0)return false;
		var html = "";
		for(var i=0; i<r.rows.length;i++){
			html+="<li class='arrow'><a id='editAccount_"+r.rows.item(i).id+"' href='#ctrl_account_editor' class='editAccount'>";
			html+="<div class='infoBlock'>";
			html+="<div class='infoTitle'>"+r.rows.item(i).name+"</div>";
			html+="<div class='infoSubTitle'>"+chAccountType(r.rows.item(i).type)+"</div>";
			html+="<div class='infoMidText'>";
			html+=f.reMoney(r.rows.item(i).money /localStorage.currencyValue)+localStorage.currencyName;
			html+="</div>";
			if(r.rows.item(i).type == 1){
				html+="<div class='infoMiniText'>結帳日期</div>";
				html+="<div class='infoMiniText'>"+r.rows.item(i).day+"</div>";
			}else if(r.rows.item(i).type == 2){
				
			}
			html+="</div>";
			html+="</a></li>";
		}
		$("#ctrl_account_list").html(html);
		//after event 點擊後事件
		$(".editAccount").bind("touchstart",function(){
			var tmp = $(this).attr("id").split("_");
			db.autoSql("account","id = '"+tmp[1]+"'");
			db.sel(function(r){
				if(r.rows.length==0)return false;
				cl.account.saveId = r.rows.item(0).id;
				$("#ctrl_account_editor h1").html(r.rows.item(0).name);
				$("#accountName").val(r.rows.item(0).name);
				$("#accountMoney").val((r.rows.item(0).money/localStorage.currencyValue).toFixed(2));
				if(r.rows.item(0).activity==0)	$("#accountActivity").attr("checked",false);
				else	$("#accountActivity").attr("checked",true);
				if(r.rows.item(0).type==0)	ckAccountTypeLength();
				else	$(".accountType").attr("disabled",false);
				$(".accountType[value='"+r.rows.item(0).type+"']").attr("checked",true);
				cl.account.typeCtrl(r.rows.item(0).type);
				$("#accountSpMoney").val((r.rows.item(0).spMoney/localStorage.currencyValue).toFixed(2));
				cl.account.setEditorPidOption(r.rows.item(0).id,r.rows.item(0).pid);
				$("#accountDay").html(function(){
					var html = "";
					for(var i=0;i<29;i++){
						if(i == r.rows.item(0).day)	{html+="<option value='"+i+"' selected='selected'>"+i+"</option>";}
						else	html+="<option value='"+i+"'>"+i+"</option>";
					}
					return html;
				});
			});
		});
		
	});
}
cl.account.edit=function(){
	var pid = parseInt($("#accountPid").val());
	var name = $("#accountName").val();
	var money = (parseFloat($("#accountMoney").val())*localStorage.currencyValue).toFixed(4);
	var spMoney = (parseFloat($("#accountSpMoney").val())*localStorage.currencyValue).toFixed(4);
	var type = parseInt($(".accountType:checked").val());
	var day = parseInt($("#accountDay").val());
	if($("#accountActivity").attr("checked"))	var activity = 1;
	else activity = 0;
	if(name == ""){
		alert("請輸入帳戶名");
		return false;
	}
	if(isNaN(pid))pid = 0;
	if(isNaN(money))money = 0;
	if(isNaN(spMoney))spMoney = 0;
	if(isNaN(type))type = 0;
	if(isNaN(day))day = 0;
	
	var success = function(){//更改後做的事情
		cl.account.initPage();
		rc.editor.accountOption();
	};
	
	if(cl.account.saveId == 0){
		mb.newAccount(mb.id,pid,name,money,spMoney,type,day,activity,success);
	}else{
		mb.editAccount(cl.account.saveId,mb.id,pid,name,money,spMoney,type,day,activity,success);
	}
	return true;
}
cl.account.typeCtrl=function(type){
	if(type==1){	
		$("#accountSpMoney").parent().show();
		$("#accountPid").parent().show();
		$("#accountDay").parent().show();
	}else if(type==2){
		$("#accountSpMoney").parent().show();
		$("#accountPid").parent().show();
		$("#accountDay").parent().hide();
	}else{
		$("#accountSpMoney").parent().hide();
		$("#accountPid").parent().hide();
		$("#accountDay").parent().hide();
	}
}	
cl.account.setEditorPidOption = function(id,pid){
	db.autoSql("account","ownerId="+mb.id+" AND type = 0 AND id !="+id);
	db.sel(function(r){
		var html = "";
		if(r.rows.length == 0)		html += "<option value='0'>請先創立一般帳號</option>";
		else	html += "<option value='0'>無</option>";
		for(var i=0; i<r.rows.length;i++){
			if(r.rows.item(i).id == pid)	html+="<option value='"+r.rows.item(i).id+"' selected='selected'>"+r.rows.item(i).name+"</option>";
			else	html+="<option value='"+r.rows.item(i).id+"'>"+r.rows.item(i).name+"</option>";
		}
		$("#accountPid").html(html);
	});
};

/* ctrl Currency */
		
cl.currency = new Object();

cl.currency.init = function(){
	cl.currency.initPage();
	
	$("#ctrl_currency_update").bind("click",function(){
		if(confirm("此動作將連到網路，是否繼續？\n（資料來源：台灣銀行）")){
			cl.currency.update();
		}
	});
	$("#ctrl_currency_new").bind("touchstart",function(){
		cl.currency.newList();
	});
}
cl.currency.initPage = function(){
	cl.currency.setMainOption();
	cl.currency.showList();
	cl.currency.newList();
}
cl.currency.setMainOption = function(){
	db.autoSql("currency","activity=1");
	db.sel(function(r){
		if(r.rows.length == 0)return false;
		var html = "";
		for(var i=0; i<r.rows.length;i++){
			if(localStorage.currencyId == r.rows.item(i).id)
				html += "<option selected='selected' value='"+r.rows.item(i).id+"'>"+r.rows.item(i).name+"</option>";
			else
				html += "<option value='"+r.rows.item(i).id+"'>"+r.rows.item(i).name+"</option>";
		}
		$("#currencyMain").html(html);
	});
	cl.currency.doSelMain();
}
cl.currency.doSelMain = function(){
	$("#currencyMain").change(function(){
		db.autoSql("currency"," id = "+$(this).val());
		db.sel(function(r){
			if(r.rows.length == 0)return false;
			localStorage.currencyId = r.rows.item(0).id;
			localStorage.currencyName = r.rows.item(0).name;
			localStorage.currencyValue = r.rows.item(0).value;
			cl.currency.showList();
			rc.editor.currencyOption();
			cl.account.showList();
		});
	});
}
cl.currency.showList = function(){
	db.autoSql("currency","activity = 1");
	db.sel(function(r){
		if(r.rows.length == 0)return false;
		var html = "";
		for(var i=0; i<r.rows.length;i++){
			html+="<li><a id='currency_"+r.rows.item(i).id+"' href='#' >";
			html+="<div class='infoBlock'>";
			html+="<div class='infoTitle'>"+r.rows.item(i).name+"</div>";
			html+="<div class='infoSubTitle'>"
			html+=(r.rows.item(i).value / localStorage.currencyValue).toFixed(7)+"&nbsp;"+localStorage.currencyName;
			html+="</div>";
			html+="</div>";
			html+="</a></li>";
		}
		$("#ctrl_currency_list").html(html);
	});
}
cl.currency.newList = function(){
	db.autoSql("currency");
	db.sel(function(r){
		if(r.rows.length == 0)return false;
		var html = "";
		for(var i=0; i<r.rows.length;i++){
			html+="<li>";
			html+="<div class='infoBlock'>";
			html+="<div class='infoMiniText'>"+r.rows.item(i).name+"</div>";
			html+="<div class='infoMiniText'>";
			html+=(r.rows.item(i).value / localStorage.currencyValue).toFixed(6);
			html+="</div>";
			if(r.rows.item(i).activity == 1)
			html+="<span class='toggle'><input id='currencyAll_"+r.rows.item(i).id+"' type='checkbox' checked='checked' class='currency_new' /></span>";
			else
			html+="<span class='toggle'><input id='currencyAll_"+r.rows.item(i).id+"' type='checkbox' class='currency_new' /></span>";
			html+="</div>";
			html+="</li>";
		}
		$("#ctrl_currency_newList").html(html);
		$(".currency_new").change(function(){
			var tmp = $(this).attr("id").split("_");
			db.autoSql("currency","id="+tmp[1]);
			if($(this).attr("checked"))
				db.upd(new Object({"activity":"1"}));
			else
				db.upd(new Object({"activity":"0"}));
			cl.currency.showList();
			rc.editor.currencyOption();
			cl.currency.setMainOption();
		});
	});
}
cl.currency.update = function(){
	var afterEvent = function(){
		alert("更新完成");
		cl.currency.showList();
		rc.editor.currencyOption();
		cl.account.showList();
	}
	var upd = function(id,name,value){
		var c_id = id; var c_name = name; var c_value = value;
		db.autoSql("currency","id='"+c_id+"'");
		db.sel(function(r){
			if(r.rows.length == 0){//ins
				db.autoSql("currency");
				db.query("INSERT INTO currency VALUES ("+c_id+", '"+c_name+"', "+c_value+", 0)");
			}else{//upd
				db.autoSql("currency","id="+r.rows.item(0).id);
				db.upd(new Object({"name":c_name,"value":c_value}));
			}
		});
	}
	$.getJSON("http://www.amourlin.com/mymoney/currency.php?code=zaxscdvf&jsoncallback=?",function(json) {
		for(var i=0;i<json.length;i++){
			upd(json[i].id,json[i].name,json[i].value);
		}
		setTimeout(afterEvent,250);
	});
}


//轉帳功能

cl.transfer = new Object();

cl.transfer.init = function(){
	$("#newTransfer").bind( "touchstart",function(){
		rc.editor.saveRecordId = 0;
		rc.editor.initPage();
		$("#deleteRecord").hide();
		rc.editor.type = "transfer";
		$(".unTF").hide();
		$(".TF").show();
	});
}











