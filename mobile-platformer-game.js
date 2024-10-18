// Create a new Phaser game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Create the game instance
const game = new Phaser.Game(config);

let player;
let platforms;
let cursors;
let enemies;
let bullets;
let score = 0;
let scoreText;
let gameOver = false;

function preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create() {
    // Add background
    this.add.image(400, 300, 'sky');

    // Create platforms
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    // Create player
    player = this.physics.add.sprite(100, 450, 'dude');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    // Player animations
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    // Add collision between player and platforms
    this.physics.add.collider(player, platforms);

    // Create cursor keys
    cursors = this.input.keyboard.createCursorKeys();

    // Create enemies
    enemies = this.physics.add.group();
    createEnemy(this, 200, 0);
    createEnemy(this, 600, 0);

    // Create bullets
    bullets = this.physics.add.group();

    // Add collision between enemies and platforms
    this.physics.add.collider(enemies, platforms);

    // Add overlap between player and bullets
    this.physics.add.overlap(player, bullets, hitPlayer, null, this);

    // Add score text
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

    // Add game over text
    gameOverText = this.add.text(400, 300, 'Game Over', { fontSize: '64px', fill: '#000' });
    gameOverText.setOrigin(0.5);
    gameOverText.visible = false;
}

function update() {
    if (gameOver) {
        return;
    }

    // Player movement
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    // Player jump
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }

    // Double jump
    if (cursors.up.isDown && !player.body.touching.down && player.canDoubleJump) {
        player.setVelocityY(-330);
        player.canDoubleJump = false;
    }

    // Reset double jump when player touches the ground
    if (player.body.touching.down) {
        player.canDoubleJump = true;
    }

    // Enemy shooting
    enemies.children.entries.forEach((enemy) => {
        if (Phaser.Math.Between(1, 100) === 1) {
            shoot(enemy, this);
        }
    });
}

function createEnemy(scene, x, y) {
    const enemy = enemies.create(x, y, 'bomb');
    enemy.setBounce(1);
    enemy.setCollideWorldBounds(true);
    enemy.setVelocity(Phaser.Math.Between(-200, 200), 20);
}

function shoot(enemy, scene) {
    const bullet = bullets.create(enemy.x, enemy.y, 'star');
    scene.physics.moveToObject(bullet, player, 200);
}

function hitPlayer(player, bullet) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
    gameOverText.visible = true;
}
