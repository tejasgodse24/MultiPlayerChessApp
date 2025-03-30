import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { storeToken } from "../services/localStorageService";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authService.normalRegister({
        username: formData.email,
        email: formData.email,
        password: "",
        password1: formData.password,
        password2: formData.password,
      });

      if (response.status === "true") {
        // console.log("register -- Login successful!", response);
        storeToken({
          access: response.access,
          refresh: response.refresh,
        });
        navigate("/");
      } else {
        console.error("Registration failed:", response.errorMsg);
        setError(response.errorMsg || "Registration failed");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="pt-8 max-w-screen-md min-h-screen flex flex-col justify-start gap-8 px-4">
        <h1 className="text-3xl sm:text-4xl text-green-500 font-medium">
          Enter The Game World
        </h1>
        <div className="flex flex-col gap-6 items-center w-full">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md items-center">
            <input
              className="w-full p-2 text-base sm:text-xl border-2 border-gray-300 focus:border-green-400 focus:outline-none rounded"
              type="text"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              className="w-full p-2 text-base sm:text-xl border-2 border-gray-300 focus:border-green-400 focus:outline-none rounded"
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />

            {error && <p className="text-red-500 text-sm sm:text-base">{error}</p>}
            <button
              disabled={loading}
              className="w-full sm:w-1/2 py-2 px-3 bg-green-500 hover:bg-green-700 text-xl sm:text-2xl text-white font-bold rounded"
            >
              {loading ? "Registering..." : "Register"}
            </button>
            <div className="flex flex-col justify-center items-center">
              <p className="text-white text-sm sm:text-base">If Registered...</p>
              <span
                onClick={() => navigate("/login")}
                className="text-green-500 cursor-pointer hover:text-green-700 text-sm sm:text-base"
              >
                Login Now
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
