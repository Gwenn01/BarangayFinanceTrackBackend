type SectionHeaderProps = {
  title: string;
  subtitle: string;
  gradientFrom: string;
  gradientTo: string;
};

export default function SectionHeader({
  title,
  subtitle,
  gradientFrom,
  gradientTo,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-10">
      <div
        className={`w-2 h-12 bg-gradient-to-b ${gradientFrom} ${gradientTo} rounded-full shadow-lg`}
      />
      <div>
        <h2 className="text-xl md:text-4xl font-bold text-slate-900">{title}</h2>
        <p className="text-slate-600 mt-1 text-sm md:text-base">{subtitle}</p>
      </div>
    </div>
  );
}