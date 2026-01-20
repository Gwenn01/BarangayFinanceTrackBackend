//import barangayHallPath from "@assets/IMG_20251102_172947_819_1762095297396.jpg";

export function HeroBanner() {
  return (
    <div className="relative h-48 w-full overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        //style={{ backgroundImage: `url(${barangayHallPath})` }}
      />
      
      {/* Gradient Overlay - dark wash for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/50 to-black/60" />
      
      {/* Content */}
      <div className="relative flex h-full items-center justify-center px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white font-poppins tracking-tight mb-2">
            Barangay San Agustin
          </h1>
          <p className="text-lg text-white/90 font-medium">
            Financial Monitoring System
          </p>
          <p className="text-sm text-white/80 mt-1">
            Iba, Zambales
          </p>
        </div>
      </div>
    </div>
  );
}
