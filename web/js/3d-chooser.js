/* 3dprint_game/js/3d-chooser.js */

var chooser = function (headline, choices, current_value, callback) {
	var choose_head = $('.chooser .header')
	var choose_body = $('.chooser .body');

	var hide_chooser = function () {
		choose_head.text("[headline]");
		$("#chooser_selector").remove();
		$('.chooser .button').off('click');
		$('.chooser').hide();
	}

	// clear previous use of chooser before reusing it
	hide_chooser();

	$('.chooser').show();
	choose_head.text(headline);
	var selector = $('<select>')
		.attr("id", "chooser_selector")
		.appendTo(choose_body);

	Object.keys(choices).forEach(function(optionText){
		var optionValue = choices[optionText];
		var opt = $('<option>')
			.val(optionValue)
			.text(optionText)
			.appendTo(selector);
		if (optionValue == current_value) {
			opt.attr("selected", "selected");
		}
	});

	$('.chooser #ok').click(function(){
		var chosen_option = selector.find("option:selected");
		var text  = chosen_option.text();
		var value = chosen_option.val();

		callback(value, text);
		hide_chooser();
	});

	$('.chooser #cancel').click(function(){
		hide_chooser();
	});
}
