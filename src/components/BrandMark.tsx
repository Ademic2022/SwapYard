/** The logo mark for generated images (icons, social cards). Mirrors app/icon.svg. */
export function BrandMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect width="32" height="32" rx="9" fill="#1e5f3f" />
      <path d="M7 14.5 16 7.5l9 7" fill="none" stroke="#f6f1e6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.5 18.5h10l-2.5-2.3" fill="none" stroke="#e9a23b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21.5 22.5h-10l2.5 2.3" fill="none" stroke="#f6f1e6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
