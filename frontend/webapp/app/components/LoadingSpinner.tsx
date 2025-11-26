type Props = {
  label?: string;
};

export default function LoadingSpinner({ label }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-700">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-4 border-white/60" />
        <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-r-transparent animate-spin bg-gradient-to-br from-[#5b7bff]/40 via-[#9f7aea]/30 to-[#7dd3fc]/40" />
        <div className="absolute inset-[26%] rounded-full bg-white shadow-inner" />
      </div>
      <div className="text-sm font-semibold">
        {label ?? "Loading..."}
      </div>
    </div>
  );
}
