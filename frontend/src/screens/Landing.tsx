import { useEffect, useState } from "react";
import chessBoard from "../assets/chessboard.jpeg";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import queryString from "query-string";
import authService from "../services/authService";
import { getToken, storeToken } from "../services/localStorageService";
import { useDispatch } from "react-redux";
import { setUserTokens, setUserName } from "../features/auth/authSlice";

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
        // console.log("Login successful!", response);
        storeToken({
          access: response.access_token,
          refresh: response.refresh_token,
        });

        dispatch(
          setUserTokens({
            access_token: response.access_token,
            refresh_token: response.refresh_token,
            username: response.username,
          })
        );

        setIsLoggedIn(true);
      } else {
        // console.error("Login failed:", response.errormsg);
        setIsLoggedIn(false);
      }
    };

    const checkToken = async () => {
      if (values.code?.toString()) {
        fetchTokens();
      } else {
        const { access } = getToken();
        if (access) {
          const res = await authService.verifyToken({ code: access });
          if (res.status === "true") {
            setIsLoggedIn(true);
            dispatch(
              setUserName({
                username: res.username,
              })
            );
          } else {
            navigate("/login");
          }
        }
      }
    };

    checkToken();
  }, [dispatch, navigate, values.code]);

  return (
    <div className="flex justify-center">
      <div className="pt-4 md:pt-8 max-w-screen-lg px-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-center">
          <div className="flex justify-center">
            <img className="w-72 md:w-96" src={chessBoard} alt="Chess board" />
          </div>
          <div className="pt-8 md:pt-16">
            <div className="flex justify-center">
              <h1 className="text-3xl md:text-4xl text-white font-medium">
                Play Chess Online
              </h1>
            </div>
            <div className="mt-4 flex flex-col md:flex-row justify-evenly items-center gap-4">
              {isLoggedIn ? (
                <Button
                  className="py-3 px-4 md:py-4 md:px-6 text-lg md:text-xl"
                  onClick={() => {
                    navigate("/game");
                  }}
                >
                  Play
                </Button>
              ) : (
                <Button
                  className="py-3 px-4 md:py-4 md:px-6 text-lg md:text-xl"
                  onClick={() => {
                    navigate("/login");
                  }}
                >
                  Login
                </Button>
              )}
              <Button
                className="py-3 px-4 md:py-4 md:px-6 text-lg md:text-xl"
                onClick={() => {
                  navigate("/listgames");
                }}
              >
                Watch Ongoing Games
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
