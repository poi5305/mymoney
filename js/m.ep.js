var ep = new Object();
ep.svg = function(id,appendTo,data,setting){
	/* 初始值設定 */
	this.otherRatio= 0.10;
	//this.maxListNum = 10;
	this.width = $("body").width();
	this.height = $("body").height()-90;
	this.textFontSize = 12;
	this.data = new Array();
	
	/* 手動設定值 */
	if(typeof(setting)=="object"){
		for(var key in setting){
			if(typeof(setting[key])=="object"){
				for(var key2 in setting[key]){
					this[key][ley2] = setting[key][key2];
				}
			}else{
				this[key] = setting[key];
			}
		}
	}
	
	/* 新增框架 */
	var html ="";
	html+="<iframe id='"+id+"' width='"+this.width+"' height='"+this.height+"' frameborder='0' scrolling='no' marginheight='0' marginwidth='0' src='svg.svg' style='display:none;'>";
	html+="</iframe>";
	$(appendTo).append(html);
	$("#"+id).fadeIn(600);
	
	/* 反設定 */
	var height = this.height;
	var width = this.width;
	$("#"+id).load(function(){
		$(this).height(height);
		$(this).width(width);
		$(this).contents().find("#svg").each(function(){
			//this.setAttribute("height", height);
			//this.setAttribute("width", width);
		});
	});
	/*資料重新格式*/
	this.reData = function(data){
		
		var nData = new Array();
		var oData = new Array();
		if(data.length == 0)	return nData;
		var totalValue = 0;for(var i=0;i<data.length;i++){totalValue += data[i].value};
		this.totalValue = totalValue;
		if(totalValue==0)return 0;
		data.sort(function(a,b){return b.value - a.value});//由大到小排序
		
		var nDataNum = 0;
		var oDataNum = 0;
		var oName = "其他";
		var oValue = 0;
		for(var i=0;i<data.length;i++){
			var ratio = data[i].value/totalValue;
			if(ratio>=this.otherRatio){
				nData[nDataNum] = new Object();
				nData[nDataNum].id = data[i].id;
				nData[nDataNum].name = data[i].name;
				nData[nDataNum].value = data[i].value;
				nData[nDataNum].ratio = ratio;
				nDataNum++;
			}else{
				oValue += data[i].value;
				oData[oDataNum] = new Object();
				oData[oDataNum].id = data[i].id;
				oData[oDataNum].name = data[i].name;
				oData[oDataNum].value = data[i].value;
				oData[oDataNum].ratio = ratio;
				oDataNum ++;
			}
		}
		if(oValue != 0){
			nData[nDataNum] = new Object();
			nData[nDataNum].name = oName;
			nData[nDataNum].value = oValue;
			nData[nDataNum].ratio = oValue/totalValue;
			nData[nDataNum].child = oData;
		}
		this.data = nData;
	}
	this.reData(data);
	
	/* 圓餅圖 */
	this.circle = function(textVFunction){
		var RETURN = new Array();
		RETURN[0] = document.createElementNS("http://www.w3.org/2000/svg","g");
		var data = this.data;
		if(data.length == 0){
			this.errorDisplay(0);
			return 0;
		}else if(data == undefined){
			this.errorDisplay(1);
			return 0;
		}
		var padding = 2;
		var x =(this.width)/2;
		var y =(this.height)/2;
		var r = 0;
		if(x<y){
			r=x-padding-2;
			y=x=x+padding/2;
		}else{
			r=y-padding-2;
			y=x=y+padding/2;
		}
		
		//90度
		var rp = Math.PI/2;
		var tmpX =x+r*Math.cos(rp);
		var tmpY =y-r*Math.sin(rp);
		for(var i =0;i<data.length;i++){
			if(data[i].ratio <0.03)continue;
			var s = "";
			var path = "M"+x+","+y;
			path += "L"+tmpX+","+tmpY;
			
			rp -= 2*Math.PI*data[i].ratio;
			var tmpX =x+r*Math.cos(rp);
			var tmpY =y-r*Math.sin(rp);
			
			if(data[i].ratio<0.5)var arc = "0,0,1";
			else var arc = "0,1,1";
			path += "A"+r+","+r+","+arc+","+tmpX+","+tmpY;
			path += "L"+x+","+y+"z";
			var textX = x+r/1.4*Math.cos(rp+Math.PI*data[i].ratio);
			var textY = y-r/1.4*Math.sin(rp+Math.PI*data[i].ratio);
			
			
			var g = document.createElementNS("http://www.w3.org/2000/svg","g");
			g.setAttribute("id","itemId_"+data[i].id);
			var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
			p.setAttribute("d", path);
			p.setAttribute("class", "circle circle"+i);
			g.appendChild(p);
			
			var textV = Array();
			
			if(textVFunction != undefined){
				textV = textVFunction(data[i]);
			}else{
				textV[0] = data[i].name;
				textV[1] = (data[i].ratio*100).toFixed(1)+"%";
				textV[2] = f.reMoney(data[i].value);
				textV[2]+=localStorage.currencyName.substr(0,2);
			}
			for(var t=0;t<textV.length;t++){
				var tt = document.createElementNS("http://www.w3.org/2000/svg", "text");
				tt.setAttribute("class", "text text"+i);
				tt.setAttribute("x",textX);
				tt.setAttribute("y",(textY-(this.textFontSize/2+1)*(textV.length-1)+(this.textFontSize+1)*t));
				tt.setAttribute("font-size",this.textFontSize);
				tt.textContent= textV[t];
				g.appendChild(tt);
			}
			RETURN[i+1] = g;
		}
		$("#"+id).load(function(){
			$(this).contents().find("#svg").each(function(){
				for(var i = 0;i<RETURN.length;i++){
					this.appendChild(RETURN[i]);
				}
				$(this).find("g").bind("click",function(){
					if(ep.wait == 1)return 0;
					var tmp = $(this).attr("id").split("_");
					if(tmp[1] != undefined && tmp[1] != ep.itemId)
						ep.drawInit(tmp[1]);
				});
				if(data[data.length-1].child != undefined){
					var odata = data[data.length-1].child;
					var g = document.createElementNS("http://www.w3.org/2000/svg","g");
					var tt = document.createElementNS("http://www.w3.org/2000/svg", "text");
					tt.setAttribute("class", "odata text-other");
					tt.setAttribute("x",20);
					tt.setAttribute("y",x*2+30);
					tt.setAttribute("font-size",20);
					tt.textContent = "其他（詳細）：";
					g.appendChild(tt);
					for(var i = 0;i<odata.length;i++){
						if(odata[i].value==0)continue;
						var fontSize = 14;
						var y = i*(fontSize+4)+55+x*2;
						var tt = document.createElementNS("http://www.w3.org/2000/svg", "text");
						tt.setAttribute("class", "odata text-other");
						tt.setAttribute("x",35);
						tt.setAttribute("y",y);
						tt.setAttribute("font-size",fontSize);
						tt.textContent = odata[i].name+" ("+odata[i].value+", "+(odata[i].ratio*100).toFixed()+"%)";
						g.appendChild(tt);
					}
					
					$("#"+id).height(y+fontSize+20);
					this.appendChild(g);
					
				}
			});
		});
	}
	
	this.errorDisplay=function(error){
		var g = document.createElementNS("http://www.w3.org/2000/svg","g");
		var tt = document.createElementNS("http://www.w3.org/2000/svg", "text");
		tt.setAttribute("class", "text");
		tt.setAttribute("x",this.width/2);
		tt.setAttribute("y",this.height/2);
		tt.setAttribute("font-size",24);
		if(error == 0){
			//length = 0
			tt.textContent= "目前沒有記錄";
		}else if(error ==1){
			//error
			tt.textContent= "目前沒有資料";
		}
		g.appendChild(tt);
		$("#"+id).load(function(){
			$(this).contents().find("#svg").each(function(){
				this.appendChild(g);
			});
		});
	}
	this.remove = function(){
		$("#"+id).fadeOut(600);
		setTimeout("$('#"+id+"').remove();",600);
	}
	
}



/* export page */
ep.showType = 0; // 0->circle, 1->rect
ep.dateType = 1; //0->year, 1->month, 2->day
ep.date = new Date();
ep.date.setHours(0,0,0,0);
ep.itemId = 0;
ep.itemPid = 0;
ep.account = 0; // 0->all, other->other
ep.pn = 2; //0-> -, 1-> +, 2->all
ep.wait = 0;//驗證太多使用
ep.info=new Array();


ep.data = new Array();

ep.eventInit =function(){
	
}
ep.init = function(){
	ep.sp.init();
	ep.initPage();
	ep.backEvent();
}
ep.backEvent=function(){
	$("#epBack").tap(function(e){
		if(ep.itemId == 0) 
			jQT.goBack();
		else
			ep.drawInit(ep.itemPid);
	});
}
ep.initPage = function(){
	ep.drawInit();
}
ep.drawInit =function(itemId){
	if(itemId!=undefined)ep.itemId = itemId;
	if(ep.svgChart != undefined){
		ep.svgChart.remove();
		delete(ep.svgChart);
	}
	ep.getData();
	if(ep.wait==0)setTimeout("ep.draw()",800);
	ep.wait=1;
}
ep.draw = function(){
	//收入 支出 總計
	var totalValue = 0;
	var income = 0;
	var spend = 0;
	for(var i=0;i<ep.data.length;i++){
		if(ep.data[i].pn==1){
			income += ep.data[i].value;
			totalValue += ep.data[i].value;
		}else{
			spend += ep.data[i].value;
			totalValue -= ep.data[i].value;
		}
	}
	ep.info[2] = "收："+income+" 支："+spend+" 總計："+totalValue+" ("+localStorage.currencyName+")";
	
	$("#svgChartInfo").html(ep.info2text());
	//alert(ep.svgChart.data);
	ep.svgChart = new ep.svg("chart","#svgChart",ep.data);
	//alert(ep.svgChart.data);
	ep.svgChart.circle();
	ep.wait=0;
}
ep.info2text=function(){
	var text = "";
	for(i in ep.info){
		text+=ep.info[i]+"<br>";
	}
	return text;
}
ep.sp = new Object();
ep.sp.init=function(){
	$(".spCalLast, .spCalNext").bind("tap",function(){
		if(this.className.match("Last"))var ch = -1;
		else var ch=1;
		if(ep.dateType == 0){
			ep.date.setFullYear(ep.date.getFullYear()+ch);
		}else{
			ep.date.setMonth(ep.date.getMonth()+ch);
		}
		$(".spCalDate").html(ep.getFormatDate(ep.date.getTime(),"Y/M/D"));
		$(".spCalSelD").html(ep.sp.htmlCalTable());
		$(".spCalDay").bind("touchend",function(){
			if(ep.dateType!=2)return 0;
			var tmp = $(this).attr("id").split("_");
			ep.date.setTime(tmp[1]*1000);
			ep.drawInit();
		});
	});
	$("#svgChartInfo").bind("tap",function(){
		//if(ep.itemId != 0) ep.drawInit(ep.itemPid);
	})
	$(".spBtn").bind("touchstart",function(){
		$(this).css("opacity","0.5");
	}).bind("touchend",function(){
		$(this).css("opacity","");
	});
	$(".spBtnBox").bind("tap",function(e){
		var className = e.target.className;
		if(className.match("spCalNext") || className.match("spCalLast")){
			
		}else{
			$(this).animate({top:-$(this).outerHeight()-1},1);
			
		}
	});
	$(".spCalDate").html(ep.getFormatDate(ep.date.getTime(),"Y/M/D"));
	$(".spShowBox").bind("tap",function(){
		var index = $(".spShowBox").index(this);
		var box = $(this).parent().parent().find(".spBtnBox").eq(index);
		if(box == undefined)return 0;
		if(box.css("display")=="none"){
			var boxLeft = $(this).offset().left+$(this).outerWidth()/2-box.outerWidth()/2;
			if(boxLeft+box.outerWidth()>$("body").width())boxLeft= $("body").width() - box.outerWidth();
			box.offset({top:$(this).parent().offset().top-box.outerHeight()-1,left:boxLeft});
			box.show();
		}
		$(".spBtnBox").each(function(){
			$(this).animate({top:-$(this).outerHeight()-1},1);
		});
		if(box.offset().top<=0){
			box.animate({top:$(this).parent().offset().top+$(this).parent().outerHeight()+3},1);
		}else{
			box.animate({top:-box.outerHeight()-1},1);
		}
		
	});
	$(".dateType").bind("tap",function(){
		var type = $(this).attr("id");
		$(".spCalSelD").css("visibility","hidden");
		if(type=="y"){
			ep.dateType=0;
		}else if(type=="m"){
			ep.dateType=1;
		}else if(type=="d"){
			ep.dateType=2;
			$(".spCalSelD").css("visibility","visible");
		}
		ep.drawInit();
	});
	$(".spCalDate").bind("tap",function(){
		ep.drawInit();
	});
	$(".spCalSelD").html(ep.sp.htmlCalTable());
	$(".spCalDay").bind("touchend",function(){
		if(ep.dateType!=2)return 0;
		var tmp = $(this).attr("id").split("_");
		ep.date.setTime(tmp[1]*1000);
		ep.drawInit();
	});
}
ep.sp.htmlCalTable = function(){
	var html = "";
	var year = ep.date.getFullYear();
	var month = ep.date.getMonth();
	var day = ep.date.getDate();
	var tDate = new Date(year,month,1);
	
	html+="<table><tr><td>日</td><td>一</td><td>二</td><td>三</td><td>四</td><td>五</td><td>六</td></tr>";
	cal.weeks = 0;
	for(var i=0,calFirst = 1-tDate.getDay() ; i < 42  ; i++, calFirst++){
		tDate.setFullYear(year,month,calFirst);
		if(i%7==0)html+="<tr>";
		html+="<td>";
		if(tDate.getMonth() == month){
			html+="<div class='spCalDay'  id='spCalDayTime_"+cal.reTime(tDate.getTime())+"'>"+tDate.getDate()+"</div>";
			/*
			if(tDate.getDay()==0){
				html+="<div>"+tDate.getDate()+"</div>";
			}else if(tDate.getDay()==6){
				html+="<div>"+tDate.getDate()+"</div>";
			}else{
				html+="<div>"+tDate.getDate()+"</div>";
			}
			*/
		}else{
			//html+="<div>"+tDate.getDate()+"</div>";
		}
		html+="</td>";
		if(i%7==6){
			cal.weeks++;
			html+="</tr>";
			if(tDate.getMonth() == month+1){
				break;
			}
		}
	}
	html+="</table>";
	return html;
}






/* get circle data */
ep.getData = function(){
	ep.data = new Array();
	ep.info = new Array();
	ep.itemPid = 0;
	/* readInfo */
	if(ep.itemId == 0){
		ep.info[0] =" 分類：目錄";
	}else{
		db.query("SELECT * FROM item WHERE id ="+ep.itemId,function(r){
			if(r.rows.length==1){
				ep.itemPid = r.rows.item(0).pid;
				ep.info[0] ="分類："+r.rows.item(0).name;
			}
		});
	}
	/* 父分類資料讀取 */
	ep.data[0] = new Object({"id":ep.itemId,"name":"此分類","value":0});
	db.query(ep.getTMoneySQL(ep.itemId,true),function(r){
		if(r.rows.length==1){
			if(r.rows.item(0).tMoney != null)ep.data[0].value=r.rows.item(0).tMoney;
		}
	});
		
	/* 第一層Child多name */
	var sql ="SELECT id,name";
	sql+=",("+ep.getTMoneySQL("item.id")+") tMoney";
	sql+=" FROM item";
	sql+=" WHERE pid="+ep.itemId;
	db.query(sql,function(r){
		for(var i=0;i<r.rows.length;i++){
			var idx = ep.data.length;
			ep.data[idx] = new Object();
			ep.data[idx].id=r.rows.item(i).id;
			ep.data[idx].name=r.rows.item(i).name;
			//alert(r.rows.item(i).tMoney)
			if(r.rows.item(i).tMoney == null)	ep.data[idx].value=0;
			else	ep.data[idx].value=r.rows.item(i).tMoney;
			
			ep.getChildValue(r.rows.item(i).id,idx);
		}
	});
}
/* 第二層以後資料讀取 */
ep.getChildValue=function(pid,idx){
	var sql ="SELECT id";
	sql+=",("+ep.getTMoneySQL("item.id")+") tMoney";
	sql+=" FROM item";
	sql+=" WHERE pid="+pid;
	db.query(sql,function(r){
		for(var i=0;i<r.rows.length;i++){
			if(r.rows.item(i).tMoney != null)
			ep.data[idx].value+=r.rows.item(i).tMoney;
			ep.getChildValue(r.rows.item(i).id,idx);
		}
	});
}
ep.getDataIdxByKV=function(data,key,value){
	for(var i in data){
		if(data[i][key] == undefined)continue;
		if(data[i][key] == value)return i;
	}
	return null;
}
ep.getTMoneySQL=function(itemId,isTM){
	var tmpDate = new Date(ep.date.getTime());
	var sql = "";
	sql+="SELECT SUM(money*(SELECT value FROM currency WHERE id = record.currencyId))";
	if(isTM == true) sql+=" tMoney";
	sql+=" FROM record";
	sql+=" WHERE ";
	if(itemId!=undefined)sql+=" itemId="+itemId;
	sql+=" AND ownerId="+mb.id;
	if(ep.account != 0)sql+=" AND accountId="+ep.account;
	if(ep.pn!=2)sql+=" AND pn="+ep.pn;
	if(ep.dateType==0){//year
		tmpDate.setMonth(0,1);// year/1/1
		var minDate = cal.reTime(tmpDate.getTime());
		tmpDate.setFullYear(tmpDate.getFullYear()+1);//year+1 /1/1
		var maxDate = cal.reTime(tmpDate.getTime());
	}else if(ep.dateType==1){//month
		tmpDate.setDate(1);
		var minDate = cal.reTime(tmpDate.getTime());
		tmpDate.setMonth(tmpDate.getMonth()+1);
		var maxDate = cal.reTime(tmpDate.getTime());
	}else{
		var minDate = cal.reTime(tmpDate.getTime());
		tmpDate.setDate(tmpDate.getDate()+1);
		var maxDate = cal.reTime(tmpDate.getTime());
	}
	sql+=" AND date >="+minDate+" AND date < "+maxDate;
	
	if(ep.info[1] == undefined){
		if(ep.dateType == 0){
			ep.info[1] ="範圍：年 ";
		}else if(ep.dateType == 1){
			ep.info[1] ="範圍：月 ";
		}else if(ep.dateType == 2){
			ep.info[1] ="範圍：日 ";
		}
		ep.info[1]+=" ("+ep.getFormatDate(minDate*1000,"Y/M/D")+"~"+ep.getFormatDate(maxDate*1000-1,"Y/M/D")+")";
	}
	return sql;
}
ep.getFormatDate = function(time,format){
	//format "Y/M/D H:M:S"
	if(format == undefined)format="Y/M/D H:M:S";
	var tmp = new Date(time);
	format = format.replace("Y",tmp.getFullYear());
	format = format.replace("M",tmp.getMonth()+1);
	format = format.replace("D",tmp.getDate());
	return format;
}










