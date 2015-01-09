$(document).ready(function () {
    
    // SPEC
    //
    // Score : 
    // Taille grille :
    // Vitesse : Au niveau 0 on peut faire 5-6 déplacements latéraux avant que la pièce tombe d'un rang, au niveau 9 on ne peut plus faire que 1-2 mouvements latéraux
    // Couleur : 47FFFF = cyan (S), 0000FF = blue(O), FFFF00 = yellow(J), 00FF00 = green(T), 8601FF = violet(L), FF7F00 = orange(Z), FF0000 = red (I)
    //
    // TODO 
    //
    // calculer si la vitesse est bien egal au spec
    // fonction pause (touche dans le tableau KEY
    // Augmentation de la dificulte
    // Ajouter un bouton pour lancer le jeu et un pour relancer
    // Ajout d'un tableau des scores (fonction popup pour demande le pseudo + enregistrement en base) AJAX ? 
    // Recoder la prise en charge du tactile 
    // Recoder la grille sans 0 pour ne pas faire de -1 a chaque fois                 
    // Recoder la fonction getNbLineForUp
    // Menage dans les variables
    // Affichage de la zone de drop
    // Menu d'option (taille de la grille, difficulte, couleur)
    // Mode tactile avec touche ou appuyer
    // Mode multijoueur local ccoperation
    // Mode multijoueur local competition
    // Mode multijoueur online competition
    // Mode multijoueur online competition
    //
    // BUG
    // 

    // exemple :
    // 
    // 2 6 4 0
    // ^ ^ ^ ^
    // 0 0 0 0 | 8
    // 0 1 1 0 | 4
    // 1 1 0 0 | 2
    // 0 0 0 0 | 1

    // Ordre des blocks haut, droite, bas , gauche
    var I = {color: '#FF0000', blocks: ['4444', '00F0', '2222', '0F00'], direction : 0};
    var J = {color: '#FFFF00', blocks: ['2E00', 'C440', '0E80', '4460'], direction : 0};
    var O = {color: '#0000FF', blocks: ['CC00', 'CC00', 'CC00', 'CC00'], direction : 0};
    var L = {color: '#8601FF', blocks: ['0E20', '6440', '8E00', '44C0'], direction : 0};
    var S = {color: '#47FFFF', blocks: ['2640', 'C600', '4C80', '0C60'], direction : 0};
    var T = {color: '#00FF00', blocks: ['4640', '4E00', '4C40', '0E40'], direction : 0};
    var Z = {color: '#FF7F00', blocks: ['4620', '6C00', '8C40', '06C0'], direction : 0};

    document.addEventListener('keydown', keydown, false);
    document.addEventListener('keyup', keyup, false);
    
    var KEY = {ESC: 27, SPACE: 32, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40};
    var canvas = document.getElementById("canvas");
    var canvasNext = document.getElementById("next-piece-canvas");
    var ctx = canvas.getContext("2d");
    var ctxNext = canvasNext.getContext("2d");
    ctx.lineWidth = 1;
    ctxNext.lineWidth = 1;
    var pieceList = [I, J, O, L, S, T, Z];                  // la liste de pieces
    var largeurEcran;                                       // en px
    var hauteurEcran;                                       // en px
    var hauteurBlock;
    var longueurPiece = 4;                                  // en nombre de block
    var grid = "";                                          // un tableau a deux dimension representant la grille de jeu
    var largeurGrid = 10-1;                                 // en nombre de case
    var hauteurGrid = 22-1;                                 // en nombre de case
    var speed = false;
    var multiplicateurVitesse = 30;
    var x = (largeurEcran/2)-(2*hauteurBlock), y = 0;
    var piece = '';
    var nextPiece;
    var score = 0;
    var line = 0;
    var level = 0;
    var pause = false;

    // Lance le jeu
    function startGame(){
        initCanvas();
        majScore(0);
        initGrid();
        newPiece();
    } 

    // Initialise le canvas en fonction de la taille de l'ecran 
    function initCanvas() {
        var height = screen.height * 0.6;
        
        hauteurBlock = Math.floor(height / (hauteurGrid+1));
        console.log('hauteurBlock ' + hauteurBlock);
        
        var width = hauteurBlock * (largeurGrid + 1);
        canvas.width = width; 
        largeurEcran = width;    
        $("#canvas").css('width', width + 'px');

        var height = hauteurBlock * (hauteurGrid + 1);
        canvas.height = height;   
        hauteurEcran = height;
        $("#canvas").css('height', height + 'px');
        
        canvasNext.width    =  parseInt($("#score-jeu").css('width')); 
        canvasNext.height   = parseInt($("#score-jeu").css('height')); 
    }

    // Initialise la grille de jeu
    function initGrid() {
        grid = new Array();
        for (var a = 0; a <= largeurGrid; a++) {
            grid[a] = new Array();
            for (var b = 0; b <= hauteurGrid; b++) {
                grid[a][b] = '';
            }
        }
    }

    // Selectionne aleatoirement une piece
    function getRandomPiece(){
        var random = Math.floor(Math.random() * pieceList.length);
        return pieceList[random];
    }

    // Transforme un nombre decimale en binaire
    function decToBin(dec,length){
        var str = Number(dec).toString(2);
        var pad = "";
        for(var z=0; z < length; z++){
            pad = pad + "0";
        }
        return pad.substring(0, pad.length - str.length) + str;
    }

    // Converti des coordonne en case de la grille
    function getCase(x,y) {
        return {x: Math.round(x/hauteurBlock),y: Math.round(y/hauteurBlock)};
    }

    // Dessine une piece si toutes les cases sont libre
    function drawPiece(ctx, x, y, piece) {
        if (isEmptyPiece(x, y, piece)) {
            eachBlocksFromPiece(x, y, piece, function(x,y){
                if (isEmptyBlock(x,y)) {
                    drawBlock(ctx, x, y, piece.color);
                }
            });
            return true;
        } else {
            return false;
        }
    }

    // Dessine un block
    function drawBlock(ctx, x, y, color, redraw) {
        if (isEmptyBlock(x, y) || redraw == true) {
            ctx.fillStyle=color;
            ctx.fillRect(x, y, hauteurBlock, hauteurBlock);
            ctx.strokeRect(x, y, hauteurBlock, hauteurBlock);
            return true;
        } else {
            return false;
        }
    }

    // Test si une case est libre
    function isEmptyBlock(x,y){
        var gridCase = getCase(x,y);
        if (gridCase.x > largeurGrid || gridCase.y > hauteurGrid || gridCase.x < 0) {
            return false;
        } else {
            return (grid[gridCase.x][gridCase.y] != '') ? false : true;
        }
    }

    // Test les cases sont libre pour une piece
    function isEmptyPiece(x, y, piece, direction){
        var result = true;
        if( typeof(direction) == 'undefined' ){
            direction = piece.direction;
        }
        eachBlocksFromPiece(x, y, piece, function(x,y){
            if (!isEmptyBlock(x,y)) {
                result = false;
            }
        }, direction);
        return result;
    }

    // Boucle sur les blocks d'une piece et retour un tableau avec les coordonnees des blocks d'une piece
    function eachBlocksFromPiece(x, y, piece, fn, direction){
        if( typeof(direction) == 'undefined' ){
            direction = piece.direction;
        }
        var bin, nbBlock = 0;
        for (var a=0; a < piece.blocks[direction].length; a++){
            bin = decToBin( parseInt( piece.blocks[direction][a], 16 ),longueurPiece);
            for (var e=0; e < bin.length; e++){
                if ( bin[e] != '0' ) {
                    nbBlock++;
                    fn(x + (a * hauteurBlock), y + (e * hauteurBlock));
                    if (nbBlock == longueurPiece){
                        return;
                    }
                }
            }
        }
    }

    // efface toutes les cases de la grille qui sont libre
    function clearGrid(){
        ctx.clearRect(-1, -1, largeurEcran + 2, hauteurEcran + 2);
        for (var a = 0; a < grid.length; a++) {
            for (var b = 0; b < grid[a].length; b++) {
                if (grid[a][b] != '') {
                    drawBlock(ctx, a * hauteurBlock, b * hauteurBlock, grid[a][b], true);
                }
            }
        }
    }

    // Creation d'un nouvelle piece
    function newPiece() {
        if (piece == ''){
            piece = getRandomPiece();
            nextPiece = getRandomPiece();
            drawPiece(ctxNext, (canvasNext.width / 4) , (canvasNext.height / 4) , nextPiece);
        } else {
            piece = nextPiece;
            nextPiece = getRandomPiece();
            ctxNext.clearRect(-1, -1, canvasNext.width + 2, canvasNext.height + 2);
            drawPiece(ctxNext, (canvasNext.width / 4) , (canvasNext.height / 4) , nextPiece);
        }
        var i = 0;
        var gridCase;
        x = (((largeurGrid+1)/2)-2) * hauteurBlock, y = 0;
        deleteLine();
        var down = setInterval(function () {
            if(pause == false) {
                if (i == 0 || i%multiplicateurVitesse == 0 || speed == true) {
                    if (i != 0) {
                        y += hauteurBlock;
                    }
                    if (isEmptyPiece(x,y,piece)) {
                        clearGrid();
                        drawPiece(ctx,x,y,piece);
                    } else {
                        eachBlocksFromPiece(x, y-hauteurBlock, piece, function(x,y){
                            gridCase = getCase(x,y);
                            grid[gridCase.x][gridCase.y] = piece.color;
                        });
                        clearInterval(down);
                        if (i != 0) {
                            newPiece();
                        } else {
                            drawPiece(ctx,x,y,piece);
                            alert('GAME OVER. Score : ' + score);
                        }
                    } 
                    i++;
                    speed = false;
                } else {
                    i++;
                }
            }
        }, (multiplicateurVitesse  - (level * 3 )));
    }

    // efface toutes les cases de la grille qui sont libre
    function changeDirection(piece) {
        var direction;
        direction = (piece.direction + 1 == 4) ? 0 : piece.direction + 1;
        if(isEmptyPiece(x, y, piece, direction)) {
            piece.direction = direction;
            clearGrid();
            drawPiece(ctx,x,y,piece);
        }
    }

    // efface toutes les cases de la grille qui sont libre
    function deleteLine(){
        var lineDelete,a,b,f,z,c,nbLine=0;
        for (a = hauteurGrid ; a > 0 ; a-- ){
            lineDelete = true;
            for (b = 0 ; b <= largeurGrid ; b++ ){
                if (grid[b][a] == '') {
                    lineDelete = false;
                    break;
                }
            }
            if (lineDelete == true) {
                line++;
                nbLine++;
                for (f = 0 ; f <= largeurGrid ; f++){
                    grid[f][a] = '';
                }
                for (z = 0; z < grid.length; z++) {
                    for (c = hauteurGrid; c > 0; c--) {
                        if (c < a) {
                            grid[z][c+1] = grid[z][c];
                        }
                    }
                }
                a++;
            }
        }
        switch(nbLine) {
            case 0:
                break;
            case 1:
                majScore(40*(level+1));
                break;
            case 2:
                majScore(100*(level+1));
                break;
            case 3:
                majScore(300*(level+1));
                break;
            case 4:
                majScore(1200*(level+1));
                break;
        }

    }

    // Gestion des touches du clavier
    function keydown(ev) {
        switch (ev.keyCode) {
            case KEY.LEFT:
                if (isEmptyPiece(x - hauteurBlock,y,piece)) {
                    x -= hauteurBlock;
                    clearGrid();
                    drawPiece(ctx,x,y,piece);
                }
                break;
            case KEY.RIGHT:
                if (isEmptyPiece(x + hauteurBlock,y,piece)) {
                    x += hauteurBlock;
                    clearGrid();
                    drawPiece(ctx,x,y,piece);
                }
                break;
            case KEY.DOWN:
                speed = true;
                break;
            case 80:
                if (pause){
                    pause = false;
                    $("#titre").html('Tetris HTML');
                } else {
                    pause = true ;
                    $("#titre").html('Tetris HTML (PAUSE)');
                }
                break;
        }
    }
    
    // Gestion des touches du clavier
    function keyup(ev) {
        switch (ev.keyCode) {
            case KEY.UP:
                changeDirection(piece);
                break;
        }
    }

    var ancien = 0;
    var ancien2 = 0;
    
    // efface toutes les cases de la grille qui sont libre
    function getNbLineForUp() {
        var nb = ((level*10)+10);
        if (nb != ancien2){
            ancien2 = nb;
            nb = nb + ancien;
            ancien = nb;
        }
        return ancien;
    }

    // efface toutes les cases de la grille qui sont libre
    function majScore(newScore){
        score = score + newScore;
        var nbLine4Up = getNbLineForUp();
        if (line >= nbLine4Up) {
            level++;
            nbLine4Up = getNbLineForUp();
        }
        $("#score-jeu").html(
                "<h2>Score :  " + score + "</h2>" +
                "<h2>Ligne :  " + line + "</h2>"  +
                "<h2>Level :  " + level + "</h2>" +
                "<h2>Next :  " + (nbLine4Up - line) + "</h2>"
        );

    }

    var testB=0;
    var testD=0;
    var debutDoigt;
    var finDoigt;
    var debutDoigtY;
    var finDoigtY;
    var dateDebut;
    var testDate = false;
    var lastEnd;

    document.body.addEventListener('touchstart', function(event) {
                                            event.preventDefault(); 
                                            debutDoigt = event.changedTouches[0].clientX;
                                            debutDoigtY = event.changedTouches[0].clientY;
                                            dateDebut = new Date().getTime();
                                        }, false); 
    document.body.addEventListener('touchmove',tactile,false); 
    document.body.addEventListener('touchend', function(event) { 
                                            event.preventDefault(); 
//                                            console.log('current : ' + new Date().getTime());
//                                            console.log('end : ' + lastEnd);
//                                            console.log('diff : ' + (new Date().getTime() - lastEnd));
//                                            console.log('--------------');
                                            if ((new Date().getTime() - lastEnd) < 200) {
                                                changeDirection(piece);
                                            }
                                            lastEnd = new Date().getTime();
                                        }, false); 

    // efface toutes les cases de la grille qui sont libre
    function tactile(event) { 
        event.preventDefault(); 
        var newD, bouge1, bouge2;
        finDoigt = event.changedTouches[0].clientX;
        newD = Math.floor((finDoigt - debutDoigt) / (hauteurBlock));
        finDoigtY = event.changedTouches[0].clientY;

        console.log('debug : debutDoigt ' + debutDoigt + ' finDoigt : ' + finDoigt + ' debutDoigtY ' + debutDoigtY+ ' finDoigtY ' + finDoigtY);

        if (testDate != dateDebut) {
            testDate = dateDebut;
            testB = 0;
            testD = 0;
        }

        if ((finDoigt - debutDoigt) > (finDoigtY - debutDoigtY)) {
            bouge1 = newD - testB;
            testB = testB + bouge1;
            if (bouge1 > 0) {
                for (i = 0; i < bouge1; i++) {
                    if (isEmptyPiece(x + hauteurBlock, y, piece)) {
                        x += hauteurBlock;
                        clearGrid();
                        drawPiece(ctx, x, y, piece);
                    }
                }
                debutDoigtY = finDoigtY;
                debutDoigt = finDoigt;
            }
        } else if ((debutDoigt - finDoigt) > (finDoigtY - debutDoigtY)) {
            bouge2 = newD - testD;
            testD = testD + bouge2;
            if (bouge2 < 0) {
                for (i = bouge2; i < 0; i++) {
                    if (isEmptyPiece(x - hauteurBlock, y, piece)) {
                        x -= hauteurBlock;
                        clearGrid();
                        drawPiece(ctx, x, y, piece);
                    }
                }
                debutDoigtY = finDoigtY;
                debutDoigt = finDoigt;
            }
        } else {
            if (debutDoigtY < finDoigtY) {
//                if ((finDoigtY > debutDoigtY && finDoigt - 40 < debutDoigt) || (finDoigtY > debutDoigtY && finDoigt + 40 > debutDoigt))
                    speed = true;
            }
        }
    }
    
    startGame();
});