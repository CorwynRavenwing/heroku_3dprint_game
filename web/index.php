<html>
<head>
<link rel="stylesheet" href="css/main.css">
<title>3d Print Game</title>
</head>
<body>
<div class="outer">
	<div class="leftbar">
		Left Bar
	</div>
	<div class="main">
<?php
$Blocks = 20;
for($x = 0; $x <= $Blocks; $x++) {
	echo "
	<div class='block' id='block_{$x}'>
		(block {$x})
	</div>
	";
} # next Blocks
?>
	</div>
</div>
</body>
</html>