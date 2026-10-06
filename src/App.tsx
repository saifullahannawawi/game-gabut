import PhaserGame from './game/PhaserGame';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-slate-100 flex flex-col lg:flex-row items-center justify-center gap-6 p-4">
      <div
        className="w-full max-w-[480px] rounded-2xl overflow-hidden shadow-2xl shadow-sky-500/20 ring-2 ring-sky-400/40 touch-none"
        style={{ aspectRatio: '480 / 720', maxHeight: '92vh' }}
      >
        <PhaserGame />
      </div>

      <aside className="w-full max-w-[480px] lg:max-w-xs space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold">
            <span className="text-sky-400">Dodge</span> <span className="text-yellow-300">&amp; Collect</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Game arcade survival dengan Phaser.js</p>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <h2 className="font-bold text-sky-300 mb-2">🎮 Kontrol</h2>
          <ul className="text-sm space-y-1 text-slate-300">
            <li><kbd className="px-1.5 py-0.5 rounded bg-slate-700">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-700">→</kbd> atau <kbd className="px-1.5 py-0.5 rounded bg-slate-700">A</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-700">D</kbd> — bergerak</li>
            <li>🖱️ Mouse / sentuh — ikuti pointer</li>
            <li><kbd className="px-1.5 py-0.5 rounded bg-slate-700">P</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-slate-700">Esc</kbd> — pause</li>
          </ul>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <h2 className="font-bold text-yellow-300 mb-2">📈 Aturan</h2>
          <ul className="text-sm space-y-1 text-slate-300 list-disc list-inside">
            <li>Kumpulkan ⭐ (+10) dan 💎 (+25)</li>
            <li>Hindari batu &amp; 💣 — kehilangan 1 nyawa</li>
            <li>❤️ menambah nyawa (maks 5)</li>
            <li>Level naik setiap 10 detik: objek makin cepat &amp; banyak</li>
            <li>High score tersimpan di localStorage</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
