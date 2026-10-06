import Phaser from 'phaser';
import { FONT, GAME_WIDTH, getHighScore, saveHighScore } from '../config';
import { StarField } from './Background';

interface Data {
  score: number;
  level: number;
  time: number;
}

export class GameOverScene extends Phaser.Scene {
  private bg!: StarField;

  constructor() {
    super('GameOver');
  }

  create(data: Data) {
    this.bg = new StarField(this);
    const score = Math.floor(data.score || 0);
    const isNew = saveHighScore(score);
    const hs = getHighScore();
    const cx = GAME_WIDTH / 2;

    const panel = this.add.graphics();
    panel.fillStyle(0x020617, 0.7);
    panel.fillRoundedRect(40, 140, GAME_WIDTH - 80, 440, 24);
    panel.lineStyle(3, 0x38bdf8, 0.8);
    panel.strokeRoundedRect(40, 140, GAME_WIDTH - 80, 440, 24);

    this.add
      .text(cx, 200, 'GAME OVER', { fontFamily: FONT, fontSize: '52px', color: '#f87171', fontStyle: 'bold' })
      .setOrigin(0.5)
      .setStroke('#0f172a', 8);

    const scoreTxt = this.add
      .text(cx, 290, `${score}`, { fontFamily: FONT, fontSize: '72px', color: '#ffffff', fontStyle: 'bold' })
      .setOrigin(0.5);
    this.add.text(cx, 340, 'SKOR', { fontFamily: FONT, fontSize: '18px', color: '#94a3b8' }).setOrigin(0.5);

    if (isNew && score > 0) {
      const badge = this.add
        .text(cx, 380, '★ HIGH SCORE BARU! ★', { fontFamily: FONT, fontSize: '24px', color: '#fde047', fontStyle: 'bold' })
        .setOrigin(0.5);
      this.tweens.add({ targets: badge, scale: 1.12, duration: 400, yoyo: true, repeat: -1 });
      this.tweens.add({ targets: scoreTxt, scale: 1.08, duration: 400, yoyo: true, repeat: -1 });
    }

    const info = [
      `High Score : ${hs}`,
      `Level      : ${data.level}`,
      `Bertahan   : ${data.time.toFixed(1)} detik`,
    ];
    info.forEach((line, i) => {
      this.add
        .text(cx, 430 + i * 32, line, { fontFamily: 'monospace', fontSize: '20px', color: '#e2e8f0' })
        .setOrigin(0.5);
    });

    const again = this.add
      .text(cx, 640, '↻  SPASI / Klik untuk Main Lagi', { fontFamily: FONT, fontSize: '22px', color: '#ffffff', fontStyle: 'bold' })
      .setOrigin(0.5);
    this.tweens.add({ targets: again, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });
    this.add
      .text(cx, 680, 'M = Menu', { fontFamily: FONT, fontSize: '16px', color: '#94a3b8' })
      .setOrigin(0.5);

    // Delay kecil agar tidak langsung restart karena input sebelumnya
    this.time.delayedCall(500, () => {
      const go = () => this.scene.start('Game');
      this.input.keyboard?.once('keydown-SPACE', go);
      this.input.keyboard?.once('keydown-ENTER', go);
      this.input.once('pointerdown', go);
      this.input.keyboard?.once('keydown-M', () => this.scene.start('Menu'));
    });
  }

  update(_t: number, delta: number) {
    this.bg.update(delta / 1000);
  }
}
