import { Bounce, ToastContainer } from 'react-toastify'

const Popup = () => {

    
  return (
   
    <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
    />
  )
}



export default Popup
