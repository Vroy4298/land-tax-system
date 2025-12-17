import { FileX } from "lucide-react";

export default function EmptyState({
  title = "No data found",
  description = "There is nothing to show here yet.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex justify-center py-16">
      <div
        className="
          glass-card
          w-full max-w-md
          px-8 py-10
          rounded-2xl
          text-center
        "
      >
        {/* Icon */}
        <div
          className="
            mx-auto mb-5
            w-16 h-16
            flex items-center justify-center
            rounded-full
            bg-gray-100
            dark:bg-slate-800
          "
        >
          <FileX className="w-7 h-7 text-gray-400 dark:text-gray-500" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          {title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {description}
        </p>

        {/* Action */}
        {actionLabel && (
          <button
            onClick={onAction}
            className="mt-6 btn-primary px-6"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
