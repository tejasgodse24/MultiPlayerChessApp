import React from "react";
import Button from "../components/Button";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


const Login = () => {

    const navigate = useNavigate();

    const reachGoogle = () => {
        const clientID = encodeURIComponent("22097740984-mj9hc7l6ivgr7kr5v9111699094mck84.apps.googleusercontent.com");
        const callBackURI = encodeURIComponent("http://localhost:5173/");
        window.location.replace(`https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${callBackURI}&prompt=consent&response_type=code&client_id=${clientID}&scope=openid%20email%20profile&access_type=offline`)
    }


  return (
    <div className="flex justify-center">
      <div className="pt-8 max-w-screen-md h-screen flex flex-col justify-start gap-16">
        <h1 className="text-4xl text-green-500 font-medium">
          Enter The Game World
        </h1>
        <div className="flex flex-col gap-4 items-center">
          <input
            className="w-full p-2 text-xl border-2 border-gray-300 focus:border-green-400 focus:outline-none rounded"
            type="text"
            placeholder="Username"
          />
          <input
             className="w-full p-2 text-xl border-2 border-gray-300 focus:border-green-400 focus:outline-none rounded"
            type="password"
            placeholder="Password"
          />
          <Button className="w-1/2 py-2 px-3" onClick={() => console.log("hello")}>
            Login
          </Button>
          <div className="flex flex-col justify-center items-center">
            <p className="text-white">Not Registered Yet...</p>
            <span onClick={()=> navigate('/')} className="text-green-500 cursor-pointer hover:text-green-700"> Register Now</span>
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
