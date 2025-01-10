import axios from "axios";

interface GoogleLoginParams {
  code?: string | null;
}

interface GoogleLoginResponse {
  status: "true" | "false";
  access_token?: string;
  refresh_token?: string;
  errormsg?: string;
}



export class AuthService {
  async googleLogin({ code }: GoogleLoginParams): Promise<GoogleLoginResponse> {
    if (!code) {
      console.error("Code is null or undefined. Cannot proceed with login.");
      return {status: "false", errormsg: "code is empty" };
    }

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify({ code: decodeURIComponent(code) });
    try { 
      const res = await axios.post(
        "http://localhost:8000/accounts/google/",
        body,
        config
      );

      return {status: "true", access_token: res.data.access, refresh_token: res.data.refresh };
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data || error.message);
        return {status: "false", errormsg: error.response?.data || error.message };
      } else {
        console.error("Unexpected error:", error);
        return {status: "false", errormsg: "Unexpected error" };
      }
    }
  }


  async verifyToken({ code }: GoogleLoginParams): Promise<GoogleLoginResponse> {
    if (!code) {
      console.error("Code is null or undefined. Cannot proceed with login.");
      return {status: "false", errormsg: "code is empty" };
    }

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify({ token: decodeURIComponent(code) });
    try { 
      const res = await axios.post(
        "http://localhost:8000/accounts/token/verify/",
        body,
        config
      );

      return {status: "true" };

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data || error.message);
        return {status: "false"};
      } else {
        console.error("Unexpected error:", error);
        return {status: "false", errormsg: "Unexpected error" };
      }
    }
  }
}

const authService = new AuthService();
export default authService;
