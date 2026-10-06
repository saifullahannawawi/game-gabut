import Phaser from 'phaser';
import { FONT, GAME_WIDTH, getHighScore } from '../config';
import { StarField } from './Background';

export class MenuScene extends Phaser.Scene {
  private bg!: StarField;

  constructor() {
    super('Menu');
  }

  create() {
    this.bg = new StarField(this);
    const cx = GAME_WIDTH / 2;

    this.add
      .text(cx, 130, 'GAME', { fontFamily: FONT, fontSize: '64px', color: '#38bdf8', fontStyle: 'bold' })
      .setOrigin(0.5)
      .setStroke('#0f172a', 8);
    this.add
      .text(cx, 195, 'IPOOOOEL', { fontFamily: FONT, fontSize: '44px', color: '#fde047', fontStyle: 'bold' })
      .setOrigin(0.5)
      .setStroke('#0f172a', 8);

    const player = this.add.image(cx, 300, 'player').setScale(1.4);
    this.tweens.add({ targets: player, y: 285, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    const legend: [string, string][] = [
      ['star', 'Bintang  +10'],
      ['gem', 'Permata  +25'],
      ['heart', 'Hati  +1 nyawa'],
      ['rock', 'watu  -1 nyawa'],
      ['bomb', 'Bom  -1 nyawa'],
    ];
    legend.forEach(([key, label], i) => {
      const y = 380 + i * 42;
      this.add.image(cx - 90, y, key).setScale(0.7);
      this.add.text(cx - 60, y, label, { fontFamily: FONT, fontSize: '20px', color: '#e2e8f0' }).setOrigin(0, 0.5);
    });

    this.add
      .text(cx, 600, `High Score: ${getHighScore()}`, { fontFamily: FONT, fontSize: '22px', color: '#f472b6', fontStyle: 'bold' })
      .setOrigin(0.5);

    const start = this.add
      .text(cx, 655, '▶  PENCETEN BOLOOO / SPASI', { fontFamily: FONT, fontSize: '22px', color: '#ffffff', fontStyle: 'bold' })
      .setOrigin(0.5);
    this.tweens.add({ targets: start, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });

    const go = () => this.scene.start('Game');
    this.input.keyboard?.once('keydown-SPACE', go);
    this.input.keyboard?.once('keydown-ENTER', go);
    this.input.once('pointerdown', go);
  }

  update(_t: number, delta: number) {
    this.bg.update(delta / 1000);
  }
}
