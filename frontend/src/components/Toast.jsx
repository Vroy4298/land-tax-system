export default function Toast({ type = "success", message }) {
  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  };

  return (
    <div
      className={`${colors[type]} text-white px-4 py-2 rounded-lg shadow-lg 
                  mb-3 animate-slide-in`}
    >
      {message}
    </div>
  );
}

