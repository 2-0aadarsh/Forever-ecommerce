import { useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { backendUrl } = useContext(ShopContext);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${backendUrl}/api/user/forgot-password`,
        { email }
      );

      if (response.data.success) {
        toast.success("OTP sent to your email");
        localStorage.setItem("resetEmail", email);
        navigate("/reset-password");
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to send OTP");
    }
  };

  return (
    <form onSubmit={handleSendOTP} className="max-w-sm mx-auto mt-16 space-y-4">
      <h2 className="text-xl font-semibold">Forgot Password</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your registered email"
        required
        className="w-full p-3 border rounded"
      />
      <button className="bg-black text-white px-4 py-2 w-full">Send OTP</button>
    </form>
  );
};

export default ForgotPassword;
