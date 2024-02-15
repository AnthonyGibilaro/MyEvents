import Appbar from "../../components/Appbar";
import Providers from "../../components/SessionProviderWrapper";
import "./globals.css";
import { Inter } from "next/font/google";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import React from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "My_events",
  description: "My_events créé par Anthony GIBILARO et Lucas EMILE",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>
            <ToastContainer
                position="top-center"
                autoClose={2700}
                hideProgressBar
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
          <Appbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}