import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import TechStack from './components/TechStack';
import Footer from './components/Footer';
import LanguageToggle from './components/LanguageToggle';
import TopBar from './components/TopBar';
import AboutSection from './components/AboutSection';
import ServicesPage from './components/ServicesPage';
import { LanguageProvider } from './hooks/useLanguage';
import AdminDashboard from './admin/AdminDashboard';

function App() {
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  const isServicesRoute = window.location.pathname === '/hizmetlerimiz' || window.location.pathname === '/services';

  if (isAdminRoute) {
    return (
      <LanguageProvider>
        <AdminDashboard />
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      {isServicesRoute ? (
        <>
          <LanguageToggle />
          <ServicesPage />
        </>
      ) : (
        <div className="min-h-screen bg-[#0E0E0F] font-sans selection:bg-[#85ADFF] selection:text-[#002C66]" id="top">
          <LanguageToggle />
          <TopBar />
          <Hero />
          <HowItWorks />
          <AboutSection />
          <Features />
          <TechStack />
          <Footer />
        </div>
      )}
    </LanguageProvider>
  );
}

export default App;
