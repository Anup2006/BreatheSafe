import { useRouteError, Link } from 'react-router-dom';
import { FiAlertCircle, FiArrowLeft, FiHome } from 'react-icons/fi';
import './ErrorPage.css'; // Optional: add styling

const ErrorPage = () => {
  const error = useRouteError();

  return (
    <div className="error-page-container">
      <div className="error-page-content">
        <FiAlertCircle size={80} className="error-icon" />
        <h1>Oops! Something went wrong</h1>
        <p className="error-message">
          {error?.message || error?.statusText || 'Page not found'}
        </p>
        <p className="error-details">
          {error?.status && `Error ${error.status}`}
        </p>
        <div className="error-actions">
          <Link to="/app/dashboard" className="btn-primary">
            <FiArrowLeft size={18} />
            Back to Dashboard
          </Link>
          <Link to="/" className="btn-secondary">
            <FiHome size={18} />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
