// JavaScript Document
var idx = new Object();

idx.checkActiveUser = function(){
	db.autoSql("member","activity = '1'");
	db.sel(function(r){
		if(r.rows.length>0){
			mb.id = r.rows.item(0).id;
			mb.user = r.rows.item(0).user;
			idx.init();
		}else{
			$("#goWelcome").tap();
			idx.firstUse();
		}
	});
}
idx.firstUse = function(){
	$("#setGoogle").tap(function(){
		$("#setGoogle").parent().parent().hide();
		$("#GooleForm").show();
	});
	$("#goHomeCheck").tap(function(){
		if($("#user").val() != "" && $("#account").val() != ""){
			mb.newUser($("#user").val(),$("#gmail").val(),$("#password").val(),1,function(id){
				mb.newAccount(id,0,$("#account").val(),0,0,0,0,1,function(){
					idx.localStorageInit();
					idx.init();
					alert("歡迎使用MyMoney");
					$("#goHome").tap();
				});
			});
		}else{
			alert("請輸入使用者名稱和帳戶名稱");
		}
	});
}
idx.init = function(){//只有執行一次
	idx.localStorageCheck();
	cal.init();
	rc.editor.init();
	cl.account.init();
	cl.currency.init();
	cl.transfer.init();
	ep.init();
}
idx.localStorageInit = function(){
	localStorage.ready = true;
	localStorage.currencyId = 0;
	localStorage.currencyName = "NTD";
	localStorage.currencyValue = 1;
}
idx.localStorageCheck = function(){
	
	if(localStorage.ready == undefined){
		idx.localStorageInit();
	}
}



