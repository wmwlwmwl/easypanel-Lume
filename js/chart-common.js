// 图表公共配置与单位格式化（Highcharts 页面共用）
var epChartTheme = {
	colors: ['#2563eb', '#f59e0b', '#16a34a', '#dc2626', '#8b5cf6', '#0891b2'],
	chart: { backgroundColor: 'transparent', style: { fontFamily: 'inherit' } },
	title: { style: { color: '#1f2937', fontSize: '15px', fontWeight: '600' } },
	xAxis: { labels: { style: { color: '#6b7280', fontSize: '11px' } }, lineColor: '#e5e9f2', tickColor: '#e5e9f2' },
	yAxis: { labels: { style: { color: '#6b7280', fontSize: '11px' } }, gridLineColor: '#eef2f9', title: { style: { color: '#6b7280', fontSize: '12px' } } },
	legend: { itemStyle: { color: '#6b7280', fontSize: '12px', fontWeight: 'normal' } },
	credits: { enabled: false },
	global: { useUTC: false }
};

function epChartSetup() {
	Highcharts.setOptions(epChartTheme);
}

// 按 1024 进制换算并保留两位小数；threshold 与 units 对应原各页阈值
function epFormatBytes(size, opts) {
	opts = opts || {};
	var threshold = opts.threshold === undefined ? 10 : opts.threshold;
	var units = opts.units || [' Bytes', ' KB', ' MB', ' GB'];
	var i = 0;
	while (i < units.length - 1 && size / 1024 > threshold) {
		size = size / 1024;
		i++;
	}
	return size.toFixed(2) + units[i];
}
