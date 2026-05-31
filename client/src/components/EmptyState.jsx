import { PackageOpen } from 'lucide-react';

export default function EmptyState({ title = 'Nothing here yet', message = 'Check back soon.' }) {
  return (
    <div className="panel flex flex-col items-center justify-center px-6 py-12 text-center">
      <PackageOpen className="mb-3 h-10 w-10 text-sage" />
      <h3 className="text-xl font-bold text-charcoal">{title}</h3>
      <p className="mt-2 max-w-md text-charcoal/70">{message}</p>
    </div>
  );
}
