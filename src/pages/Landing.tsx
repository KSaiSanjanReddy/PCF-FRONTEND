import { useEffect } from "react";
import LandingApp from "@landing/App.jsx";
import "@landing/index.css";

/**
 * Public marketing homepage mounted at `/`.
 * Source of truth: A:/Enviguide/Enviraan-landing-page (vendored into ./landing for CI).
 */
const Landing: React.FC = () => {
  useEffect(() => {
    document.body.dataset.enviraanLanding = "true";
    return () => {
      delete document.body.dataset.enviraanLanding;
      document.body.style.overflow = "";
    };
  }, []);

  return <LandingApp />;
};

export default Landing;
