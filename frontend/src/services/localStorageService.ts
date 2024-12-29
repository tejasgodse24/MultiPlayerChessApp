

type Token = {
  access?: string; 
  refresh?: string;
};


const storeToken = ({access, refresh}: Token) => {
    if (access && refresh) {
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
    }
  }
  
  const getToken = ():Token => {
    let access_token = localStorage.getItem('access_token') || undefined
    let refresh_token = localStorage.getItem('refresh_token') || undefined
    return { access: access_token, refresh: refresh_token }
  }
  
  const removeToken = ():void => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }
  
  export { storeToken, getToken, removeToken }