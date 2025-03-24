import axios from "axios";

interface GoogleLoginParams {
  code?: string | null;
}

interface GoogleLoginResponse {
  status: "true" | "false";
  access_token?: string;
  refresh_token?: string;
  errormsg?: string;
  username?: string
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
        import.meta.env.VITE_GOOGLE_LOGIN_URL,
        body,
        config
      );
      console.log(res)
      return {status: "true", access_token: res.data.access, refresh_token: res.data.refresh, username: res.data.user.email };
      
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
        import.meta.env.VITE_VERIFY_TOKEN_URL,
        body,
        config
      );
      console.log(res.data)
      return {status: "true" , username: res.data.email};

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
