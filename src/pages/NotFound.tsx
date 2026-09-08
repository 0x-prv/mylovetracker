import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <p className="text-5xl">🧭</p>
      <h1 className="text-xl font-semibold">Page not found</h1>
      <Link
        to="/"
        className="rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-purple-700 hover:to-fuchsia-600"
      >
        Go home
      </Link>
    </div>
  );
}
