import { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const { setShowSearch, getCartCount, token, setToken, setCartItems } =
    useContext(ShopContext);

  const navigate = useNavigate();
  const location = useLocation();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigation = (path) => {
    if (location.pathname === path) {
      scrollToTop();
    } else {
      navigate(path);
    }
    setVisible(false);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setCartItems({});
    navigate("/login");
  };

  const navItems = [
    { name: "HOME", path: "/" },
    { name: "COLLECTION", path: "/collection" },
    { name: "ABOUT", path: "/about" },
    { name: "CONTACT", path: "/contact" },
  ];

  return (
    <nav className="flex items-center justify-between py-5 font-medium relative z-50">
      {/* Logo */}
      <img
        src={assets.logo}
        alt="Forever You Logo"
        className="w-36 cursor-pointer"
        onClick={() => handleNavigation("/")}
      />

      {/* Desktop Menu */}
      <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
        {navItems.map((item, index) => (
          <li
            key={index}
            className="flex flex-col items-center gap-1 cursor-pointer hover:text-black"
            onClick={() => handleNavigation(item.path)}
          >
            <p>{item.name}</p>
          </li>
        ))}
      </ul>

      {/* Right Icons */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <img
          onClick={() => {
            setShowSearch(true);
            handleNavigation("/collection");
          }}
          src={assets.search_icon}
          className="w-5 cursor-pointer"
          alt="Search"
        />

        {/* Profile Dropdown */}
        <div className="group relative">
          <img
            onClick={() => !token && navigate("/login")}
            className="w-5 cursor-pointer"
            src={assets.profile_icon}
            alt="Profile"
          />
          {token && (
            <div className="group-hover:block hidden absolute right-0 pt-4 z-10">
              <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded shadow-md">
                <p
                  onClick={() => handleNavigation("/profile")}
                  className="cursor-pointer hover:text-black"
                >
                  My Profile
                </p>
                <p
                  onClick={() => handleNavigation("/orders")}
                  className="cursor-pointer hover:text-black"
                >
                  Orders
                </p>
                <p onClick={logout} className="cursor-pointer hover:text-black">
                  Logout
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Cart */}
        <Link to="/cart" onClick={scrollToTop} className="relative">
          <img src={assets.cart_icon} className="w-5 min-w-5" alt="Cart" />
          <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
            {getCartCount()}
          </p>
        </Link>

        {/* Hamburger Menu */}
        <img
          onClick={() => setVisible(true)}
          src={assets.menu_icon}
          className="w-5 cursor-pointer sm:hidden"
          alt="Menu"
        />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 right-0 bottom-0 bg-white transition-all duration-300 ease-in-out z-40 ${
          visible ? "w-full max-w-[260px]" : "w-0"
        } overflow-hidden shadow-lg`}
      >
        <div className="flex flex-col text-gray-600 h-full">
          {/* Close Button */}
          <div
            onClick={() => setVisible(false)}
            className="flex items-center gap-4 p-4 cursor-pointer border-b"
          >
            <img
              className="h-4 rotate-180"
              src={assets.dropdown_icon}
              alt="Back"
            />
            <p>Back</p>
          </div>

          {/* Nav Items */}
          {navItems.map((item, index) => (
            <p
              key={index}
              onClick={() => handleNavigation(item.path)}
              className="py-3 pl-6 border-b cursor-pointer hover:text-black"
            >
              {item.name}
            </p>
          ))}

          {/* Mobile Logout */}
          {token && (
            <>
              <p
                onClick={() => handleNavigation("/profile")}
                className="py-3 pl-6 border-b cursor-pointer hover:text-black"
              >
                My Profile
              </p>
              <p
                onClick={() => handleNavigation("/orders")}
                className="py-3 pl-6 border-b cursor-pointer hover:text-black"
              >
                Orders
              </p>
              <p
                onClick={logout}
                className="py-3 pl-6 border-b cursor-pointer hover:text-black"
              >
                Logout
              </p>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;