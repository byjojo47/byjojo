export default function LoadingSpinner({ label = 'Loading' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-olive">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-sand border-t-olive" />
      <span>{label}</span>
    </div>
  );
}
