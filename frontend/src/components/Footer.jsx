import { useNavigate, useLocation } from "react-router-dom";
import { assets } from "../assets/assets";
import {
  FaInstagram,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const companyLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Collections", path: "/collection" },
  ];

  const policyLinks = [
    { name: "Shipping Policy", path: "/shipping" },
    { name: "Returns & Exchanges", path: "/returns" },
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
  ];

  const contactInfo = {
    phone: "+91 8210508119",
    email: "contact@foreveryou.com",
  };

  const socialMedia = [
    { icon: <FaInstagram />, url: "#" },
    { icon: <FaFacebookF />, url: "#" },
    { icon: <FaTwitter />, url: "#" },
    { icon: <FaLinkedinIn />, url: "#" },
  ];

  const handleNavClick = (path) => {
    if (location.pathname === path) {
      scrollToTop();
    } else {
      navigate(path);
    }
  };

  return (
    <footer className="bg-white text-gray-700 border-t border-gray-200 ">
      <div className="max-w-screen-xl mx-auto px-6 sm:px-10 py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="sm:col-span-2">
          <img src={assets.logo} className="w-28 mb-4" alt="Forever You Logo" />
          <p className="text-sm text-gray-600 leading-relaxed mb-5 max-w-md">
            Timeless elegance, crafted with care. Forever You delivers
            confidence, comfort, and style that lasts.
          </p>

          {/* Social Icons */}
          <div className="flex space-x-4 mt-2">
            {socialMedia.map((item, index) => (
              <a
                key={index}
                href={item.url}
                className="text-gray-500 hover:text-black transition-all duration-200 border border-gray-300 p-2 rounded-full"
              >
                <span className="text-[14px]">{item.icon}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-sm uppercase font-semibold text-gray-800 mb-4 tracking-wide">
            Company
          </h4>
          <ul className="space-y-3 text-sm text-gray-600">
            {companyLinks.map((link, index) => (
              <li key={index}>
                <button
                  onClick={() => handleNavClick(link.path)}
                  className="hover:text-black transition-colors text-left w-full"
                >
                  {link.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Policies */}
        <div>
          <h4 className="text-sm uppercase font-semibold text-gray-800 mb-4 tracking-wide">
            Policies
          </h4>
          <ul className="space-y-3 text-sm text-gray-600">
            {policyLinks.map((link, index) => (
              <li key={index}>
                <button
                  onClick={() => handleNavClick(link.path)}
                  className="hover:text-black transition-colors text-left w-full"
                >
                  {link.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="sm:col-span-2 md:col-span-1">
          <h4 className="text-sm uppercase font-semibold text-gray-800 mb-4 tracking-wide">
            Contact Us
          </h4>
          <ul className="space-y-3 text-sm text-gray-600">
            <li>
              <a
                href={`tel:${contactInfo.phone}`}
                className="hover:text-black transition-colors"
              >
                {contactInfo.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${contactInfo.email}`}
                className="hover:text-black transition-colors"
              >
                {contactInfo.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200">
        <div className="max-w-screen-xl mx-auto px-6 py-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Forever You — All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
