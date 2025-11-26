import { useState } from 'react';
import BugReportForm from './BugReportForm';

const Footer = ({ linkedinUrl }) => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showBugForm, setShowBugForm] = useState(false);

  const handleReportBug = () => {
    const subject = encodeURIComponent('HabitSpark Bug Report');
    const body = encodeURIComponent(
      'Describe the issue:\n\nSteps to reproduce:\n1. \n2. \n3. \n\nExpected behavior:\n\nActual behavior:\n\nBrowser/OS:\n\nScreenshots (if any):\n'
    );
    window.location.href = `mailto:habitspark.dev@gmail.com?subject=${subject}&body=${body}`;
  };

  const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
      <div className="relative bg-surface rounded-xl shadow-neon p-6 w-full max-w-lg mx-4">
        <div className="flex justify-between items-center mb-3">
          <div className="text-xl font-heading text-primary">{title}</div>
          <button className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-800" onClick={onClose}>Close</button>
        </div>
        <div className="text-sm text-text/80 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <footer className="w-full mt-10 mb-6">
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-surface rounded-xl p-4 shadow flex flex-col gap-4">
          <div className="flex items-center justify-between">
            {/* Left: Brand */}
            <div className="flex items-center gap-2">
              <span className="text-aura font-heading">HabitSpark</span>
              <span className="text-gray-400 text-sm">© {new Date().getFullYear()}</span>
            </div>
            {/* Right: Bug icon */}
            <button
              type="button"
              title="Report"
              onClick={() => setShowBugForm(true)}
              className="w-9 h-9 rounded-full bg-primary text-white shadow-neon hover:bg-accent transition flex items-center justify-center"
              aria-label="Report a bug"
            >
              <span className="text-lg">🐞</span>
            </button>
          </div>
          {/* Middle: Links */}
          <div className="flex items-center flex-wrap gap-4 text-sm">
            <a
              href={linkedinUrl || 'https://www.linkedin.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text hover:text-primary transition"
            >
              Developer Contact
            </a>
            <button
              type="button"
              className="px-3 py-1 rounded bg-background text-text border border-shadow hover:border-primary transition"
              onClick={() => setShowPrivacy(true)}
            >
              Privacy
            </button>
            <button
              type="button"
              className="px-3 py-1 rounded bg-background text-text border border-shadow hover:border-primary transition"
              onClick={() => setShowTerms(true)}
            >
              Terms
            </button>
            <button
              type="button"
              className="px-3 py-1 rounded bg-background text-text border border-shadow hover:border-primary transition"
              onClick={() => setShowHelp(true)}
            >
              Help
            </button>
          </div>
        </div>
      </div>

      {showBugForm && (
        <BugReportForm open={showBugForm} onClose={() => setShowBugForm(false)} />
      )}
      {showPrivacy && (
        <Modal title="Privacy Policy" onClose={() => setShowPrivacy(false)}>
          We value your privacy. HabitSpark stores your habits and check-ins to
          provide analytics and streak tracking. We do not sell your data. Contact us
          for any data removal requests at habitspark.dev@gmail.com.
        </Modal>
      )}
      {showTerms && (
        <Modal title="Terms of Service" onClose={() => setShowTerms(false)}>
          By using HabitSpark, you agree to use the app responsibly and acknowledge
          that analytics are based on your inputs. The app is provided "as-is" without
          warranties. We may update features periodically.
        </Modal>
      )}
      {showHelp && (
        <Modal title="Help" onClose={() => setShowHelp(false)}>
          Need assistance? Use the Report button to send us a bug report via email.
          For general questions, check the FAQ in the Analytics panel or contact us on
          LinkedIn via the Developer Contact link.
        </Modal>
      )}
    </footer>
  );
};

export default Footer;
