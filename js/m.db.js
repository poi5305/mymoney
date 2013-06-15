// JavaScript Document
var db = new Object();

db.version = 1;

db.db = openDatabase('mydb', '1.0', 'MM', 2 * 1024 * 1024);

db.sql = "";
db.table = "";
db.where = "";
db.opt = "";

db.query = function(sql,success){
	db.db.transaction(function (t) {
		t.executeSql(sql, [], function(t, r){
			if(typeof(success)!="undefined")success(r);
		}, function(t, e){
			alert(e.message);
		});
	});
}
db.autoSql = function(table,where,opt){
	if(table != undefined)db.table = table;
	else db.table = "";
	if(where != undefined)db.where = where;
	else db.where = "";
	
	if(opt != undefined)db.opt = opt;
	else db.opt = "";
}
db.sel = function(f){
	db.sql = "SELECT * FROM "+db.table;
	if(db.where != "")db.sql += " WHERE "+db.where;
	if(db.opt != "")db.sql += " "+db.opt;
	var sql = db.sql;
	db.query(sql,f);
}
db.ins = function(data,idFunction,success){
	//db.query(db.sql);
	var sql = "INSERT INTO "+db.table;
	db.query("SELECT MAX(id) FROM "+db.table,function(r){
		var tmpF = "", tmpV = ""
		data.id = 1;
		if( r.rows.item(0)["MAX(id)"] != null) data.id = parseInt(r.rows.item(0)["MAX(id)"])+1;
		if(typeof(idFunction)!="undefined")idFunction(data.id);
		
		for(var key in data){
			tmpF=="" ? tmpF+=key : tmpF+=","+key;
			tmpV=="" ? tmpV+="'"+data[key]+"'" : tmpV+=" , '"+data[key]+"'";
		}
		sql += " ( "+tmpF+" ) VALUES ( "+tmpV+" )";
		db.query(sql,success);
		
	});
}
db.upd=function(data,success){
	var tmp ="";
	for(var key in data){
		tmp=="" ? tmp+= key +"="+"'"+data[key]+"'" : tmp += " , "+key +"="+"'"+data[key]+"'"
	}
	db.sql = "UPDATE "+db.table+" SET "+tmp;
	if(db.where != "")db.sql += " WHERE "+db.where;
	var sql = db.sql;
	db.query(sql,success);
}
db.del=function(success){
	db.sql = "DELETE FROM "+db.table;
	if(db.where != "")db.sql += " WHERE "+db.where;
	var sql = db.sql;
	db.query(sql,success);
}
//db.query('DROP TABLE account');
//db.query('DROP TABLE member');
//db.query('DROP TABLE item');
//db.query('DROP TABLE record');
//db.query('DROP TABLE currency');

db.query('CREATE TABLE IF NOT EXISTS member (id int(1) unique, user, gmail, password, activity int(1))');
db.query('CREATE TABLE IF NOT EXISTS account (id int(2) unique, ownerId int(1),pid int(2), name, money float, spMoney float, type int(1), day int(2), activity int(1))');
db.query('CREATE TABLE IF NOT EXISTS item (id int(3) unique, pid int(3), ownerId int(1), name, type int(2), useTimes int(3), passTimes int(3), sort int(2))');

//version 1
//db.query('CREATE TABLE IF NOT EXISTS record (id int(6) unique, ownerId int(1), accountId int(2), date int(10),currencyId int(3),pn int(1), money float, itemId int(3), editDate int(10), note )');
//version 0
db.query('CREATE TABLE IF NOT EXISTS record (id int(6) unique, ownerId int(1), accountId int(2), date int(10),currencyId int(3),pn int(1), money float, itemId int(3), editDate int(10) )');

db.query('CREATE TABLE IF NOT EXISTS currency (id int(3) unique, name varchar(3), value float, activity int(1))');
//轉帳 id from to value editDate note
db.query('CREATE TABLE IF NOT EXISTS transfer (id int(6) unique, aFrom int(2), aTo int(2), value float, editDate int(10), note)');

db.query('CREATE TABLE IF NOT EXISTS version (id int(3) unique)');


db.query("SELECT * FROM currency",function(r){
	if(r.rows.length == 0){
		db.query("INSERT INTO currency VALUES (0, 'NTD', 1, 1)");
		db.query("INSERT INTO currency VALUES (1, 'USD', 29.6, 1)");
		db.query("INSERT INTO currency VALUES (2, 'HKD', 3.6635, 0)");
		db.query("INSERT INTO currency VALUES (3, 'GBP', 46.47, 0)");
		db.query("INSERT INTO currency VALUES (4, 'AUD', 30.71, 0)");
		db.query("INSERT INTO currency VALUES (5, 'CAD', 30.155, 0)");
		db.query("INSERT INTO currency VALUES (6, 'SGD', 23.61, 0)");
		db.query("INSERT INTO currency VALUES (7, 'CHF', 35.34, 0)");
		db.query("INSERT INTO currency VALUES (8, 'JPY', 0.3137, 0)");
		db.query("INSERT INTO currency VALUES (9, 'SEK', 4.245, 0)");
		db.query("INSERT INTO currency VALUES (10, 'NZD', 24.415, 0)");
		db.query("INSERT INTO currency VALUES (11, 'THB', 0.9254, 0)");
		db.query("INSERT INTO currency VALUES (12, 'PHP', 0.68905, 0)");
		db.query("INSERT INTO currency VALUES (13, 'IDR', 0.003435, 0)");
		db.query("INSERT INTO currency VALUES (14, 'EUR', 40.54, 0)");
		db.query("INSERT INTO currency VALUES (15, 'KRW', 0.02746, 0)");
		db.query("INSERT INTO currency VALUES (16, 'VND', 0.00136, 0)");
		db.query("INSERT INTO currency VALUES (17, 'MYR', 9.2125, 0)");
		db.query("INSERT INTO currency VALUES (18, 'CNY', 4.4945, 0)");
	}
});



db.vesionCheck = function(){
	db.query("SELECT MAX(id) FROM version",function(r){
		var oVersion = 0;
		if(r.rows.item(0)["MAX(id)"] != null)oVersion = parseInt(r.rows.item(0)["MAX(id)"]);
		for(var i = oVersion ; i < db.version; i++){
			db.updateVesion((i+1));
		}
	});
	
}
db.updateVesion = function(v){
	switch(v){
		case 1:	
			db.query("ALTER TABLE record ADD note");
			db.query("INSERT INTO version VALUES (1)");
			alert("MyMoney Updated to version 1");
			break;
	}
}

db.vesionCheck();



/* function */

var f = new Object();

f.reMoney=function(money){
	if(localStorage.currencyValue<=1){
		return money.toFixed(0);
	}else if(localStorage.currencyValue<=10){
		return money.toFixed(1);
	}else{
		return money.toFixed(2);
	}
}
