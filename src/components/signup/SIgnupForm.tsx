"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {API_BASE_URL} from "@/config/api";

const SignupForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username:"",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          username:formData.username,
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
      console.log("err",err)
      setError(err.message); // ✅ Now displays: "Email already exists. Please use a different email."
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600">
      <div className="bg-white p-10 rounded-lg shadow-2xl w-full sm:w-96 space-y-6">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-6">Create Your Account</h2>
        {error && <p className="text-red-500 text-center">{error}</p>} {/* ✅ Shows error message */}

        <form onSubmit={handleSubmit}>
        <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full p-4 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-4 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-4 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-4 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full p-4 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
          </div>
          <div className="mb-6 flex items-center">
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
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-lg shadow-lg hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
          <div className="text-center text-sm mt-4">
            <span className="text-gray-700">Already have an account? </span>
            <a onClick={() => router.push("/login")} className="text-blue-500 hover:underline cursor-pointer">
              Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
