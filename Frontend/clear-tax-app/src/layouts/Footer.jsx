import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import labels from "../config/labels";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 w-full">
      <div className="w-full mx-auto px-6 md:px-10 lg:px-16">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Company Info */}
          <div>
            <img src="/pageLogo.png" alt="ClearTax Logo" className="w-40 mb-4" />
            <p className="text-sm text-gray-400">
              {labels.footer.description || "Your trusted platform for simplified tax management, amendments, and refunds."}
            </p>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-center gap-2">
                <FaMapMarkerAlt /> 123 Tax Avenue, Mumbai, India
              </li>
              <li className="flex items-center gap-2">
                <FaPhone /> <a href="tel:+1234567890" className="hover:text-gray-300">+91 9234 567 890</a>
              </li>
              <li className="flex items-center gap-2">
                <FaEnvelope /> <a href="mailto:support@cleartax.com" className="hover:text-gray-300">support@cleartax.com</a>
              </li>
            </ul>
          </div>

          {/* Quick Highlights */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Why Choose Us?</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>✔ Secure & fast tax processing</li>
              <li>✔ Automated tax calculations</li>
              <li>✔ Hassle-free amendments</li>
            </ul>
          </div>
          
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            {labels.footer.title || "© 2025 ClearTax. All rights reserved."}
          </p>

          {/* Social Media Icons */}
          <div className="flex space-x-6 mt-4 md:mt-0">
            {[
              { icon: FaFacebook, link: "#" },
              { icon: FaTwitter, link: "#" },
              { icon: FaInstagram, link: "#" },
              { icon: FaLinkedin, link: "#" },
            ].map(({ icon: Icon, link }) => (
              <motion.a 
                key={Icon} 
                href={link} 
                whileHover={{ scale: 1.1 }} 
                transition={{ duration: 0.3 }}
                className="hover:text-gray-400"
              >
                <Icon size={20} />
              </motion.a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
