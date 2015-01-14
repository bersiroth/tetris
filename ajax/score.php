<?php 

session_start();
if (!isset($_COOKIE['token']) || !isset($_POST['token']) || $_COOKIE['token'] != $_POST['token'] || $_SERVER['HTTP_REFERER'] != 'http://bernard-caron.fr/') {
    die('Erreur connexion'); 
}

if ($_SERVER['HTTP_REFERER'] == 'http://bernard-caron.fr/') {
    $dsn = 'mysql:dbname=bernardcabcaron;host=mysql51-117.perso';
    $user = 'bernardcabcaron';
    $password = 'RK5SDGM3XuvR';
} else {
    $dsn = 'mysql:dbname=bernardcabcaron;host=localhost';
    $user = 'bernardcabcaron';
    $password = 'RK5SDGM3XuvR';
}

$query = "INSERT INTO  `score` (`id` ,`pseudo` ,`score` ,`level` ,`difficulte` ,`date`)
          VALUES (NULL ,'" . mysql_real_escape_string($_POST["pseudo"]) . "',  '" . mysql_real_escape_string($_POST["score"]) . "',  '1',  'facile',  now());";

try {
    $dbh = new PDO($dsn, $user, $password);
    $dbh->query($query);
} catch (PDOException $e) {
    echo 'Connexion échouée : ' . $e->getMessage();
}

?>