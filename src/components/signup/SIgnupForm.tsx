"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "@/config/api";
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
const SignupForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isValidUsername, setIsValidUsername] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    if (!formData.agreeToTerms) {
      setError("You must agree to the terms and conditions!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed"); // ✅ Display API error message
      }

      alert("Signup successful! Redirecting to login...");
      router.push("/login");
    } catch (err: any) {
      console.log("err", err)
      setError(err.message); // ✅ Now displays: "Email already exists. Please use a different email."
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkUsername = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/username`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.username, // Ensure formData is available
          }),
        });

        const data = await response.json();
        console.log(data)
        setUsernameError("");
        setIsValidUsername(true);

        if (!response.ok) {
          throw new Error(data.error || "Username check failed"); // ✅ Display API error message
        }

      } catch (err: any) {
        console.log("❌ Error:", err);
        setUsernameError(err.message);
        setIsValidUsername(false);
      }
    };

    checkUsername(); // Call the function inside useEffect
  }, [formData.username]); // ✅ Add dependency to only run when username changes


  const validateUsername = async (e: React.FormEvent) => { }

  console.log("formData", formData, usernameError)

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg space-y-6">
        {/* Heading Section */}
        <div className="relative text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text drop-shadow-xl tracking-tight leading-snug sm:leading-tight mb-6 sm:mb-8">
            Create Your Account
            <br className="hidden md:block" /> & Get Started!
          </h2>
  
          <svg
            className="absolute left-1/2 -translate-x-1/2 bottom-0 w-32 sm:w-44 md:w-60 h-5 sm:h-6 text-pink-500 animate-bounce"
            viewBox="0 0 200 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 20C30 5 70 30 100 10C130 -10 170 30 195 5"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>
  
        {/* Error Messages */}
        {error && <p className="text-red-500 text-center text-sm sm:text-base">{error}</p>}
        {usernameError && <p className="text-red-500 text-center text-sm sm:text-base">{usernameError}</p>}
  
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
              {isValidUsername && formData.username.trim() !== "" && (
                <VerifiedRoundedIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 text-lg sm:text-xl" />
              )}
            </div>
          </div>
  
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
  
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
  
          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
  
          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
  
          {/* Terms */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="agreeToTerms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
              I agree to the{" "}
              <span className="text-blue-500 underline">terms and conditions</span>
            </label>
          </div>
  
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white px-4 py-3 rounded-lg shadow-lg hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 text-sm sm:text-base"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
  
          {/* Login link */}
          <div className="text-center text-sm sm:text-base mt-2">
            <span className="text-gray-700">Already have an account? </span>
            <a
              onClick={() => router.push("/login")}
              className="text-blue-500 hover:underline cursor-pointer"
            >
              Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
  

};

export default SignupForm;
