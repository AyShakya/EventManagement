import { Link, useLocation } from "react-router-dom";

const ErrorPage = () => {
  const location = useLocation();
  const message = location.state?.message || "Something went wrong while processing your request.";

  return (
    <div className="min-h-[70vh] page-content flex items-center justify-center px-4">
      <div className="surface-card p-8 md:p-10 text-center max-w-lg w-full">
        <p className="text-xs uppercase tracking-[0.14em] text-gray-500">500 error</p>
        <h1 className="mt-2 text-3xl font-bold text-coffee-dark">Something went wrong</h1>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-coffee-mid px-4 py-2 text-sm font-medium text-white hover:bg-coffee-dark"
          >
            Back to home
          </Link>
          <Link
            to="/events"
            className="inline-flex items-center justify-center rounded-full border border-coffee-mid px-4 py-2 text-sm font-medium text-coffee-mid hover:bg-coffee-mid hover:text-white"
          >
            Browse events
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
