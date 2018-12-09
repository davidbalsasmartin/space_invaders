import 'phaser';

 class Nave {
    constructor(physics) {
        this.physics = physics;
    }
}

export default class miJuego extends Phaser.Scene {
  constructor (key) {
    super(key);
    // Jugador
    this.player;
    // Grupo de aliens
    this.aliens;
    // Cada disparo del jugador
    this.miDisparo;
    // Cada disparo del alien
    this.enemigoD;
    // Evento de disparo de aliens
    this.eventoDeTiempo;
    // Variable reguladora del tiempo que tarda el jugador en disparar
    this.bulletTime = 0;
    // Teclado
    this.teclas;
    // Espacio, para el disparo del jugador
    this.teclaD;
    // Fondo de pantalla
    this.espacio;
    // Puntuación
    this.score = 0;
    // Texto de puntuación
    this.scoreText;
    // Vidas restantes del jugador
    this.lives;
    // Texto de las vidas
    this.liveText;
    // Nivel actual
    this.nivel;
    // Texto del nivel
    this.nivelText;
    // Cada imagen de disparo enemigo
    this.tileDisparoEne;
    // Contenedor de aliens
    this.container;
    // Velocidad de movimiento lateral de aliens
    this.speed = 1;
    // Música de fondo
    this.music;
    // Música de explosión de alien
    this.explo;
    // Música de mi explosión
    this.miExplo;
  }

  preload() {
    //Cargar imágenes
    this.load.image('miDisparo', 'assets/proyectil.png');
    this.load.image('tileDisparoEne', 'assets/enemy-bullet.png');
    this.load.spritesheet('ovni', 'assets/alien.png', { frameWidth: 30, frameHeight: 30 });
    this.load.image('nave', 'assets/nave.png');
    this.load.spritesheet('explosion', 'assets/explode.png', { frameWidth: 128, frameHeight: 128 });
    this.load.image('espacio', 'assets/espacio.png');
    this.load.audio('musicaFondo', 'assets/audio/arcade.mp3');
    this.load.audio('explosion', 'assets/audio/explosion.mp3');
    this.load.audio('miExp', 'assets/audio/miExplosion.mp3');
}

create() {

    //configurar bordes del mundo para que tengan colision
    this.physics.world.setBoundsCollision(true, true, true, true);
    // Cargar imágen de fondo
    this.espacio = this.add.tileSprite(0, 0, 800, 600, 'espacio').setOrigin(0, 0);

    //Nave jugador
    this.player = new Nave(this.physics);
    this.player = this.physics.add.image(400, 550, 'nave');
    // Que no caiga y choque con los bordes
    this.player.body.setAllowGravity(false);
    this.player.setCollideWorldBounds(true);

    // Añadir música de fondo en un bucle
    this.music = this.sound.add('musicaFondo');
    this.music.play({
      loop: true
    });


    //animacion horizontal de invasores
    this.anims.create({
        key: 'ondear',
        frames: this.anims.generateFrameNumbers('ovni', { start: 0, end: 4 }),
        frameRate: 5,
        repeat: -1
    });

    //animacion de explosion
    this.anims.create({
        key: 'boom',
        frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 9, first: 0 }),
        hideOnComplete: true,
    });

    this.createAliens.call(this);

    //  Marcador
    this.scoreText = this.add.text(10, 10, 'Score : ' + this.score, { font: '22px Arial', fill: '#fff' });

    //  Vidas
    this.lives = 3;
    this.liveText = this.add.text(250, 10, 'Vidas : ' + this.lives, { font: '22px Arial', fill: '#fff' });

    //  Nivel
    this.nivel = 1
    this.nivelText = this.add.text(500, 10, 'Nivel : ' + this.nivel, { font: '22px Arial', fill: '#fff' });

    // Darle el valor a cada tecla correspondiente
    this.teclas = this.input.keyboard.createCursorKeys();
    this.teclaD = this.input.keyboard.addKey("SPACE");
   

    // LLamar a la función onWorldBounds al salir un objeto de la pantalla
    this.physics.world.on('worldbounds', this.onWorldBounds);

    // Animación de disparo de los aliens
    this.eventoDeTiempo = this.time.addEvent({
        loop: true,
        callback: this.aliensDisparan,
        callbackScope: this,
        delay: 1800
    })

}


aliensDisparan() {
    //Tomamos un alien vivo al azar para que dispare y configuarmos su disparo, que no se rija por la gravedad...
    var randomAlien = this.aliens.getChildren()[Phaser.Math.Between(0, this.aliens.getChildren().length - 1)]
    if (randomAlien) {

        this.enemigoD = this.physics.add.image(randomAlien.x + this.container.x, randomAlien.y + this.container.y, "tileDisparoEne").setCollideWorldBounds(true);
        this.enemigoD.body.setAllowGravity(false);
        this.enemigoD.body.onWorldBounds = true;
        // Da una velocidad al disparo y lo dirige hacia el jugador
        this.physics.moveToObject(this.enemigoD, this.player, 250);

    }
}

onWorldBounds(body) {
    // Destruye el objeto (esta funcion se llama cuando un objeton se sale del mapa)
    var obj = body.gameObject;

    obj.destroy();

}

createAliens() {
    //Se crea un grupo de aliens

    this.aliens = this.physics.add.group({

    });

    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 12; x++) {
            let alien = this.aliens.create(x * 48, y * 50, 'ovni');
            alien.setOrigin(0.5, 0.5);

            alien.anims.play('ondear');
            alien.body.moves = false;
        }
    }

    //Contenedor de aliens para mover a los aliens a la vez
    this.container = this.add.container( 50, 50);
    this.container.add(this.aliens.getChildren());
}

update() {

  // Comprueba la velocidad y el eje x para dar velocidad horizontal (x) y hacer el salto vertical (y)
  // Hasta la velocidad 4.05 varía más rápidamente y después más despacio para que sea jugable

 if ((Math.abs(this.speed) < 4.05) && (this.container.x < 40)) {
    this.speed = -this.speed + 0.06;
    if (this.container.y < 380) {
        // Controlar que no se salgan los aliens del mapa
        this.container.y += 3*this.nivel;
    }
  } else if ((Math.abs(this.speed) < 4.05) && (this.container.x > 230)) {
    this.speed = -this.speed - 0.06;
    if (this.container.y < 380) {
        //Controlar que no se salgan los aliens del mapa
        this.container.y += 3*this.nivel;
    }
  } else if ((this.container.x < 40) || (this.container.x > 230)) {
    this.speed = -this.speed;
    if (this.container.y < 380) {
        this.container.y += (this.nivel * 1.02) + 8;
    } else {
        // Controlar que no se salgan los aliens del mapa, pero sumándole algo de valor a y
        this.container.y += 4;
        
    }
  }
    // Mueve el contenedor de aliens horizontalmente 
    this.container.x += this.speed;

    // Mover el Fondo 
    this.espacio.tilePositionY += 1;

    //  Pone el jugador en su posición inicial
    this.player.body.velocity.setTo(0, 0);
    // Mueve al jugador
    if (this.teclas.left.isDown) {
        this.player.body.velocity.x = -200;

    } else if (this.teclas.right.isDown) {
        this.player.body.velocity.x = 200;
    }

    // Dispara
    if (this.teclaD.isDown) {
        this.fireBullet.call(this);
    }

    // Chequea las colisiones
    if (this.miDisparo && this.enemigoD) {
        this.physics.add.overlap(this.miDisparo, this.aliens, this.BalaJugadorVSAlien, null, this);
        this.physics.add.overlap(this.player, this.enemigoD, this.BalaAlienVSJugador, null, this);
    } else if (this.enemigoD) {
        this.physics.add.overlap(this.player, this.enemigoD, this.BalaAlienVSJugador, null, this);
    } else if (this.miDisparo) {
        this.physics.add.overlap(this.miDisparo, this.aliens, this.BalaJugadorVSAlien, null, this);
    }

     this.physics.add.overlap(this.player, this.aliens, this.AlienVSJugador, null, this);

}

// Colisiona un alien con el jugador
AlienVSJugador(player, alien) {
    // Destruye el alien y escuchar y ver explosión
    alien.destroy();
    this.add.sprite(player.x, player.y, "explosion").play("boom");
    this.miExplo = this.sound.add('miExp');
    this.miExplo.play();
    if (this.lives == 0) {
        // Si ha muerto, volver a iniciar la escena completa
        this.score = 0;
        this.speed = 1;
        this.music.stop();
        this.scene.restart();
    } else if (this.aliens.getChildren().length == 0) {
        // Si han muerto todos los aliens y el jugador sigue vivo
        // Volver a situar enemigos, restar una vida y añadir un nivel
        this.lives--;
        this.liveText.text = 'Vidas : ' + this.lives;
        this.createAliens();
        this.nivel++;
        this.nivelText.text = 'Nivel : ' + this.nivel;
        // Crear un disparo enemigo más con cada nivel
        this.eventoDeTiempo2 = this.time.addEvent({
        loop: true,
        callback: this.aliensDisparan,
        callbackScope: this,
        delay: 1800
        });
    } else {
        // Si el jugador sigue vivo y quedan aliens, restar vida
        this.lives--;
        this.liveText.text = 'Vidas : ' + this.lives;
    }
}

// Si una bala del jugador colisiona con el alien
BalaJugadorVSAlien(miDisparo, alien) {
    // Destruir este alien y bala y añadir puntos y escuchar y ver explosión
    alien.destroy();
    miDisparo.destroy();
    this.score += 20;
    this.scoreText.text = 'Score : ' + this.score;
    this.add.sprite(alien.x + this.container.x, alien.y + this.container.y, "explosion").play("boom");
    this.explo = this.sound.add('explosion');
    this.explo.play();
    // Si no quedan aliens
    if (this.aliens.getChildren().length == 0) {
        // Volver a situar enemigos y añadir un nivel
        this.createAliens();
        this.nivel++;
        this.nivelText.text = 'Nivel : ' + this.nivel;
        // Crear un disparo enemigo más con cada nivel, si este es par
        if (!(this.nivel%2)) {
        	this.eventoDeTiempo2 = this.time.addEvent({
        	loop: true,
        	callback: this.aliensDisparan,
        	callbackScope: this,
        	delay: 1800
        	});
    	}
    }
}

// Si una bala de alien colisiona con un jugador
BalaAlienVSJugador(player, enemigoD) {
    // Destruir disparo enemigo y escuchar y ver explosión
    enemigoD.destroy();
    this.add.sprite(player.x, player.y, "explosion").play("boom");
    this.miExplo = this.sound.add('miExp');
    this.miExplo.play();
    // Si no quedan vidas reiniciar juego
    if (this.lives == 0) {
        this.score = 0;
        this.speed = 1;
        this.music.stop();
        this.scene.restart();
    // Si quedan vidas, solo restar una
    } else {
      this.lives--;
      this.liveText.text = 'Vidas : ' + this.lives;
    }
}

// Disparos del jugador
fireBullet() {
  // controlar que no se dispare demasiado seguido y configurar la gravedad, colision con el entorno, etc.
    if (game.scene.scenes[0].sys.time.now > this.bulletTime) {

        this.miDisparo = this.physics.add.image(this.player.x, this.player.y - 25, 'miDisparo').setVelocity(0, -400).setCollideWorldBounds(true);
        this.miDisparo.body.onWorldBounds = true;
        this.miDisparo.body.setAllowGravity(false);
        this.bulletTime = game.scene.scenes[0].sys.time.now + 360;
    }
}
};