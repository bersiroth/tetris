<?php 

require_once '../config.php';

$dsn = 'mysql:dbname=' . DBNAME . ';host=' . HOST;
$user = USER;
$password = PASSWORD;

$query = "select * FROM `score` order by score desc limit 0,10;";

try {
    $dbh = new PDO($dsn, $user, $password);
    $res = $dbh->query($query);
    echo json_encode($res->fetchAll(PDO::FETCH_ASSOC));
} catch (PDOException $e) {
    echo 'Connexion échouée : ' . $e->getMessage();
}

?>