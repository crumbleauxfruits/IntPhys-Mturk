<?php
$f = fopen("code.txt","r");
$code = fread($f, filesize("code.txt"));
fclose($f); 

echo $code;
?>
