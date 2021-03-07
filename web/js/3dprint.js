/* 3dprint_game/js/3dprint.js */

$(document).ready(function() {
	if (typeof(Storage) !== "undefined") {
		$(".main").html("Sorry! No Web Storage support. You need a more recent browser.");
		return;
	}

	$("#data_money") = 1000;

});
