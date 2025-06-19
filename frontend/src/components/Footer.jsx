import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const companyLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Delivery", path: "/delivery" },
    { name: "Privacy Policy", path: "/privacy-policy" },
  ];

  const contactInfo = {
    phone: "+91 8210508119",
    email: "contact@foreveryou.com",
  };

  return (
    <footer className="bg-white text-gray-700">
      <div className="max-w-screen-xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">
        {/* Brand & Description */}
        <div>
          <img src={assets.logo} className="mb-5 w-32" alt="Forever You Logo" />
          <p className="max-w-md text-sm text-gray-600 leading-relaxed">
            Forever You is committed to providing timeless style with unmatched
            quality. Our mission is to make you feel confident and elegant—every
            day, every era.
          </p>
        </div>

        {/* Company Links */}
        <div>
          <h4 className="text-xl font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            {companyLinks.map((link, index) => (
              <li key={index}>
                <Link
                  to={link.path}
                  onClick={scrollToTop}
                  className="hover:text-black transition duration-300"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-xl font-semibold mb-4">Get In Touch</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={`tel:${contactInfo.phone}`} className="hover:text-black">
                {contactInfo.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${contactInfo.email}`}
                className="hover:text-black"
              >
                {contactInfo.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="border-t">
        <p className="py-4 text-center text-xs text-gray-500">
          © 2024 Forever You — All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
