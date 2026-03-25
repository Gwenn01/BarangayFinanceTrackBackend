type HeroProps = {
  currentYear: number;
};

export default function Hero({ currentYear }: HeroProps) {
  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      <div className="text-center animate-fadeInUp">
        <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 glass-card rounded-full text-xs sm:text-sm font-semibold mb-6 sm:mb-8 shadow-lg">

        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-4 sm:mb-6 leading-tight">
          <span className="block text-slate-900 mb-1 sm:mb-2">Barangay</span>
          <span className="gradient-text">Financial Dashboard</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto leading-relaxed font-medium px-2">
          Empowering communities through{" "}
          <span className="text-blue-600 font-semibold">complete transparency</span>
          , real-time data, and verified accountability.
        </p>
      </div>
    </div>
  );
}