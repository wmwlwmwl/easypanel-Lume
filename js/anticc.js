function anticc_checkon(val)
{
	var data = 'status=' + val;
	functoin_checkon('?c=anticc&a=anticcCheckOn',data);
}

function anticc_add()
{
	var frequency = $("#frequency").val();
	var mode = $("#mode").val();
	if(frequency == 'diy' || frequency == ''){
		var request = $("#request").val();
		if (request == "") {
			return alert('请求次数不能为空');
		}
		var second = $("#second").val();
		if (second == "") {
			return alert("单位时间不能为空");
		}
	}else{
		var request = frequency.split(',')[0];
		var second = frequency.split(',')[1];
	}
	var whiteip = $("#whiteip").val();
	var whiteurl = $("#whiteurl").val();
	var whiteext = $("#whiteext").val();
	ep_ajax('?c=anticc&a=anticcAdd', {mode:mode, request:request, second:second, whiteip:whiteip, whiteurl:whiteurl, whiteext:whiteext});
}

function anticc_del()
{
	ep_ajax('?c=anticc&a=anticcDel', null, {type:'get', confirm:'确定删除设置吗?'});
}

function isExistOption(id,value) {
	var isExist = false;
	var count = $('#'+id).find('option').length;
	for(var i=0;i<count;i++)
	{
		if($('#'+id).get(0).options[i].value == value)
		{
			isExist = true;
			break;
		}
	}
	return isExist;
}

$(document).ready(function(){
	$("#frequency").change(function(){
		if($(this).val() == 'diy'){
			$("#request_form").css("display","");
			$("#second_form").css("display","");
		}else{
			$("#request_form").css("display","none");
			$("#second_form").css("display","none");
		}
	});
	var request = $("#frequency").attr('data-request');
	var second = $("#frequency").attr('data-second');
	if(request!=''&&second!=''){
		var option = request+','+second;
		if(isExistOption('frequency', option)){
			$("#frequency").val(option);
		}else{
			$("#frequency").val('diy');
		}
		$("#frequency").change();
	}
	var mode = $("#mode").attr('data-mode');
	if(mode!=''){
		if(isExistOption('mode', mode)){
			$("#mode").val(mode);
		}
	}
});
