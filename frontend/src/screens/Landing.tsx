import React, { useEffect, useState } from "react";
import chessBoard from "../assets/chessboard.jpeg";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import queryString from "query-string";
import authService from "../services/authService";
import { getToken, storeToken } from "../services/localStorageService";
import { useDispatch } from "react-redux";
import { setUserTokens } from "../features/auth/authSlice";

const Landing = () => {
  const navigate = useNavigate();
  let location = useLocation();
  let values = queryString.parse(location.search);
  const dispatch = useDispatch();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchTokens = async () => {
      const response = await authService.googleLogin({
        code: values.code?.toString(),
      });

      if (response.status === "true") {
        console.log("Login successful!");

        storeToken({
          access: response.access_token,
          refresh: response.refresh_token,
        });

        dispatch(
          setUserTokens({
            access_token: response.access_token,
            refresh_token: response.refresh_token,
          })
        );

        setIsLoggedIn(true);

        
      } else {
        console.error("Login failed:", response.errormsg);
        setIsLoggedIn(false);
      }
    };

    if (values.code?.toString()) {
      fetchTokens();
    } else {
      const { access } = getToken();
      if (access) {
        setIsLoggedIn(true);
      }
    }
    return () => {};
  }, []);

  return (
    <div className="flex justify-center">
      <div className="pt-8 max-w-screen-md">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex justify-center">
            <img className="max-w-96" src={chessBoard} alt="" />
          </div>
          <div className="pt-16">
            <div className="flex justify-center">
              <h1 className="text-4xl text-white font-medium">
                Play Chess online
              </h1>
            </div>
            <div className="mt-4 flex justify-evenly p-2">
              {isLoggedIn ? (
                <Button className="py-4 px-6" onClick={() => { navigate("/game");}}>
                  Play Online
                </Button>
              ) : (
                <Button className="py-4 px-6" onClick={() => { navigate("/login"); }}>
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
