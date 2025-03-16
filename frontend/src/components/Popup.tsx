import { Bounce, ToastContainer } from 'react-toastify'

const Popup = () => {

    
  return (
   
    // <ToastContainer
    //     position="top-right"
    //     autoClose={5000}
    //     hideProgressBar={false}
    //     newestOnTop
    //     closeOnClick={false}
    //     rtl={false}
    //     pauseOnFocusLoss
    //     draggable
    //     pauseOnHover
    //     theme="dark"
    //     transition={Bounce}
    // />
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      transition={Bounce}
    />
  )
}



export default Popup
