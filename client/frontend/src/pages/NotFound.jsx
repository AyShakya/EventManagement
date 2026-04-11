import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-[70vh] page-content flex items-center justify-center px-4">
      <div className="surface-card p-8 md:p-10 text-center max-w-lg w-full">
        <p className="text-xs uppercase tracking-[0.14em] text-gray-500">404 error</p>
        <h1 className="mt-2 text-3xl font-bold text-coffee-dark">Page not found</h1>
        <p className="mt-2 text-sm text-gray-600">
          The page you are looking for may have moved or does not exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-coffee-mid px-4 py-2 text-sm font-medium text-white hover:bg-coffee-dark"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
