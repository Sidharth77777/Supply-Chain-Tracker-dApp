"use client"

import DashBoard from "./_components/Dashboard";
import LandingPage from "./_components/LandingPage";
import { useWeb3 } from "./context/Web3Context"

export default function Home() {
  const {account, contract} = useWeb3();
  
  return (
    <div>
      
      {!account ?
        <LandingPage />
      : <div className="sm:p-10 lg:p-20 p-5">
        <DashBoard />
      </div>  
      }

    </div>
  )
}