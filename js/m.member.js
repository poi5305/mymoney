// JavaScript Document
var mb = new Object();

mb.id=0;
mb.user="";


mb.newUser=function(user,gmail,password,activity,success){
	var tmpU = new Object();
	tmpU.user = mb.user = user.replace("'","");;
	if(gmail != undefined)tmpU.gmail = gmail.replace("'","");;
	if(password != undefined)tmpU.password = password;
	if(activity != undefined)tmpU.activity = activity;
	else tmpU.activity = 1;
	db.autoSql("member");
	db.ins(tmpU,function(id){
		mb.id = id;
		success(id);
	});
}
mb.newAccount=function(ownerId,pid,name,money,spMoney,type,day,activity,success){
	var tmpA = new Object();
	tmpA.ownerId = ownerId;
	tmpA.pid = pid;
	tmpA.name = name.replace("'","");
	tmpA.money = money;
	tmpA.spMoney = spMoney;
	tmpA.type=type;
	tmpA.day=day;
	tmpA.activity = activity;
	db.autoSql("account");
	db.ins(tmpA,function(id){
		if(typeof(success)!="undefined")success(id);
	});
}
mb.editAccount=function(id,ownerId,pid,name,money,spMoney,type,day,activity,success){
	var tmpA = new Object();
	tmpA.ownerId = ownerId;
	tmpA.pid = pid;
	tmpA.name = name.replace("'","");
	tmpA.money = money;
	tmpA.spMoney = spMoney;
	tmpA.type=type;
	tmpA.day=day;
	tmpA.activity = activity;
	db.autoSql("account","id='"+id+"'");
	db.upd(tmpA,success);
}