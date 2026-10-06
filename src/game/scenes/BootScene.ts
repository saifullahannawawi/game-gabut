import Phaser from 'phaser';

function starPoints(cx: number, cy: number, outer: number, inner: number, n = 5) {
  const pts: Phaser.Math.Vector2[] = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / n) * i - Math.PI / 2;
    pts.push(new Phaser.Math.Vector2(cx + Math.cos(a) * r, cy + Math.sin(a) * r));
  }
  return pts;
}

/** Membuat semua tekstur secara prosedural (tanpa file gambar). */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    const g = this.make.graphics({ x: 0, y: 0 }, false);

    // --- Player (karakter bulat lucu) ---
    g.clear();
    g.fillStyle(0x0ea5e9, 1);
    g.fillRoundedRect(4, 10, 56, 48, 20);
    g.fillStyle(0x38bdf8, 1);
    g.fillRoundedRect(8, 12, 48, 30, 16);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(22, 28, 8);
    g.fillCircle(42, 28, 8);
    g.fillStyle(0x0f172a, 1);
    g.fillCircle(24, 29, 4);
    g.fillCircle(44, 29, 4);
    g.fillStyle(0xf472b6, 1);
    g.fillCircle(14, 42, 4);
    g.fillCircle(50, 42, 4);
    g.lineStyle(3, 0x0f172a, 1);
    g.beginPath();
    g.arc(32, 40, 7, 0.2, Math.PI - 0.2);
    g.strokePath();
    g.fillStyle(0xfacc15, 1);
    g.fillTriangle(26, 10, 32, 0, 38, 10);
    g.generateTexture('player', 64, 60);

    // --- Bintang (item +10) ---
    g.clear();
    g.fillStyle(0xfde047, 1);
    g.fillPoints(starPoints(24, 25, 22, 10), true);
    g.fillStyle(0xfef9c3, 1);
    g.fillPoints(starPoints(24, 25, 10, 5), true);
    g.generateTexture('star', 48, 48);

    // --- Permata (item +25) ---
    g.clear();
    g.fillStyle(0x22c55e, 1);
    g.fillPoints(
      [
        new Phaser.Math.Vector2(20, 2),
        new Phaser.Math.Vector2(38, 16),
        new Phaser.Math.Vector2(20, 40),
        new Phaser.Math.Vector2(2, 16),
      ],
      true,
    );
    g.fillStyle(0x86efac, 1);
    g.fillTriangle(20, 2, 38, 16, 20, 16);
    g.fillStyle(0xbbf7d0, 1);
    g.fillTriangle(20, 2, 20, 16, 2, 16);
    g.generateTexture('gem', 40, 42);

    // --- Hati (nyawa +1) ---
    g.clear();
    g.fillStyle(0xef4444, 1);
    g.fillCircle(12, 13, 10);
    g.fillCircle(28, 13, 10);
    g.fillTriangle(3, 17, 37, 17, 20, 36);
    g.fillStyle(0xfca5a5, 1);
    g.fillCircle(10, 10, 3);
    g.generateTexture('heart', 40, 38);

    // --- Batu (rintangan) ---
    g.clear();
    g.fillStyle(0x57534e, 1);
    g.fillPoints(
      [
        new Phaser.Math.Vector2(14, 2),
        new Phaser.Math.Vector2(38, 4),
        new Phaser.Math.Vector2(50, 22),
        new Phaser.Math.Vector2(42, 46),
        new Phaser.Math.Vector2(16, 50),
        new Phaser.Math.Vector2(2, 30),
      ],
      true,
    );
    g.fillStyle(0x78716c, 1);
    g.fillCircle(20, 18, 7);
    g.fillCircle(36, 34, 5);
    g.fillStyle(0x44403c, 1);
    g.fillCircle(30, 16, 3);
    g.fillCircle(18, 36, 4);
    g.generateTexture('rock', 52, 52);

    // --- Bom (rintangan) ---
    g.clear();
    g.fillStyle(0x1e1b4b, 1);
    g.fillCircle(24, 30, 18);
    g.fillStyle(0x4c1d95, 1);
    g.fillCircle(18, 24, 6);
    g.fillStyle(0x64748b, 1);
    g.fillRect(20, 6, 8, 8);
    g.lineStyle(3, 0xa16207, 1);
    g.beginPath();
    g.moveTo(24, 6);
    g.lineTo(30, 2);
    g.strokePath();
    g.fillStyle(0xf97316, 1);
    g.fillCircle(32, 3, 3);
    g.generateTexture('bomb', 48, 50);

    // --- Partikel ---
    g.clear();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture('dot', 8, 8);

    g.destroy();
    this.scene.start('Menu');
  }
}
