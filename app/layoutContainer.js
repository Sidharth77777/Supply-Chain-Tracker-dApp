import { Web3Provider } from "./context/Web3Context";
import Header from "./_components/Header";
import { Toaster } from "sonner";

export default function LayOutContainer({ children }) {
  return (
    <Web3Provider>
      <Header />
      {children}
      <Toaster position="top-right" richColors />
    </Web3Provider>
  );
}
