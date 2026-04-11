import { Link, useLocation } from "react-router-dom";

const AccessDenied = () => {
  const location = useLocation();
  const fromPath = location.state?.from?.pathname;

  return (
    <div className="min-h-[70vh] page-content flex items-center justify-center px-4">
      <div className="surface-card p-8 md:p-10 text-center max-w-lg w-full">
        <p className="text-xs uppercase tracking-[0.14em] text-gray-500">403 error</p>
        <h1 className="mt-2 text-3xl font-bold text-coffee-dark">Request denied</h1>
        <p className="mt-2 text-sm text-gray-600">
          You do not have permission to access this page.
        </p>
        {fromPath && (
          <p className="mt-2 text-xs text-gray-500">
            Attempted route: <span className="font-medium">{fromPath}</span>
          </p>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-coffee-mid px-4 py-2 text-sm font-medium text-coffee-mid hover:bg-coffee-mid hover:text-white"
          >
            Back to home
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-full bg-coffee-mid px-4 py-2 text-sm font-medium text-white hover:bg-coffee-dark"
          >
            Sign in again
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
