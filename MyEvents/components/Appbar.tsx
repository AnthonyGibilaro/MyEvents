"use client";
import React, {useState, useEffect, useRef} from "react";
import SigninButton from "./SigninButton";
import Image from "next/image";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useSession} from "next-auth/react";
import Loading from "./Loading";

const Appbar = () => {
    const router = usePathname();
    const [headerOpen, setHeaderOpen] = useState(false);
    const headerRef = useRef(null);
    const { data: session, status } = useSession();
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        if (session) {
            fetch(`/api/user?id=${session.userId}`)
                .then((response) => response.json())
                .then((data) => {
                    setUserData(data);
                })
                .catch((error) => {
                    console.error("Erreur lors de la requête fetch :", error);
                });
        }
    }, [session]);

    const style = (href = '/') => {
        return router === href;
    }

    const handleHeader = () => {
        setHeaderOpen(!headerOpen);
    }

    const closeHeader = () => {
        setHeaderOpen(false);
    }

    useEffect(() => {
            function handleClickOutside(e) {
                if (headerRef.current && !headerRef.current.contains(e.target)) {
                    setHeaderOpen(false);
                }
            }

            document.addEventListener("click", handleClickOutside);

            return () => {
                document.removeEventListener("click", handleClickOutside);
            };
    }, [headerOpen]);

    if (status === "loading") {
        return <Loading />;
    }

    return (
        <header className="bg-gray px-20 items-center flex justify-between">
            <Link href={`/`} className="task-icon">
                <Image priority={true} src="/my_events.png" width={60} height={60} alt="My_events logo" />
            </Link>
            <button onClick={handleHeader} className="sidebar-menu">
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24">
                    <path fill="currentColor" fillRule="evenodd"
                          d="M8 7a4 4 0 1 1 8 0a4 4 0 0 1-8 0Zm0 6a5 5 0 0 0-5 5a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3a5 5 0 0 0-5-5H8Z"
                          clipRule="evenodd" />
                </svg>
            </button>
            {headerOpen && (
                <div ref={headerRef} className="bg-gray flex flex-col justify-between sidebar h-full">
                    <div className="flex flex-col gap-2 h-full w-full">
                        <button onClick={handleHeader} className="sidebar-menu">
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
                                <path fill="currentColor" fillRule="evenodd"
                                      d="M8 7a4 4 0 1 1 8 0a4 4 0 0 1-8 0Zm0 6a5 5 0 0 0-5 5a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3a5 5 0 0 0-5-5H8Z"
                                      clipRule="evenodd" />
                            </svg>
                        </button>
                        <Link onClick={closeHeader} href={`/`} className={`task-icons task-icon ${style('/') ? "task-icon-active" : ""}`}>Accueil</Link>
                        <Link onClick={closeHeader} href={`/outings`} className={`task-icons task-icon ${style('/outlings') ? "task-icon-active" : ""}`}>Sorties</Link>
                        <Link onClick={closeHeader} href={`/users`} className={`task-icons task-icon ${style('/users') ? "task-icon-active" : ""}`}>Utilisateurs</Link>
                    </div>
                    <SigninButton user={userData ? userData : session?.user}/>
                </div>
            )}
        </header>
    );
}

export default Appbar;
