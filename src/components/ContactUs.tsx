import { motion } from 'framer-motion';
import { useState } from 'react';
import '../cyberpunk-theme.css';

const ContactUs = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // Validation state
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Validate form
  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      valid = false;
    }

    // Validate subject
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
      valid = false;
    }

    // Validate message
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);
      setSubmitError('');

      // Simulate form submission
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitSuccess(true);
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });

        // Reset success message after 5 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 5000);
      }, 1500);
    }
  };

  // FAQ items
  const faqItems = [
    {
      question: 'What is NeoBuddy?',
      answer: 'NeoBuddy is an AI face replacement technology platform that allows users to transform their appearance in real-time sessions.'
    },
    {
      question: 'Is it free to use?',
      answer: 'Currently, NeoBuddy offers both free and premium sessions. You can explore our available rooms on the homepage to see pricing details.'
    },
    {
      question: 'How do I book a session?',
      answer: 'Simply visit our homepage, browse the available rooms, select one that interests you, and click "Access Now" to begin your session.'
    },
    {
      question: 'How do I report an issue?',
      answer: 'You can report any issues by filling out the contact form on this page or by directly emailing us at contact.neobuddy@gmail.com.'
    }
  ];

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
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1 
            className="text-3xl font-bold mb-6 gradient-text text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Contact Us
          </motion.h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Contact Info & Form */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Contact Information */}
              <section className="bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-white">Contact Information</h2>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-xl mr-3">📧</span>
                    <a href="mailto:contact.neobuddy@gmail.com" className="text-blue-400 hover:underline">
                      contact.neobuddy@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xl mr-3">⏰</span>
                    <p className="text-gray-300">Support is available via email 24/7. We typically respond within 12–24 hours.</p>
                  </div>
                </div>
              </section>

              {/* Contact Form */}
              <section className="bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-white">Send Us a Message</h2>
                
                {submitSuccess ? (
                  <motion.div 
                    className="bg-green-800 text-white p-4 rounded-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p>Thank you for your message! We'll get back to you as soon as possible.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Field */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full bg-gray-700 border ${errors.name ? 'border-red-500' : 'border-gray-600'} rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Your name"
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Email Field */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full bg-gray-700 border ${errors.email ? 'border-red-500' : 'border-gray-600'} rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Your email address"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    {/* Subject Field */}
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`w-full bg-gray-700 border ${errors.subject ? 'border-red-500' : 'border-gray-600'} rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Message subject"
                      />
                      {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                    </div>

                    {/* Message Field */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">Message</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                        className={`w-full bg-gray-700 border ${errors.message ? 'border-red-500' : 'border-gray-600'} rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Your message"
                      ></textarea>
                      {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 disabled:opacity-70"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Sending...
                        </div>
                      ) : 'Send Message'}
                    </motion.button>

                    {submitError && (
                      <p className="text-red-500 text-sm mt-2">{submitError}</p>
                    )}
                  </form>
                )}
              </section>
            </motion.div>

            {/* Right Column - Social Media & FAQs */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* Social Media */}
              <section className="bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-white">Connect With Us</h2>
                <div className="text-center">
                  <p className="text-gray-300 mb-4">Our social media profiles are coming soon!</p>
                  <div className="flex justify-center space-x-4">
                    <motion.div 
                      className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 cursor-not-allowed"
                      whileHover={{ scale: 1.1 }}
                    >
                      <span className="text-xl">📷</span>
                    </motion.div>
                    <motion.div 
                      className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 cursor-not-allowed"
                      whileHover={{ scale: 1.1 }}
                    >
                      <span className="text-xl">🐦</span>
                    </motion.div>
                    <motion.div 
                      className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 cursor-not-allowed"
                      whileHover={{ scale: 1.1 }}
                    >
                      <span className="text-xl">💼</span>
                    </motion.div>
                    <motion.div 
                      className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 cursor-not-allowed"
                      whileHover={{ scale: 1.1 }}
                    >
                      <span className="text-xl">📺</span>
                    </motion.div>
                  </div>
                </div>
              </section>

              {/* FAQs */}
              <section className="bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-white">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {faqItems.map((item, index) => (
                    <motion.div 
                      key={index}
                      className="border border-gray-700 rounded-md overflow-hidden"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                    >
                      <div className="bg-gray-700 p-3">
                        <h3 className="text-white font-medium">{item.question}</h3>
                      </div>
                      <div className="p-3 bg-gray-750">
                        <p className="text-gray-300">{item.answer}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.div>
          </div>
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

export default ContactUs;