import Phaser from 'phaser';
import { FONT, GAME_HEIGHT, GAME_WIDTH, getHighScore } from '../config';
import { StarField } from './Background';

type Kind = 'star' | 'gem' | 'heart' | 'rock' | 'bomb';

/** Satu objek yang jatuh. Disimpan di array `objects`. */
interface FallingObject {
  sprite: Phaser.GameObjects.Image;
  kind: Kind;
  vy: number; // kecepatan jatuh (px/detik)
  vx: number; // sedikit gerakan horizontal
  spin: number; // rotasi (rad/detik)
  radius: number; // radius collision
}

const MAX_LIVES = 5;
const LEVEL_DURATION = 10; // detik per level

export class GameScene extends Phaser.Scene {
  private bg!: StarField;
  private player!: Phaser.GameObjects.Image;
  private playerRadius = 24;
  private playerSpeed = 420;

  // ===== Array management =====
  private objects: FallingObject[] = [];

  private score = 0;
  private lives = 3;
  private level = 1;
  private elapsed = 0;
  private spawnTimer = 0;
  private invincible = 0;
  private paused = false;
  private isOver = false;
  private highScore = 0;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private pointerTargetX: number | null = null;

  private scoreText!: Phaser.GameObjects.Text;
  private hsText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private hearts: Phaser.GameObjects.Image[] = [];
  private pauseText!: Phaser.GameObjects.Text;
  private emitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super('Game');
  }

  init() {
    this.objects = [];
    this.hearts = [];
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.elapsed = 0;
    this.spawnTimer = 0;
    this.invincible = 0;
    this.paused = false;
    this.isOver = false;
    this.pointerTargetX = null;
    this.highScore = getHighScore();
  }

  create() {
    this.bg = new StarField(this);

    // Lantai
    const ground = this.add.graphics();
    ground.fillStyle(0x1e293b, 1);
    ground.fillRect(0, GAME_HEIGHT - 30, GAME_WIDTH, 30);
    ground.fillStyle(0x38bdf8, 0.6);
    ground.fillRect(0, GAME_HEIGHT - 30, GAME_WIDTH, 3);

    this.player = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT - 62, 'player').setDepth(5);

    this.emitter = this.add.particles(0, 0, 'dot', {
      speed: { min: 80, max: 260 },
      lifespan: 550,
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      emitting: false,
    });
    this.emitter.setDepth(10);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keyA = this.input.keyboard!.addKey('A');
    this.keyD = this.input.keyboard!.addKey('D');
    this.input.keyboard!.on('keydown-P', () => this.togglePause());
    this.input.keyboard!.on('keydown-ESC', () => this.togglePause());

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => (this.pointerTargetX = p.x));
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (p.isDown || !p.wasTouch) this.pointerTargetX = p.x;
    });
    this.input.keyboard!.on('keydown', (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'd', 'A', 'D'].includes(e.key)) this.pointerTargetX = null;
    });

    this.createHUD();
  }

  private createHUD() {
    const style = { fontFamily: FONT, fontSize: '22px', color: '#ffffff', fontStyle: 'bold' };
    const panel = this.add.graphics().setDepth(20);
    panel.fillStyle(0x020617, 0.55);
    panel.fillRoundedRect(8, 8, GAME_WIDTH - 16, 70, 14);

    this.scoreText = this.add.text(20, 16, 'Skor: 0', style).setDepth(21);
    this.hsText = this.add
      .text(20, 46, `Best: ${this.highScore}`, { ...style, fontSize: '16px', color: '#f472b6' })
      .setDepth(21);
    this.levelText = this.add
      .text(GAME_WIDTH / 2, 16, 'Level 1', { ...style, color: '#fde047' })
      .setOrigin(0.5, 0)
      .setDepth(21);
    this.timeText = this.add
      .text(GAME_WIDTH / 2, 46, '0.0s', { ...style, fontSize: '16px', color: '#94a3b8' })
      .setOrigin(0.5, 0)
      .setDepth(21);

    for (let i = 0; i < MAX_LIVES; i++) {
      const h = this.add
        .image(GAME_WIDTH - 30 - i * 26, 43, 'heart')
        .setScale(0.55)
        .setDepth(21);
      this.hearts.push(h);
    }
    this.refreshHearts();

    this.pauseText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'PAUSE\n\nTekan P untuk lanjut', {
        ...style,
        fontSize: '30px',
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(30)
      .setStroke('#0f172a', 6)
      .setVisible(false);
  }

  private refreshHearts() {
    this.hearts.forEach((h, i) => {
      h.setAlpha(i < this.lives ? 1 : 0.15);
    });
  }

  private togglePause() {
    if (this.isOver) return;
    this.paused = !this.paused;
    this.pauseText.setVisible(this.paused);
    if (this.paused) this.tweens.pauseAll();
    else this.tweens.resumeAll();
  }

  // ===== Tingkat kesulitan =====
  private get spawnInterval() {
    // Makin tinggi level, makin cepat muncul (min 0.28 detik)
    return Math.max(0.28, 1.0 - (this.level - 1) * 0.08);
  }

  private get baseFallSpeed() {
    return 170 + (this.level - 1) * 35;
  }

  private get obstacleChance() {
    // Peluang rintangan naik dari 40% → maks 70%
    return Math.min(0.7, 0.4 + (this.level - 1) * 0.03);
  }

  private spawnObject() {
    let kind: Kind;
    const r = Math.random();
    if (r < this.obstacleChance) {
      kind = Math.random() < 0.65 ? 'rock' : 'bomb';
    } else {
      const r2 = Math.random();
      if (r2 < 0.05 && this.lives < MAX_LIVES) kind = 'heart';
      else if (r2 < 0.3) kind = 'gem';
      else kind = 'star';
    }

    const x = Phaser.Math.Between(30, GAME_WIDTH - 30);
    const sprite = this.add.image(x, -40, kind).setDepth(4);
    let scale = 1;
    if (kind === 'rock') {
      scale = Phaser.Math.FloatBetween(0.75, 1.25 + Math.min(this.level * 0.03, 0.4));
    }
    sprite.setScale(scale);

    const speedVar = Phaser.Math.FloatBetween(0.85, 1.25);
    const obj: FallingObject = {
      sprite,
      kind,
      vy: this.baseFallSpeed * speedVar * (kind === 'bomb' ? 1.2 : 1),
      vx: kind === 'rock' && this.level >= 4 ? Phaser.Math.Between(-40, 40) : 0,
      spin: kind === 'rock' ? Phaser.Math.FloatBetween(-3, 3) : kind === 'star' ? 2 : 0,
      radius: (Math.min(sprite.width, sprite.height) / 2) * scale * 0.8,
    };

    // Tambahkan ke array
    this.objects.push(obj);
  }

  // ===== Collision detection (lingkaran vs lingkaran) =====
  private isColliding(obj: FallingObject): boolean {
    const dx = obj.sprite.x - this.player.x;
    const dy = obj.sprite.y - (this.player.y + 4);
    const rSum = obj.radius + this.playerRadius;
    return dx * dx + dy * dy < rSum * rSum;
  }

  private floatText(x: number, y: number, msg: string, color: string) {
    const t = this.add
      .text(x, y, msg, { fontFamily: FONT, fontSize: '22px', color, fontStyle: 'bold' })
      .setOrigin(0.5)
      .setStroke('#0f172a', 4)
      .setDepth(15);
    this.tweens.add({ targets: t, y: y - 50, alpha: 0, duration: 700, onComplete: () => t.destroy() });
  }

  private handleCollect(obj: FallingObject) {
    const { x, y } = obj.sprite;
    if (obj.kind === 'star') {
      this.score += 10;
      this.emitter.setParticleTint(0xfde047);
      this.floatText(x, y, '+10', '#fde047');
    } else if (obj.kind === 'gem') {
      this.score += 25;
      this.emitter.setParticleTint(0x4ade80);
      this.floatText(x, y, '+25', '#4ade80');
    } else if (obj.kind === 'heart') {
      this.lives = Math.min(MAX_LIVES, this.lives + 1);
      this.refreshHearts();
      this.emitter.setParticleTint(0xf87171);
      this.floatText(x, y, '+1 ♥', '#f87171');
    }
    this.emitter.explode(12, x, y);
    this.tweens.add({ targets: this.player, scaleX: 1.15, scaleY: 0.9, duration: 80, yoyo: true });
  }

  private handleHit(obj: FallingObject) {
    if (this.invincible > 0) return;
    this.lives--;
    this.refreshHearts();
    this.invincible = 1.3;
    this.emitter.setParticleTint(obj.kind === 'bomb' ? 0xf97316 : 0xa8a29e);
    this.emitter.explode(24, obj.sprite.x, obj.sprite.y);
    this.cameras.main.shake(220, 0.012);
    this.cameras.main.flash(120, 255, 60, 60);
    this.floatText(this.player.x, this.player.y - 40, 'AUCH!', '#f87171');

    if (this.lives <= 0) this.gameOver();
  }

  private levelUp() {
    this.level++;
    this.levelText.setText(`Level ${this.level}`);
    const t = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, `LEVEL ${this.level}!`, {
        fontFamily: FONT,
        fontSize: '48px',
        color: '#fde047',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setStroke('#0f172a', 8)
      .setDepth(25)
      .setScale(0.3);
    this.tweens.add({
      targets: t,
      scale: 1,
      duration: 300,
      ease: 'Back.out',
      onComplete: () => this.tweens.add({ targets: t, alpha: 0, delay: 600, duration: 400, onComplete: () => t.destroy() }),
    });
  }

  private gameOver() {
    this.isOver = true;
    this.player.setAlpha(1).setTint(0xff6666);
    this.tweens.add({ targets: this.player, angle: 180, alpha: 0, y: this.player.y + 20, duration: 700 });
    this.time.delayedCall(900, () => {
      this.scene.start('GameOver', {
        score: this.score,
        level: this.level,
        time: this.elapsed,
      });
    });
  }

  update(_time: number, delta: number) {
    if (this.paused || this.isOver) return;
    const dt = Math.min(delta / 1000, 0.05);

    this.elapsed += dt;
    this.bg.update(dt, 1 + this.level * 0.25);

    // Level naik tiap LEVEL_DURATION detik
    const targetLevel = 1 + Math.floor(this.elapsed / LEVEL_DURATION);
    if (targetLevel > this.level) this.levelUp();

    // --- Gerakan pemain ---
    let dir = 0;
    if (this.cursors.left.isDown || this.keyA.isDown) dir -= 1;
    if (this.cursors.right.isDown || this.keyD.isDown) dir += 1;
    if (dir !== 0) {
      this.player.x += dir * this.playerSpeed * dt;
      this.player.setAngle(dir * 8);
    } else if (this.pointerTargetX !== null) {
      const diff = this.pointerTargetX - this.player.x;
      const step = Math.sign(diff) * Math.min(Math.abs(diff), this.playerSpeed * 1.3 * dt);
      this.player.x += step;
      this.player.setAngle(Math.abs(diff) > 4 ? Math.sign(diff) * 8 : 0);
    } else {
      this.player.setAngle(0);
    }
    this.player.x = Phaser.Math.Clamp(this.player.x, 32, GAME_WIDTH - 32);

    // Kedip saat kebal
    if (this.invincible > 0) {
      this.invincible -= dt;
      this.player.setAlpha(Math.floor(this.invincible * 12) % 2 === 0 ? 0.3 : 1);
      if (this.invincible <= 0) this.player.setAlpha(1);
    }

    // --- Spawn ---
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnObject();
      // Di level tinggi kadang muncul 2 sekaligus
      if (this.level >= 5 && Math.random() < 0.25) this.spawnObject();
    }

    // --- Update objek + collision (loop mundur agar aman saat splice) ---
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const obj = this.objects[i];
      obj.sprite.y += obj.vy * dt;
      obj.sprite.x += obj.vx * dt;
      obj.sprite.rotation += obj.spin * dt;
      if (obj.sprite.x < 20 || obj.sprite.x > GAME_WIDTH - 20) obj.vx *= -1;

      let remove = false;
      if (this.isColliding(obj)) {
        if (obj.kind === 'rock' || obj.kind === 'bomb') {
          if (this.invincible <= 0) {
            this.handleHit(obj);
            remove = true;
          }
        } else {
          this.handleCollect(obj);
          remove = true;
        }
      } else if (obj.sprite.y > GAME_HEIGHT - 30 - obj.radius * 0.5) {
        // Menyentuh tanah → hilang
        if (obj.kind === 'bomb') {
          this.emitter.setParticleTint(0xf97316);
          this.emitter.explode(8, obj.sprite.x, obj.sprite.y);
        }
        remove = true;
      }

      if (remove) {
        obj.sprite.destroy();
        this.objects.splice(i, 1); // hapus dari array
      }
      if (this.isOver) break;
    }

    // Bonus skor bertahan hidup
    this.score += dt * this.level;

    // --- HUD ---
    const s = Math.floor(this.score);
    this.scoreText.setText(`Skor: ${s}`);
    if (s > this.highScore) this.hsText.setText(`Best: ${s} ★`).setColor('#fde047');
    this.timeText.setText(`${this.elapsed.toFixed(1)}s`);
  }
}
