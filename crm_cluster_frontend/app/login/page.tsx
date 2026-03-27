"use client";
import { useRef, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";

const Login = () => {
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

  const emailValidation = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validations = {
    length: formData.password.length >= 8,
    lowercase: /[a-z]/.test(formData.password),
    uppercase: /[A-Z]/.test(formData.password),
    number: /\d/.test(formData.password),
    symbol: /[*/&$@!,]/.test(formData.password),
  };

  const isValid = Object.values(validations).every(Boolean);
  const score = Object.values(validations).filter(Boolean).length;

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

      console.log(res.data);
    } catch (error) {
      setMessage({
        type: "Error",
        msg: `There is an error on the server. Please, try again.`,
      });
      console.log(error);
      setTimeout(() => {
        setMessage({ type: "", msg: "" });
      }, 3000);
      return;
    }

    setMessage({
      type: "Ok",
      msg: "Login successful. Redirecting to your Dashboard",
    });

    setTimeout(() => {
      setMessage({ type: "", msg: "" });
    }, 3000);
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
              className={`pr-10 border-2 rounded hover:scale-105 focus:scale-105 focus:outline-none transition-all duration-300            
           ${
             formData.password.length > 0
               ? isValid
                 ? "border-green-500 "
                 : "border-red-500 hover:shadow-[0_0_20px_rgba(255,0,0,0.3)] focus:shadow-[0_0_20px_rgba(255,0,0,0.3)]"
               : "border-white hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] focus:shadow-[0_0_20px_rgba(0,212,255,0.3)]"
           }
          `}
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
          className="border-2 border-cyan-500 rounded p-2 cursor-pointer hover:shadow-[0_0_20px_rgba(0,255,0,0.3)]"
        >
          Submit
        </button>

        {formData.password.length > 0 && (
          <div className="w-full flex flex-col items-center gap-2">
            <div className="flex gap-1 w-full">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded transition-all duration-300 ${
                    score > i
                      ? i === 0
                        ? "bg-red-500"
                        : i === 1
                          ? "bg-orange-500"
                          : i === 2
                            ? "bg-yellow-500"
                            : i === 3
                              ? "bg-green-500"
                              : "bg-cyan-500"
                      : "bg-gray-700"
                  }`}
                />
              ))}
            </div>

            <p
              className={`text-center text-sm ${
                score <= 2
                  ? "text-red-500"
                  : score === 3
                    ? "text-orange-500"
                    : score === 4
                      ? "text-yellow-500"
                      : "text-cyan-500"
              }`}
            >
              {score <= 2
                ? "Weak"
                : score === 3
                  ? "Okay"
                  : score === 4
                    ? "Good"
                    : "Strong"}
            </p>
          </div>
        )}

        {formData.password.length > 0 && !isValid && (
          <span className="text-orange-600 text-center text-sm mt-[1rem]">
            Password must have 8+ chars, uppercase, lowercase, number and symbol
            (*/&$@!,)
          </span>
        )}

        {isValid && (
          <span className="text-green-500 text-sm ">Password is valid</span>
        )}

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
