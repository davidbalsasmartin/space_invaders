import 'phaser';

export default class Menu extends Phaser.Scene {
  constructor (key) {
    super(key);
  }

  preload() {
    // Carga de imágenes
    this.load.image('espaciogo', 'assets/espaciogo.jpg');
    this.load.image('alienFeliz', 'assets/gameOver.png');
  }

  create() {
    // Visualizarlas
    this.add.tileSprite(0, 0, 800, 600, 'espaciogo').setOrigin(0, 0);
    this.add.tileSprite(380, 360, 78, 142,"alienFeliz");

    // Añadir texto
    this.add.text(180, 50, 'Menú Principal', { font: '80px Arial', fill: 'white' });
    this.add.text(190, 140, 'Pulsa la tecla', { font: '50px Arial', fill: 'white' });
    this.add.text(200, 200, '1 para comenzar', { font: '30px Arial', fill: 'white' });

    // Si se pulsa el boton : 1
    this.input.keyboard.once('keyup_ONE', function () {

      // Ir a la escena game
        this.scene.start('Game');

    }, this);

  }
};