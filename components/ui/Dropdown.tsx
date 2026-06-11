export function Dropdown({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label?: string;
  value: string | null;
  onChange: (v: string | null) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-zinc-500">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
          className="w-full appearance-none rounded-md border border-zinc-800 bg-zinc-900/60 py-2 pl-3 pr-9 text-sm text-zinc-100 focus:border-accent/50 focus:outline-none"
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
        >
          <path
            d="M2 4 L5 7 L8 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
