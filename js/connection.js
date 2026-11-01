	var sortIndex = 2;
	var sortDesc = false;
	var rqs=[];
			
	function byId(id) 
	{ 
		return document.getElementById(id);
	}
	function escHtml(value)
	{
		return String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
	}
	function showRequest()
	{
		var s = '<table class="table table-bordered"><thead>';
			s += '<tr >';
			s += '	  <th ><a href=\'javascript:sortrq(1)\'>源地址</a></th>';
			s += '	  <th ><a href=\'javascript:sortrq(2)\'>时间</a></th>';
			s += '	  <th><a href=\'javascript:sortrq(3)\'>状态</a></th>';
			s += '	  <th><a href=\'javascript:sortrq(4)\'>请求</a></th>';
			s += '	  <th><a href=\'javascript:sortrq(5)\'>网址</a></th>';
			s += '	  <th><a href=\'javascript:sortrq(6)\'>目标地址</a></th>';
			s += '	  <th><a href=\'javascript:sortrq(7)\'>referer</a></th>';
			s += '	  <th>HTTP</th>';
			s += '	  <th>Cache</th>';
			s += '</tr></thead>';
		for(var i=0;i<rqs.length;i++){
			s +='<tr>';
			for(var j=1;j<rqs[i].length;j++){
				var cell = escHtml(rqs[i][j]);
				if (j==1) {
					s += '<td >'+cell+'<a href="#" class="js-banip" data-ip="'+cell+'">&nbsp;禁止</a></td>';
				}else{
					s += '<td >'+cell+'</td>';
				}
			}
			s += '</tr>';
		}
		s += '</table>';
		var box = byId('rq');
		box.innerHTML = s;
		jQuery(box).off('click.jsBanip').on('click.jsBanip', '.js-banip', function (e) {
			e.preventDefault();
			banip(jQuery(this).attr('data-ip'));
		});
	}
	function banip(ip)
	{
		if(ip.indexOf(":")>0){
			ip = ip.substr(0,ip.indexOf(":"));
		}
		ep_ajax("?c=banip&a=addBanip&ajax=1", {ip: ip}, {type:'get', reload:'always', sync:false});
	}
	function sortRequest(a,b)
	{
		if (sortIndex==2) {	
			if (sortDesc) {
				return b[sortIndex] - a[sortIndex];
			} else {
				return a[sortIndex] - b[sortIndex];
			}
		}
		if(sortDesc){
			return b[sortIndex].localeCompare(a[sortIndex]);
		}
		return a[sortIndex].localeCompare(b[sortIndex]);
	}
	function sortrq(index)
	{	
		if(sortIndex!=index){
			sortDesc = false;
			sortIndex = index;
		} else {
			sortDesc = !sortDesc;
		}
		rqs.sort(sortRequest);
		showRequest();
	}
