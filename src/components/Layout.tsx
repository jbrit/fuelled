import { Toaster } from "react-hot-toast";
import { Navbar } from "./Navbar";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Toaster />
      <div className="flex flex-col px-4 lg:px-12 bg-black text-white">
        <div className="min-h-screen py-4 flex flex-col gap-6">
          <Navbar />
          <div className="xl:p-12">{children}</div>
          <footer className="mt-auto flex justify-between items-center">
            <p>&copy; fuelled.cash 2024</p>
            <a
              href="https://x.com/fuelleddotcash"
              target="_blank"
              className="no-underline hover:text-fuel-green hover:underline"
            >
              Twitter
            </a>
          </footer>
        </div>
      </div>
    </>
  );
};
