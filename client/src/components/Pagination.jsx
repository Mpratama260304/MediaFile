export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.pages <= 1) return null;

  const { page, pages } = pagination;

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) {
      range.push(i);
    }
    if (page - delta > 2) range.unshift('...');
    if (page + delta < pages - 1) range.push('...');
    range.unshift(1);
    if (pages > 1) range.push(pages);
    return range;
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      {getPageNumbers().map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1.5 text-sm rounded-lg ${
              p === page
                ? 'bg-primary-600 text-white'
                : 'border hover:bg-gray-50'
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}
