// import React from 'react'
// import { useContext } from 'react'
// import { ShopContext } from '../context/ShopContext'
// import { useSearchParams } from 'react-router-dom'
// import { useEffect } from 'react'
// import {toast} from 'react-toastify'
// import axios from 'axios'

// const Verify = () => {

//     const { navigate, token, setCartItems, backendUrl } = useContext(ShopContext)
//     const [searchParams, setSearchParams] = useSearchParams()
    
//     const success = searchParams.get('success')
//     const orderId = searchParams.get('orderId')

//     const verifyPayment = async () => {
//         try {

//             if (!token) {
//                 return null
//             }

//             const response = await axios.post(backendUrl + '/api/order/verifyStripe', { success, orderId }, { headers: { token } })

//             if (response.data.success) {
//                 setCartItems({})
//                 navigate('/orders')
//             } else {
//                 navigate('/cart')
//             }

//         } catch (error) {
//             console.log(error)
//             toast.error(error.message)
//         }
//     }

//     useEffect(() => {
//         verifyPayment()
//     }, [token])

//     return (
//         <div>

//         </div>
//     )
// }

// export default Verify



// src/pages/Verify.jsx
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";

const Verify = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const { setToken, backendUrl } = useContext(ShopContext);
  const navigate = useNavigate();

  useEffect(() => {
    const emailFromStorage = localStorage.getItem("pendingEmail");
    if (!emailFromStorage) {
      navigate("/login");
    } else {
      setEmail(emailFromStorage);
    }
  }, [navigate]);

  const handleVerify = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/user/verify`, {
        email,
        otp,
      });

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.removeItem("pendingEmail");
        setToken(response.data.token);
        toast.success("Verified successfully!");
        navigate("/");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("OTP verification failed");
    }
  };

  return (
    <div className="flex flex-col items-center mt-24 gap-4 text-gray-700">
      <h2 className="text-2xl font-semibold">Email Verification</h2>
      <p className="text-sm">Enter the OTP sent to <strong>{email}</strong></p>
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="border px-4 py-2 rounded w-60"
      />
      <button onClick={handleVerify} className="bg-black text-white px-6 py-2 rounded">
        Verify OTP
      </button>
    </div>
  );
};

export default Verify;
