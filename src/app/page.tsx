import { CreateRoomForm } from '@/components/CreateRoomForm';
import { AdBanner } from '@/components/AdBanner';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] bg-pink-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
              PilihPilih
            </span>
          </h1>
          <p className="text-white/50 text-sm md:text-base max-w-xs mx-auto">
            Buat roda gacha atau voting live. Share link, semua bisa ikut!
          </p>
        </div>

        {/* Form */}
        <CreateRoomForm />

        {/* Footer */}
        <p className="text-center text-xs text-white/20 mt-6 mb-4">
          Room akan expired otomatis
        </p>

        {/* Ad Space */}
        <AdBanner slot="footer" size="small" />
      </div>
    </main>
  );
}
