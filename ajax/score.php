<?php 

session_start();
if (!isset($_COOKIE['token']) || !isset($_POST['token']) || $_COOKIE['token'] != $_POST['token'] || $_SERVER['HTTP_REFERER'] != REFERER) {
    die('Erreur connexion'); 
}

require_once '../config.php';

$dsn = 'mysql:dbname=' . DBNAME . ';host=' . HOST;
$user = USER;
$password = PASSWORD;


$query = "INSERT INTO  `score` (`id` ,`pseudo` ,`score` ,`level` ,`difficulte` ,`date`)
          VALUES (NULL ,'" . mysql_real_escape_string($_POST["pseudo"]) . "',  '" . mysql_real_escape_string($_POST["score"]) . "',  '1',  'facile',  now());";

try {
    $dbh = new PDO($dsn, $user, $password);
    $dbh->query($query);
} catch (PDOException $e) {
    echo 'Connexion échouée : ' . $e->getMessage();
}

?>