//hi mom!

var config = {
    type: Phaser.AUTO,
	width: 96,
	height: 96,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 48 }
		}
	},
	pixelArt: true,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

/** @this {Phaser.Game} */
function preload ()
{
    canvas = document.querySelectorAll("canvas")[0];
    canvas.className = "main";
    this.load.setBaseURL("../assets")
    this.load.image('background', 'background.png');
    this.load.image('star', 'star.png')
    this.load.spritesheet('rocket', 'rocket.png', {
        frameWidth: 16,
        frameHeight: 16});
    this.load.spritesheet('ground', 'ground.png', {
        frameWidth: 16,
        frameHeight: 16});
    this.load.spritesheet("player", "player.png", {
        frameWidth: 16,
        frameHeight: 16});
    this.load.spritesheet("enemy1", "enemy1.png", {
        frameWidth: 16,
        frameHeight: 16});
    this.load.spritesheet("block", "block.png", {
        frameHeight: 8,
        frameWidth: 8})
}

/** @this {Phaser.Scene} */
function create ()
{
    //enable physics
    this.physics.resume()

    //make map
    map = this.make.tilemap({key: 'map'});
    

    //controls
    arrowKey = this.input.keyboard?.createCursorKeys();
    space = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    shift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    //draw background
    let bg = this.physics.add.sprite(0, 0, "background");
    bg.body.setMaxVelocityY(0);
    bg.body.setMaxVelocityX(0);
    bg.setScrollFactor(0);
    bg.scale = .03;
    bg.setOrigin(0, 0);
    /** @type {Phaser.GameObjects.Sprite} */
    player = this.physics.add.sprite(1*16, 16, "player");
    player.setOrigin(.5, 0);
    player.setSize(8, 16, true);

    let platforms = this.physics.add.staticGroup();
    platforms.setOrigin(0,0);
    tileswide = 511;
    //draw ground
    for (let i = 0; i < tileswide; i++) {
        platforms.create(8+16*i, 96, 'ground')
    }
    //co-oridinates of platform blocks to be placed in a loop.
    platCoords = [
        [0,0],[0,1],[0,2],[0,3],[0,4],[0,5],
        [0,6],[0,7],[0,8],[0,9],[0,10],[0,11],
        [0,12],[5,2],[5,3],[9,2],[9,3],[9,4],[9,5],
        [12,2],[12,3],[12,4],[9,9],[16,2],[17,2],
        [17,3],[18,2],[18,3],[19,2],[19,3],[20,2],
        [20,3],[21,2],[21,3],[22,2],[22,3],[23,2],
        [23,3],[24,2],[24,3],[25,2],[25,3],[26,2],
        [26,3],[27,2],[27,3],[28,2],[28,3],[29,2],
        [16,6],[17,6],[18,6],[19,6],[23,6],[24,6],
        [25,6],[26,6],[27,6],[28,6],[16,7],[17,7],
        [18,7],[19,7],[23,7],[24,7],[25,7],[26,7],
        [27,7],[28,7],[29,7],[17,8],[18,8],[19,8],
        [23,8],[24,8],[25,8],[26,8],[27,8],[28,8],
        [29,8],[17,9],[18,9],[19,9],[20,9],[21,9],
        [22,9],[23,9],[24,9],[25,9],[26,9],[27,9],
        [28,9],[29,9],[18,10],[19,10],[20,10],[21,10],
        [22,10],[23,10],[24,10],[25,10],[26,10],[27,10],
        [28,10],[29,10],[18,11],[19,11],[20,11],[21,11],
        [22,11],[23,11],[24,11],[25,11],[26,11],[27,11],
        [28,11],[29,11],[19,12],[20,12],[21,12],[22,12],
        [23,12],[24,12],[25,12],[26,12],[29,12],[29,13],
        [29,14],[29,15],[29,16],[33,2],[34,2],[34,3],
        [35,2],[35,3],[36,2],[36,3],[40,2],[40,3],
        [41,2],[41,3],[41,4],[42,2],[42,3],[42,4],
        [42,5],[42,10],[43,2],[43,3],[43,4],[43,5],
        [43,6],[43,7],[43,8],[43,9],[43,10],[33,7],
        [34,7],[35,7],[36,7],[37,7],[38,7],[39,7],
        [40,7],[43,11],[42,11],[41,11],[40,11],[39,11],
        [38,11],[38,10],[37,10],[33,8],[33,9],[33,10],
        [33,11],[33,12],[33,13],[33,14],[44,2],[44,3],
        [44,4],[44,5],[44,6],[44,7],[44,8],[44,9],
        [44,10],[45,2],[45,3],[45,4],[45,5],[45,6],
        [45,7],[45,8],[45,9],[46,2],[46,3],[46,4],
        [46,5],[46,6],[46,7],[46,8],[47,2],[47,3],
        [47,4],[47,5],[47,6],[47,7],[48,2],[48,3],
        [48,4],[48,5],[48,6],[49,2],[49,3],[49,4],
        [49,5],[50,2],[50,3],[50,4],[51,2],[51,3],
        [52,2]
    ];

    let convertPlatXY = function(coord, yflag) {
        let out = coord;
        if (yflag) {out = 12 - out;} //flip coords
        out *= 8; //for 16-pixel tiles
        out -= 4; //to center
        if (yflag) {out += 8;}
        return out;
    }

    //draw platforms
    for (let i = 0; i < platCoords.length; i++) {
        platforms.create(convertPlatXY(platCoords[i][0], false), convertPlatXY(platCoords[i][1], true), "block");
    }

    let star = this.physics.add.group();
    star.create(convertPlatXY(9),5,"star")
    star.create(convertPlatXY(27.5,false),convertPlatXY(12,true),"star")
    let starCount = 0;
    var scoreText;
    scoreText = this.add.text(2, 2, 'Score: ' + starCount, { fontSize: '11px', fill: '#fff' , fontFamily: 'Arial', backgroundColor: 'rgba(0,0,0,0.75)'});
    scoreText.setScrollFactor(0)

    //rocket spawn
    rocket = this.physics.add.group();
    rocket.create(500,2,"rocket")

    //enemy spawn
    enemy1 = this.physics.add.group();
    my_enemy_1 = enemy1.create(75,5,"enemy1");
    my_enemy_1.body.velocity.x = -6;
    setTimeout(() => {
        my_enemy_2 = enemy1.create(convertPlatXY(27,false),convertPlatXY(4,true),"enemy1");
        my_enemy_2.body.velocity.x = -6;
    },8000)
    my_enemy_3 = enemy1.create(convertPlatXY(38,false),convertPlatXY(4,true),"enemy1");
    my_enemy_3.body.velocity.x = -6

    //make floor solid to player
    this.physics.add.collider(player, platforms);
    
    //animation set for player
    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
        frameRate: 2,
        repeat: -1,
    });
    this.anims.create({
        key: 'crouch',
        frames: this.anims.generateFrameNumbers('player', { start: 2, end: 2}),
        frameRate: 2,
        repeat: -1,
    });
    this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNumbers('player', { start: 3, end: 4 }),
        frameRate: 2,
    });
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('player', { start: 5, end: 6 }),
        frameRate: 2,
        repeat: -1,
    });
    this.anims.create({
        key: 'die',
        frames: this.anims.generateFrameNumbers('player', { start: 7, end: 11 }),
        frameRate: 2,
    });

    //code for player to collect stars
    this.physics.add.collider(star, platforms)
    this.physics.add.overlap(star, player, (obj1, obj2) => {
        obj2.disableBody(true, true)
        starCount += 10
        scoreText.setText('Score: '+starCount)
    });

    //animation set for enemy
    this.anims.create({
        key: 'enemy1_walk',
        frames: this.anims.generateFrameNumbers('enemy1', { start: 0, end: 4 }),
        frameRate: 2,
        repeat: -1,
    });
    this.anims.create({
        key: 'enemy1_die',
        frames: this.anims.generateFrameNumbers('enemy1', { start: 5, end: 11 }),
        frameRate: 18,
        repeat: 0,
        hideOnComplete: true
    });

    //code for player to die when touching enemy
    this.physics.add.collider(enemy1, platforms, (enemy1, platforms) => {
        if (platforms.body.touching && enemy1.body.touching.left) {
            enemy1.body.velocity.x = 6;
            enemy1.flipX = true;
        }

        if (enemy1.body.touching.right && platforms.body.touching) {
            enemy1.body.velocity.x = -6;
            enemy1.flipX = false;
        }
    })
    this.physics.add.collider(enemy1, player, (player, enemy1) => {
        if (player.body.touching.down && enemy1.body.touching.up) {
            if (enemy1.body.velocity.x < 0){
                enemy1.body.velocity.x = 0;
                enemy1.anims.play('enemy1_die', true);
            } else {
                enemy1.body.velocity.x = 0;
                enemy1.anims.play('enemy1_die', true);
                enemy1.flipX = true;
            }
            setTimeout(() => {
                enemy1.disableBody(true, true);

                starCount += 1;
                scoreText.setText('Score: '+starCount)

                enemyGone = true
            }, 400);
        } else {
            if (enemy1.body.velocity.x != 0) {
                player.disableBody(true, true);
                new Audio('../assets/death.mp3').play()
                var deathtext_1
                var deathtext_2
                deathtext_1 = this.add.text(25, 36, 'YOU DIED', { fontSize: '11px', fill: '#ff0000', fontFamily: 'Arial Black', backgroundColor: 'rgba(0,0,0,0.75)'});
                deathtext_2 = this.add.text(22, 48, 'Final score: ' + starCount, {fontSize: '10px', fontFamily: 'Arial', backgroundColor:'rgba(0,0,0,0.75)'});
                deathtext_1.setScrollFactor(0)
                deathtext_2.setScrollFactor(0)
            }
        }
    })

    //animation set for rocket
    this.anims.create({
        key: 'fly',
        frames: this.anims.generateFrameNumbers('rocket', { start: 1, end: 7 }),
        frameRate: 5,
        repeat: 0,
        hideOnComplete: true
    });
    this.anims.create({
        key: 'grounded',
        frames: this.anims.generateFrameNumbers('rocket', { start: 0, end: 0 }),
        frameRate: 1,
        repeat: -1
    });

    //code for player to enter rocket
    this.physics.add.collider(rocket, platforms)
    this.physics.add.overlap(player, rocket, (player, rocket) => {
        if (player.body.touching && rocket.body.touching) {
            player.disableBody(true, true);
            rocket.anims.play('fly', true);
            var wintext_1
            var wintext_2
            wintext_1 = this.add.text(25, 36, 'YOU WIN', { fontSize: '11px', fill: '#ffffe0', fontFamily: 'Arial Black', backgroundColor: 'rgba(0,0,0,0.75)'});
            wintext_2 = this.add.text(22, 48, 'Final score: ' + starCount, {fontSize: '10px', fontFamily: 'Arial', backgroundColor:'rgba(0,0,0,0.75)'});};
            wintext_1.setScrollFactor(0)
            wintext_2.setScrollFactor(0)
    
    })
    
    //camera
    this.cameras.main.startFollow(player);
}

/** @this {Phaser.Scene} */
function update ()
{
    let speed = 16;
    
        //right
        if (arrowKey?.right.isDown) {
            player.body.velocity.x = speed;
            if (/*player.body.touching.down &&*/ shift.isDown) {
                player.body.velocity.x = speed * 2.5;
            }
            player.anims.play('walk', true);
            player.flipX = false;
        }
        //left
        else if (arrowKey?.left.isDown) {
            player.body.velocity.x = -speed;
            if (/*player.body.touching.down &&*/ shift.isDown) {
                player.body.velocity.x = -speed * 2.5;
            }
            player.anims.play('walk', true);
            player.flipX = true;
        }
        //default
        else {
            player.body.velocity.x = 0
            player.anims.play('idle', true);
        }
        //fastfall
        if (arrowKey?.down.isDown && player.body.velocity.y < 0) {
            player.body.setMaxVelocityY(24);
            player.body.velocity.y += 2;
        }

        if (player.body.velocity.y == 0) {
            player.body.setMaxVelocityY(100000);
        }
        //crouch
        if (Phaser.Input.Keyboard.DownDuration(arrowKey?.down, Infinity)) {
            player.body.velocity.x = 0;
            player.anims.play('crouch', true);
        }
        //jump
        if ((Phaser.Input.Keyboard.JustDown(arrowKey?.up) || Phaser.Input.Keyboard.JustDown(space)) && player.body.touching.down) {
            player.body.velocity.y = -50;
            player.anims.play('jump', true);
        }

        //enemy animation
        if (Math.abs(my_enemy_1.body.velocity.x) != 0) {
            my_enemy_1.anims.play('enemy1_walk', true)
        }
        if (typeof my_enemy_2 != "undefined"){
            if (Math.abs(my_enemy_2.body.velocity.x) != 0) {
                my_enemy_2.anims.play('enemy1_walk', true)
            }
        }
        if (Math.abs(my_enemy_1.body.velocity.x) != 0) {
            my_enemy_3.anims.play('enemy1_walk', true)
        }

        //camera follows player
        this.cameras.main.setBounds(0, 0, (tileswide-1) * 16, 96);


}
