"use client";

import axios from "axios";
import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";

const ResetPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const passwordInputRef = useRef<HTMLInputElement>(null);
  const [togglePassword, setTogglePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState({ type: "", msg: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!token) {
      setMessage({ type: "Error", msg: "Invalid or missing reset token." });
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setMessage({
        type: "Error",
        msg: "Password must be at least 8 characters",
      });
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
        { token, new_password: newPassword },
      );
      setMessage({
        type: "Ok",
        msg: "Password updated. Redirecting to login...",
      });
      setTimeout(() => router.push("/login"), 3000);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        const msg = error.response.data;
        if (msg === "TOKEN_EXPIRED") {
          setMessage({
            type: "Error",
            msg: "Reset link has expired. Please request a new one.",
          });
        } else {
          setMessage({ type: "Error", msg: "Invalid reset link." });
        }
      } else {
        setMessage({
          type: "Error",
          msg: "There is an error on the server. Please, try again.",
        });
      }
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
        <h1 className="text-2xl">Reset Password</h1>
        <p className="text-sm text-white/60 text-center">
          Enter your new password below.
        </p>
        <label htmlFor="password">New Password</label>
        <div className="relative">
          <input
            ref={passwordInputRef}
            type={togglePassword ? "text" : "password"}
            maxLength={30}
            id="password"
            name="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="pr-10 border-2 rounded hover:scale-105 focus:scale-105 focus:outline-none transition-all duration-300
            hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] focus:shadow-[0_0_20px_rgba(0,212,255,0.3)]"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            onClick={() => setTogglePassword(!togglePassword)}
          >
            {togglePassword ? <FaEye /> : <FaEyeSlash />}
          </button>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="border-2 border-cyan-500 rounded p-2 cursor-pointer
          hover:shadow-[0_0_20px_rgba(0,212,255,0.5)]
          disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Updating..." : "Reset Password"}
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

export default ResetPassword;
