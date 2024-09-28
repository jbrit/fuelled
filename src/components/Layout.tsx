import { Toaster } from "react-hot-toast";
import { Navbar } from "./Navbar";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Toaster />
      <div className="flex flex-col px-12 bg-black text-white">
        <div className="min-h-screen py-4 flex flex-col gap-6">
          <Navbar />
          <div className="p-12">{children}</div>
          <footer className="mt-auto">&copy; fuelled.cash 2024</footer>
        </div>
      </div>
    </>
  );
};
