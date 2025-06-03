import { motion } from 'framer-motion';
import '../cyberpunk-theme.css';

const TermsAndConditions = () => {
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
            Terms and Conditions
          </motion.h1>
          
          <motion.div
            className="space-y-6 text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* 1. Acceptance of Terms */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-white">1. Acceptance of Terms</h2>
              <p>
                By accessing or using NeoBuddy, you agree to be bound by these Terms and Conditions. 
                If you do not agree to all the terms and conditions of this agreement, you may not access 
                or use any services provided by NeoBuddy.
              </p>
            </section>

            {/* 2. Account Creation and Usage */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-white">2. Account Creation and Usage</h2>
              <p className="mb-2">
                To access certain features of NeoBuddy, you may be required to provide a username. By creating an account, you agree to the following:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
                </li>
                <li>
                  You are responsible for all activities conducted through your account.
                </li>
                <li>
                  You must not use the service for any illegal or unauthorized purpose, nor may you, in the use of the service, violate any laws in your jurisdiction.
                </li>
                <li>
                  You must not attempt to gain unauthorized access to any portion or feature of the service, or any other systems or networks connected to the service.
                </li>
              </ul>
            </section>

            {/* 3. Payment and Pricing */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-white">3. Payment and Pricing</h2>
              <p>
                NeoBuddy currently does not charge users. If pricing or subscriptions are introduced in the future, 
                the Terms will be updated accordingly. When payment features are implemented:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>
                  Payment methods will be handled securely through trusted third-party payment processors.
                </li>
                <li>
                  Users will be notified about pricing models and payment terms once implemented.
                </li>
                <li>
                  Any changes to pricing will be communicated to users in advance.
                </li>
              </ul>
            </section>

            {/* 4. Content Ownership */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-white">4. Content Ownership</h2>
              <p className="mb-2">
                With respect to content you upload or create using NeoBuddy:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  NeoBuddy does not store or own any user-generated media/content permanently.
                </li>
                <li>
                  You retain ownership of all content you upload or create using our service.
                </li>
                <li>
                  By using our service, you grant NeoBuddy a limited license to process and display your content solely for the purpose of providing the service to you.
                </li>
              </ul>
            </section>

            {/* 5. Prohibited Uses */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-white">5. Prohibited Uses</h2>
              <p className="mb-2">
                You agree not to use NeoBuddy for any of the following prohibited activities:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Uploading, transmitting, or distributing any content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable.
                </li>
                <li>
                  Attempting to interfere with, compromise the system integrity or security, or decipher any transmissions to or from the servers running the service.
                </li>
                <li>
                  Using any robot, spider, crawler, scraper, or other automated means to access the service for any purpose without our express written permission.
                </li>
                <li>
                  Taking any action that imposes, or may impose, an unreasonable or disproportionately large load on our infrastructure.
                </li>
                <li>
                  Uploading invalid data, viruses, worms, or other software agents through the service.
                </li>
              </ul>
            </section>

            {/* 6. Termination */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-white">6. Termination</h2>
              <p>
                NeoBuddy reserves the right, in its sole discretion, to suspend or terminate your access to all or part of the service, with or without notice, for any reason, including without limitation, breach of these Terms. Upon termination:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>
                  Your right to use the service will immediately cease.
                </li>
                <li>
                  Any data or content associated with your account may be deleted.
                </li>
                <li>
                  NeoBuddy has no obligation to maintain, store, or transfer any information or data that you have uploaded to the service.
                </li>
              </ul>
            </section>

            {/* 7. Disclaimer of Warranties */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-white">7. Disclaimer of Warranties</h2>
              <p>
                The service is provided on an "AS IS" and "AS AVAILABLE" basis. NeoBuddy expressly disclaims all warranties of any kind, whether express or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
              </p>
              <p className="mt-2">
                NeoBuddy makes no warranty that:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>
                  The service will meet your requirements.
                </li>
                <li>
                  The service will be uninterrupted, timely, secure, or error-free.
                </li>
                <li>
                  The results that may be obtained from the use of the service will be accurate or reliable.
                </li>
              </ul>
            </section>

            {/* 8. Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-white">8. Limitation of Liability</h2>
              <p>
                In no event shall NeoBuddy, its officers, directors, employees, or agents, be liable to you for any direct, indirect, incidental, special, punitive, or consequential damages whatsoever resulting from:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>
                  Any errors, mistakes, or inaccuracies of content.
                </li>
                <li>
                  Personal injury or property damage of any nature whatsoever resulting from your access to and use of our service.
                </li>
                <li>
                  Any unauthorized access to or use of our secure servers and/or any and all personal information stored therein.
                </li>
                <li>
                  Any interruption or cessation of transmission to or from our service.
                </li>
                <li>
                  Any bugs, viruses, Trojan horses, or the like, which may be transmitted to or through our service by any third party.
                </li>
              </ul>
            </section>

            {/* 9. Indemnification */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-white">9. Indemnification</h2>
              <p>
                You agree to defend, indemnify, and hold harmless NeoBuddy, its officers, directors, employees, and agents, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees) arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>
                  Your use of and access to the service.
                </li>
                <li>
                  Your violation of any term of these Terms.
                </li>
                <li>
                  Your violation of any third-party right, including without limitation any copyright, property, or privacy right.
                </li>
                <li>
                  Any claim that your content caused damage to a third party.
                </li>
              </ul>
            </section>

            {/* 10. Governing Law */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-white">10. Governing Law</h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
              </p>
            </section>

            {/* 11. Contact Us */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-white">11. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
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

export default TermsAndConditions;