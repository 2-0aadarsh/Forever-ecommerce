// src/pages/Login.jsx
import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

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

  const onSubmitHandler = async (event) => {
    event.preventDefault();
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
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {currentState === "Sign Up" && (
        <>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            placeholder="Name"
            className="w-full px-3 py-2 border border-gray-800"
            required
          />
          <input
            onChange={(e) => setPhone(e.target.value)}
            value={phone}
            type="text"
            placeholder="Phone Number"
            className="w-full px-3 py-2 border border-gray-800"
            required
          />
        </>
      )}

      <input
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        type="email"
        placeholder="Email"
        className="w-full px-3 py-2 border border-gray-800"
        required
      />
      <input
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        type="password"
        placeholder="Password"
        className="w-full px-3 py-2 border border-gray-800"
        required
      />

      {currentState === "Sign Up" && (
        <>
          <input
            onChange={(e) => setStreet(e.target.value)}
            value={street}
            type="text"
            placeholder="Street"
            className="w-full px-3 py-2 border border-gray-800"
          />
          <input
            onChange={(e) => setCity(e.target.value)}
            value={city}
            type="text"
            placeholder="City"
            className="w-full px-3 py-2 border border-gray-800"
          />
          <input
            onChange={(e) => setState(e.target.value)}
            value={state}
            type="text"
            placeholder="State"
            className="w-full px-3 py-2 border border-gray-800"
          />
          <input
            onChange={(e) => setZip(e.target.value)}
            value={zip}
            type="text"
            placeholder="Zip Code"
            className="w-full px-3 py-2 border border-gray-800"
          />
          <input
            onChange={(e) => setCountry(e.target.value)}
            value={country}
            type="text"
            placeholder="Country"
            className="w-full px-3 py-2 border border-gray-800"
          />
        </>
      )}

      <div className="w-full flex justify-between text-sm mt-[-8px]">
        <p className=" cursor-pointer">Forgot your password?</p>
        {currentState === "Login" ? (
          <p
            onClick={() => setCurrentState("Sign Up")}
            className=" cursor-pointer"
          >
            Create account
          </p>
        ) : (
          <p
            onClick={() => setCurrentState("Login")}
            className=" cursor-pointer"
          >
            Login Here
          </p>
        )}
      </div>

      <button className="bg-black text-white font-light px-8 py-2 mt-4">
        {currentState === "Login" ? "Sign In" : "Sign Up"}
      </button>
    </form>
  );
};

export default Login;
