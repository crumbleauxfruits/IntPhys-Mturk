<?php
$dir = 'results';

// create new directory with 744 permissions if it does not exist yet
// owner will be the user/group the PHP script is run under (usually
// www-data on Debian).
if ( !file_exists($dir) )
{
    $oldmask = umask(0);  // helpful when used in linux server
    mkdir ($dir, 0774);
}

$file = $dir . '/run_' . date('Y-m-d-H-i-s') . '.txt';
file_put_contents ($file, $_POST["results"], FILE_APPEND | LOCK_EX);

?>
