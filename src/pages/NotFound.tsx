
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center cyber-panel">
        <h1 className="text-4xl font-bold mb-4 cyber-text-glow text-cyber-cyan">404</h1>
        <p className="text-xl text-cyber-cyan mb-4">System Error: Page Not Found</p>
        <Link to="/" className="cyber-button">
          Return to Control Center
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
