"use client";
import React, {useEffect, useState} from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import Loading from "./Loading";
const SigninButton = ({user}) => {
    const router = usePathname();
    const style = (href = '/') => {
        return router === href;
    }

    if (user) {
        return (
            <div className="">
                <Link href={'/profile'} className={`sidebar-item task-icon ${style('/profile') ? "task-icon-active" : ""}`}><img src={user.customAvatarUrl ? user.customAvatarUrl : user.avatar} alt={"photo de profil"} className={"task-img"}></img>{user.name}</Link>
                <button onClick={() => {
                    signOut();
                    window.location.href = '/';
                }} className="sidebar-item task-icon">
                    Se déconnecter
                </button>
            </div>
        );
    }
        return (
            <button onClick={() => signIn()} className="sidebar-item task-icon">
                Se connecter
            </button>
        );
};

export default SigninButton;