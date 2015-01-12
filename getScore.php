<?php 

//var_dump($_POST);

//$dsn = 'mysql:dbname=bernardcabcaron;host=mysql51-117.perso';
//$user = 'bernardcabcaron';
//$password = 'RK5SDGM3XuvR';

$dsn = 'mysql:dbname=tetris;host=localhost';
$user = 'root';
$password = '';

$query = "select * FROM `tetris`.`score` order by date limit 0,10;";

//die('ok');
try {
    $dbh = new PDO($dsn, $user, $password);
    $res = $dbh->query($query);
    echo json_encode($res->fetchAll(PDO::FETCH_ASSOC));
} catch (PDOException $e) {
    echo 'Connexion échouée : ' . $e->getMessage();
}

?>