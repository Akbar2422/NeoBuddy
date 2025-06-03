import { motion } from 'framer-motion';
import '../cyberpunk-theme.css';

const CancellationRefundPolicy = () => {
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
            Cancellation and Refund Policy
          </motion.h1>
          
          <motion.div
            className="space-y-6 text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Introduction */}
            <section>
              <p>
                This Cancellation and Refund Policy outlines the procedures and guidelines for cancellations and refunds related to NeoBuddy services. 
                Please read this policy carefully to understand our approach to refunds and cancellations.
              </p>
            </section>

            {/* 1. Eligibility for Refunds */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-white">1. Eligibility for Refunds</h2>
              <p>
                As of now, NeoBuddy is a free-to-use service. If paid features are introduced, eligibility for refunds will be outlined here.
              </p>
              <p className="mt-2">
                Currently, since no financial transactions are processed within our platform, refund eligibility is not applicable at this stage.
              </p>
            </section>

            {/* 2. Refund Process */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-white">2. Refund Process</h2>
              <p>
                When payment features are introduced to NeoBuddy, the following refund process will apply:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>
                  Users will be able to request refunds through email at <a href="mailto:contact.neobuddy@gmail.com" className="text-blue-400 hover:underline">contact.neobuddy@gmail.com</a> or through a dedicated support portal that will be implemented.
                </li>
                <li>
                  All refund requests will require valid reasons for the refund and the order reference number.
                </li>
                <li>
                  Each refund request will be reviewed on a case-by-case basis according to the eligibility criteria that will be established.
                </li>
              </ul>
            </section>

            {/* 3. Cancellation Process */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-white">3. Cancellation Process</h2>
              <p>
                Users can simply stop using the service at any time. Account-based cancellations will be added when subscription features are introduced.
              </p>
              <p className="mt-2">
                When subscription services are implemented in the future, this section will be updated with detailed instructions on how to cancel recurring payments and subscriptions.
              </p>
            </section>

            {/* 4. Refund Timeline */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-white">4. Refund Timeline</h2>
              <p>
                When refunds become applicable in the future:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>
                  Refunds will be processed within 5–10 business days after approval.
                </li>
                <li>
                  The time it takes for the refunded amount to appear in your account may vary depending on your payment method and financial institution.
                </li>
              </ul>
            </section>

            {/* 5. Fees and Charges */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-white">5. Fees and Charges</h2>
              <p>
                NeoBuddy currently does not impose any charges. If in-app purchases or premium features are launched, this section will detail associated cancellation or refund fees.
              </p>
              <p className="mt-2">
                Any potential processing fees or administrative charges related to refunds will be clearly communicated before the implementation of paid services.
              </p>
            </section>

            {/* 6. No Refunds for Certain Cases */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-white">6. No Refunds for Certain Cases</h2>
              <p>
                When paid services are introduced, refunds will not be available for:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>
                  Services that have been fully rendered and consumed.
                </li>
                <li>
                  Cases where there has been a violation of our Terms and Conditions.
                </li>
                <li>
                  Instances of platform misuse or abuse.
                </li>
                <li>
                  Any digital content that has been accessed, downloaded, or used.
                </li>
              </ul>
            </section>

            {/* 7. Contact Us */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-white">7. Contact Us</h2>
              <p>
                If you have any questions about this Cancellation and Refund Policy, please contact us at:
              </p>
              <p className="mt-2">
                <a href="mailto:contact.neobuddy@gmail.com" className="gradient-text font-semibold">
                  📧 contact.neobuddy@gmail.com
                </a>
              </p>
            </section>

            {/* Policy Updates */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-white">Policy Updates</h2>
              <p>
                This Cancellation and Refund Policy may be updated from time to time, especially when paid features are introduced. 
                We will notify users of any significant changes by posting the new policy on this page and, where appropriate, via email.
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

export default CancellationRefundPolicy;