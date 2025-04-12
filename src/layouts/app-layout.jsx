import Header from "@/components/header";
import {Outlet} from "react-router-dom"

const Applayout = () => {
  return (
    <div>
      <main className='min-h-screen container'>
        <Header/>
        <Outlet />
      </main>

      <div className="p-10 text-center bg-gray-800 mt-10">
        Made with love</div>
    </div>
  )
}

export default Applayout;
