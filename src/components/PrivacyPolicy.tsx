import { motion } from 'framer-motion';
import '../cyberpunk-theme.css';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="py-6 bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4">
          <motion.h1 
            className="text-3xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <a href="/" className="flex items-center">
              <span className="gradient-text">Neo</span>
              <span className="text-white">Buddy</span>
            </a>
          </motion.h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <motion.div
          className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1 
            className="text-3xl font-bold mb-6 gradient-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Privacy Policy
          </motion.h1>
          
          <motion.div
            className="space-y-6 text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* 1. Introduction */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-white">1. Introduction</h2>
              <p>
                This Privacy Policy explains how NeoBuddy collects, uses, and protects your personal information when you use our platform. 
                We are committed to ensuring that your privacy is protected and that you understand how your information is handled.
              </p>
            </section>

            {/* 2. Information We Collect */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-white">2. Information We Collect</h2>
              <p className="mb-2">
                NeoBuddy collects minimal personal information to provide you with the best possible experience:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Personal Information:</strong> We only collect your name for login and personalization purposes.
                </li>
                <li>
                  <strong>No Payment Details:</strong> We do not collect or store any payment details or other sensitive information directly.
                </li>
                <li>
                  <strong>Automatically Collected Data:</strong> We may automatically collect certain information such as your IP address, 
                  device type, and browser information for basic functionality and analytics purposes.
                </li>
              </ul>
            </section>

            {/* 3. How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-white">3. How We Use Your Information</h2>
              <p className="mb-2">
                The minimal data we collect is used for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  To personalize your experience within the app and provide content tailored to your preferences.
                </li>
                <li>
                  To enhance basic functionality and manage your session effectively.
                </li>
                <li>
                  To improve our platform based on usage patterns and user feedback.
                </li>
              </ul>
            </section>

            {/* 4. Sharing Your Information */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-white">4. Sharing Your Information</h2>
              <p>
                <strong>NeoBuddy does not share, sell, or disclose any user data to third parties under any circumstances.</strong>
              </p>
              <p className="mt-2">
                Your information remains strictly within our system and is only used for the purposes outlined in this policy.
              </p>
            </section>

            {/* 5. Data Security */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-white">5. Data Security</h2>
              <p>
                We implement appropriate security measures to protect your personal information against unauthorized access, 
                alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Secure server environments with regular security updates</li>
                <li>HTTPS encryption for all data transfers</li>
                <li>Limited access to personal information by authorized personnel only</li>
              </ul>
            </section>

            {/* 6. Your Choices */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-white">6. Your Choices</h2>
              <p className="mb-2">
                You have control over your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  You can request deletion of your name and associated data from our system by contacting our support team.
                </li>
                <li>
                  You can contact us with any privacy-related concerns or questions at any time.
                </li>
              </ul>
            </section>

            {/* 7. Cookies and Tracking Technologies */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-white">7. Cookies and Tracking Technologies</h2>
              <p>
                NeoBuddy uses cookies and local storage for essential functions such as maintaining your login session. 
                We do not use cookies or any tracking technologies for advertising, profiling, or tracking your online activity 
                across other websites.
              </p>
            </section>

            {/* 8. Changes to This Privacy Policy */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-white">8. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, 
                legal, or regulatory reasons. We will notify you of any significant changes by posting the new Privacy Policy 
                on this page and, where appropriate, via email. We encourage you to review this Privacy Policy periodically 
                for any changes.
              </p>
            </section>

            {/* 9. Contact Us */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-white">9. Contact Us</h2>
              <p>
                If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
              </p>
              <p className="mt-2">
                <a href="mailto:contact.neobuddy@gmail.com" className="gradient-text font-semibold">
                  📧 contact.neobuddy@gmail.com
                </a>
              </p>
            </section>

            {/* Last Updated */}
            <section className="mt-8 pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </section>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 relative z-10 mt-auto bg-gradient-to-t from-gray-900 to-transparent border-t border-gray-800/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center py-6 backdrop-blur-sm bg-gray-900/20 rounded-lg shadow-lg">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-gray-300 text-sm md:text-base mb-3"
            >
              © {new Date().getFullYear()} <span className="gradient-text font-bold">NeoBuddy</span> | <span className="text-purple-400">AI Face Replacement Technology</span>
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap justify-center items-center gap-2 mt-4 md:mt-6"
            >
              <a href="/" className="text-gray-400 hover:text-white px-3 py-2 rounded-md hover:bg-gray-800/50 transition-all duration-300 text-sm md:text-base">Home</a>
              <a href="/privacy-policy" className="text-gray-400 hover:text-white px-3 py-2 rounded-md hover:bg-gray-800/50 transition-all duration-300 text-sm md:text-base">Privacy Policy</a>
              <a href="/terms-and-conditions" className="text-gray-400 hover:text-white px-3 py-2 rounded-md hover:bg-gray-800/50 transition-all duration-300 text-sm md:text-base">Terms & Conditions</a>
              <a href="/cancellation-refund" className="text-gray-400 hover:text-white px-3 py-2 rounded-md hover:bg-gray-800/50 transition-all duration-300 text-sm md:text-base">Cancellation & Refund</a>
              <a href="/contact-us" className="text-gray-400 hover:text-white px-3 py-2 rounded-md hover:bg-gray-800/50 transition-all duration-300 text-sm md:text-base">Contact Us</a>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;