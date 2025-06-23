import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Navigate, useLocation } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const InputField = ({ value, onChange, type = "text", placeholder }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 transition"
    required
  />
);

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const location = useLocation();
  const fromVerification = new URLSearchParams(location.search).get(
    "fromVerify"
  );

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (currentState === "Sign Up") {
        const payload = {
          name,
          email,
          password,
          phone,
          address: { street, city, state, zip, country },
        };

        const response = await axios.post(
          `${backendUrl}/api/user/register`,
          payload
        );
        if (response.data.success) {
          localStorage.setItem("pendingEmail", email);
          toast.success("OTP sent to your email. Please verify.");
          navigate("/verify");
        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(`${backendUrl}/api/user/login`, {
          email,
          password,
        });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          navigate("/");
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong.");
    }
  };

  useEffect(() => {
    if (token && !fromVerification) navigate("/");
  }, [token, navigate, fromVerification]);

  if (token && !fromVerification) return <Navigate to="/" />;

  return (
    <form
      onSubmit={onSubmitHandler}
      className="max-w-4xl w-[95%] mx-auto mt-16 space-y-6 text-gray-800"
    >
      <div className="text-center">
        <h1 className="text-3xl font-semibold">{currentState}</h1>
        <p className="text-sm text-gray-500">
          {currentState === "Login" ? "Welcome back!" : "Create your account"}
        </p>
      </div>

      {currentState === "Sign Up" && (
        <div className="flex flex-col md:flex-row gap-6">
          {/* User Details */}
          <div className="flex-1 space-y-4">
            <p className="font-medium text-gray-700">User Info</p>
            <InputField
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
            />
            <InputField
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number"
            />
            <InputField
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email Address"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md pr-10 focus:outline-none focus:ring-1 focus:ring-gray-400"
                required
              />
              <div
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="flex-1 space-y-4">
            <p className="font-medium text-gray-700">Address</p>
            <InputField
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Street"
            />
            <div className="flex gap-3">
              <InputField
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
              />
              <InputField
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
              />
            </div>
            <div className="flex gap-3">
              <InputField
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="Zip Code"
              />
              <InputField
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Country"
              />
            </div>
          </div>
        </div>
      )}

      {currentState === "Login" && (
        <div className="space-y-4">
          <InputField
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email Address"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md pr-10 focus:outline-none focus:ring-1 focus:ring-gray-400"
              required
            />
            <div
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible size={20} />
              ) : (
                <AiOutlineEye size={20} />
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between text-sm text-gray-600">
        <button
          type="button"
          onClick={() => navigate("/forgot-password")}
          className="hover:underline"
        >
          Forgot password?
        </button>
        <button
          type="button"
          onClick={() =>
            setCurrentState(currentState === "Login" ? "Sign Up" : "Login")
          }
          className="hover:underline"
        >
          {currentState === "Login" ? "Create account" : "Login here"}
        </button>
      </div>

      <button
        type="submit"
        className="w-full py-2 rounded-md bg-gray-800 hover:bg-gray-900 text-white font-medium transition"
      >
        {currentState === "Login" ? "Sign In" : "Sign Up"}
      </button>
    </form>
  );
};

export default Login;
