import 'phaser';
import config from './config';
import miJuego from './Scenes/miJuego';
import Menu from './Scenes/menu';

class Game extends Phaser.Game {
constructor () {
super(config);
// Cargamos las escenas
this.scene.add('Game', miJuego);
this.scene.add('Menu', Menu);
// Nos dirigimos al menú
this.scene.start('Menu');
}
}
// Y empezamos
window.game = new Game();