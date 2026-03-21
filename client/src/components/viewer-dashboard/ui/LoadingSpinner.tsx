type LoadingSpinnerProps = {
  color?: string;
  message?: string;
  height?: string;
};

export default function LoadingSpinner({
  color = "blue",
  message = "Loading...",
  height = "h-[300px]",
}: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${height}`}>
      <div className="flex flex-col items-center gap-3">
        <div
          className={`w-10 h-10 border-4 border-${color}-200 border-t-${color}-600 rounded-full animate-spin`}
        />
        <p className="text-slate-500">{message}</p>
      </div>
    </div>
  );
}