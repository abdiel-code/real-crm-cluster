"use client";
import axios from "axios";
import { useState } from "react";
import Link from "next/link";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ type: "", msg: "" });
  const [isLoading, setIsLoading] = useState(false);

  const emailValidation = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      setMessage({ type: "Error", msg: "Email is required" });
      setIsLoading(false);
      return;
    }

    if (!emailValidation.test(email)) {
      setMessage({ type: "Error", msg: "Email is not valid" });
      return;
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
        { email },
      );

      setMessage({
        type: "Ok",
        msg: "If that email exists, you will receive a reset link shortly",
      });
    } catch {
      setMessage({
        type: "Error",
        msg: "There is an error on the server. Please, try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-grid flex items-center justify-center flex-col">
      <form
        onSubmit={handleSubmit}
        className="bg-[#00d4ff1a] backdrop-blur-xs rounded-md border-2 border-[#00d4ff40] hover:border-[#00d4ff80]
        hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] p-6 shadow-md flex flex-col items-center justify-center
        hover:backdrop-blur-sm text-white gap-[1rem] w-full max-w-md"
      >
        <h1 className="text-2xl">Forgot Password</h1>
        <p className="text-sm text-white/60 text-center">
          Enter your email and we'll send you a reset link.
        </p>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          maxLength={255}
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="pr-10 border-2 rounded hover:scale-105 focus:scale-105 focus:outline-none transition-all duration-300
          hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] focus:shadow-[0_0_20px_rgba(0,212,255,0.3)]"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="border-2 border-cyan-500 rounded p-2 cursor-pointer
          hover:shadow-[0_0_20px_rgba(0,212,255,0.5)]
          disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Sending..." : "Send Reset Link"}
        </button>
        {message.msg && (
          <p
            className={`text-sm ${message.type === "Error" ? "text-red-500" : "text-cyan-500"}`}
          >
            {message.msg}
          </p>
        )}
      </form>
      <p className="mt-3 text-white text-sm">
        Remember your password?{" "}
        <Link
          href="/login"
          className="text-cyan-500 hover:underline hover:text-cyan-400 transition-colors"
        >
          Login
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
