"use client";
import { useRef, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import axios from "axios";

const Login = () => {
  const router = useRouter();
  const passwordInputRef = useRef(null);
  const [togglePassword, setTogglePassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState({
    type: "",
    msg: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const emailValidation = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // Validate information
    e.preventDefault();

    setIsLoading(true);
    if (!formData.email || !formData.password) {
      console.log("No data");
      setMessage({
        type: "Error",
        msg: "All fields must be filled and meet the requirements",
      });

      setTimeout(() => {
        setMessage({ type: "", msg: "" });
      }, 3000);
      return;
    }

    const valid = emailValidation.test(formData.email);

    if (!valid) {
      setMessage({
        type: "Error",
        msg: "Email is not valid",
      });

      setTimeout(() => {
        setMessage({ type: "", msg: "" });
      }, 3000);
      return;
    }

    // Send request to server

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        formData,
        {
          withCredentials: true,
        },
      );

      // Redirecting to Dashboard
      setMessage({
        type: "Ok",
        msg: "Login successful. Redirecting to your Dashboard",
      });

      setTimeout(() => {
        setMessage({ type: "", msg: "" });
        router.push("/dashboard");
      }, 3000);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setMessage({
          type: "Error",
          msg: "Invalid email or password",
        });
      } else {
        setMessage({
          type: "Error",
          msg: "There is an error on the server. Please, try again.",
        });
      }
      setTimeout(() => {
        setMessage({ type: "", msg: "" });
      }, 3000);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-grid flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-[#00d4ff1a] backdrop-blur-xs rounded-md border-2 border-[#00d4ff40] hover:border-[#00d4ff80] 
      hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] p-6 shadow-md flex flex-col items-center justify-center 
      hover:backdrop-blur-sm text-white gap-[1rem] w-full max-w-md"
      >
        <h1 className="text-2xl">Login</h1>

        <label htmlFor="email">Email</label>
        <input
          type="text"
          maxLength={255}
          id="email"
          name="email"
          className="pr-10 border-2 rounded hover:scale-105 focus:scale-105 focus:outline-none transition-all duration-300 
          hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] focus:shadow-[0_0_20px_rgba(0,212,255,0.3)]"
          onChange={handleChange}
        />

        <div className="flex flex-col justify-center items-center gap-[1rem]">
          <label htmlFor="password">Password</label>
          <div className="relative">
            <input
              ref={passwordInputRef}
              type={togglePassword ? "text" : "password"}
              maxLength={30}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="pr-10 border-2 rounded hover:scale-105 focus:scale-105 focus:outline-none transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] focus:shadow-[0_0_20px_rgba(0,212,255,0.3)]"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              onClick={() => {
                setTogglePassword(!togglePassword);
              }}
            >
              {togglePassword ? <FaEye></FaEye> : <FaEyeSlash></FaEyeSlash>}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="border-2 border-cyan-500 rounded p-2 cursor-pointer 
  hover:shadow-[0_0_20px_rgba(0,255,0,0.3)] 
  disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Loading..." : "Login"}
        </button>

        {message.msg && (
          <p
            className={`${message.type === "Error" ? "text-red-500" : "text-cyan-500"}`}
          >
            {message.msg}
          </p>
        )}
      </form>
    </div>
  );
};

export default Login;
