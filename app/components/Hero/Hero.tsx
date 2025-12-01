import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative pt-80 pb-64 md:pt-96 md:pb-96 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/pexels-tomfisk-1483880.jpg')`,
            filter: 'blur(2px)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Connecting Fields, <span className="text-[#86efac]">Cultivating Futures</span>
          </h1>
          <p className="mt-6 text-xl text-white/90 max-w-3xl mx-auto">
            AgriLink bridges the gap between traditional farming and modern technology, 
            empowering farmers with blockchain land integration, AI-powered insights, 
            and a comprehensive marketplace for all agricultural needs.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/marketplace" 
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#d97706] hover:bg-[#b45309] md:py-4 md:text-lg md:px-10 transition-colors"
            >
              Explore the Marketplace
            </Link>
            <Link 
              href="/register" 
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-[#166534] bg-[#dcfce7] hover:bg-[#bbf7d0] md:py-4 md:text-lg md:px-10 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
