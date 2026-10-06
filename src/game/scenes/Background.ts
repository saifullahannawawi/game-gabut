import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';

/** Latar bintang bergerak sederhana — dipakai di semua scene. */
export class StarField {
  private stars: { obj: Phaser.GameObjects.Arc; speed: number }[] = [];

  constructor(scene: Phaser.Scene) {
    const bg = scene.add.graphics();
    bg.fillGradientStyle(0x0f172a, 0x0f172a, 0x312e81, 0x4c1d95, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    for (let i = 0; i < 70; i++) {
      const size = Phaser.Math.FloatBetween(0.6, 2);
      const s = scene.add.circle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        size,
        0xffffff,
        Phaser.Math.FloatBetween(0.3, 0.9),
      );
      this.stars.push({ obj: s, speed: size * 25 });
    }
  }

  update(dt: number, mult = 1) {
    for (const s of this.stars) {
      s.obj.y += s.speed * dt * mult;
      if (s.obj.y > GAME_HEIGHT) {
        s.obj.y = -2;
        s.obj.x = Phaser.Math.Between(0, GAME_WIDTH);
      }
    }
  }
}
