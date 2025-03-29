import { useState } from "react";
import Button from "../components/Button";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { storeToken } from "../services/localStorageService";
import authService from "../services/authService";


const Login = () => {

    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState<any>(null);
    const [loading, setLoading] = useState(false);


    const handleChange = (e:any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        const response = await authService.normalLogin({
            username: formData.email, 
            email: formData.email, 
            password: formData.password
        });

      if (response.status === "true") {

        console.log(" Login successful!", response);
            console.log(response)
            storeToken({
              access: response.access,
              refresh: response.refresh,
            });
            navigate("/")

      } else {
        console.error("Login failed:", response.errorMsg);
        setError(response.errorMsg || "Login failed");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

    const reachGoogle = () => {
        const clientID = import.meta.env.VITE_GOOGLE_LOGIN_CLIENT_ID
        const callBackURI = import.meta.env.VITE_SOCIAL_LOGIN_CALLBACK_URI;
        console.log(clientID, callBackURI);
        
        window.location.replace(`https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${callBackURI}&prompt=consent&response_type=code&client_id=${clientID}&scope=openid%20email%20profile&access_type=offline`)
    }


  return (
    <div className="flex justify-center">
      <div className="pt-8 max-w-screen-md h-screen flex flex-col justify-start gap-16">
        <h1 className="text-4xl text-green-500 font-medium">
          Enter The Game World
        </h1>
        <div className="flex flex-col gap-4 items-center">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">

            <input
              className="w-full p-2 text-xl border-2 border-gray-300 focus:border-green-400 focus:outline-none rounded"
              type="text"
              name="email"
              placeholder="Username"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              className="w-full p-2 text-xl border-2 border-gray-300 focus:border-green-400 focus:outline-none rounded"
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />

            {error && <p className="text-red-500">{error}</p>}
            <button disabled={loading} className={`w-1/2 py-2 px-3 bg-green-500 hover:bg-green-700 text-2xl text-white font-bold rounded `}>
                {loading ? "Login..." : "Login"}
            </button>
            {/* <Button className="w-1/2 py-2 px-3" onClick={() => console.log("hello")}>
              Login
            </Button> */}

          </form>
          <div className="flex flex-col justify-center items-center">
            <p className="text-white">Not Registered Yet...</p>
            <span onClick={()=> navigate('/register')} className="text-green-500 cursor-pointer hover:text-green-700"> Register Now</span>
          </div>
          <div className="mt-8 flex flex-col gap-4 border-t-2 p-6 w-full items-center">

          <Button className="py-2 px-4 text-base w-4/5 flex justify-center gap-2 items-center" onClick={() => reachGoogle()}>
           <FaGoogle className="text-xl" />
            Sign In With Google
          </Button>
          <Button className="py-2 px-4 text-base w-4/5 flex justify-center gap-2 items-center" onClick={() => console.log("hello")}>
          <FaGithub className="text-xl" />
            Sign In With GitHub
          </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
