$(function() {
	$('.chosen-select').chosen({
		no_results_text: "没有找到结果！", //搜索无结果时显示的提示
		search_contains: true, //关键字模糊搜索，设置为false，则只从开头开始匹配
		allow_single_deselect: true, //是否允许取消选择
		max_selected_options: 6 //当select为多选时，最多选择个数
	});
});