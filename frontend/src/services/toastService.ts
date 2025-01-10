
import { Bounce, toast } from 'react-toastify'


const showToast = (msg: string)=>{
    toast(msg, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Bounce,
      });
  }

  export default showToast