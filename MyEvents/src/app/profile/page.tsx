"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Loading from '../../../components/Loading';
import {toast} from "react-toastify";

export default function Profil() {
    const { data: session, status } = useSession();
    const [editPseudo, setEditPseudo] = useState(false);
    const [editBio, setEditBio] = useState(false);
    const [editImg, setEditImg] = useState(false);
    const [userData, setUserData] = useState(null);
    const [pseudo, setPseudo] = useState('');
    const [bio, setBio] = useState('');
    const [avatarURL, setAvatarURL] = useState('');

    const handleEditPseudo = () => {
        setEditPseudo(!editPseudo);
    }

    const handleSubmitEditPseudo = (e) => {
        e.preventDefault();
        fetch('/api/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: session.userId, pseudo }), // Modifié ici
        })
            .then(response => response.json())
            .then(data => {
                toast.success('Pseudo modifié avec succès.');
                setUserData(prevState => ({ ...prevState, pseudo: data.pseudo }));
                setEditPseudo(false);
            })
            .catch(error => {
                toast.error('Erreur lors de la modification du pseudo.');
                console.error("Erreur lors de la mise à jour du pseudo:", error);
            });
    }

    const handleEditBio = () => {
        setEditBio(!editBio);
    }

    const handleSubmitEditBio = (e) => {
        e.preventDefault();
        fetch('/api/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: session.userId, bio }), // Modifié ici
        })
            .then(response => response.json())
            .then(data => {
                toast.success('Présentation modifiée avec succès.');
                setUserData(prevState => ({ ...prevState, bio: data.bio }));
                setEditBio(false);
            })
            .catch(error => {
                toast.error('Erreur lors de la modification de la présentation.');
                console.error("Erreur lors de la mise à jour de la bio:", error);
            });
    }

    const handleEditImg = () => {
        setEditImg(!editImg);
    }

    const handleSubmitAvatarChange = (e) => {
        e.preventDefault();
        fetch('/api/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: session.userId, customAvatarUrl: avatarURL }), // C'est déjà correct
        })
            .then(response => response.json())
            .then(data => {
                toast.success('Photo de profil modifiée avec succès.');
                setUserData(prevState => ({ ...prevState, customAvatarUrl: data.user.customAvatarUrl }));
                setEditImg(false);
            })

            .catch(error => {
                toast.error('Erreur lors de la modification de la photo de profil.');
                console.error("Erreur lors de la mise à jour de l'avatar:", error);
            });
    };

    const handleAvatarChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarURL(reader.result);
            }
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (session) {
            fetch(`/api/user?id=${session.userId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.customAvatarUrl) {
                        data.avatar = data.customAvatarUrl;
                    }
                    setUserData(data);
                });
        }
    }, [session]);


    if (status === "loading") {
        return <Loading />;
    }

    if (status === "authenticated") {
        return (
            <div className={"p-10"}>
                <div className={"event flex flex-col gap-4"}>
                    {userData && (
                        <div className={"flex gap-4"}>
                            {editImg && (
                                <div className={"modal"}>
                                    <form onSubmit={handleSubmitAvatarChange} className={"event flex flex-col align-center gap-05"}>
                                        <label className="flex text-xl align-center edit-input event-a">
                                            <input type="file" onChange={handleAvatarChange} style={{ display: 'none' }} />
                                            Choisir un fichier
                                        </label>
                                        <div className={"flex"}>
                                            <button className={"buttonpage align-baseline text-xl gap-05"}
                                                type={"submit"}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                                    viewBox="0 0 24 24">
                                                    <path fill="currentColor"
                                                        d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5l-5-5l1.41-1.41L11 12.67V3h2z" />
                                                </svg>
                                            </button>
                                            <button className={"buttonpage align-baseline text-xl gap-05 hover-red"}
                                                onClick={() => {
                                                    handleEditImg()
                                                }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                                    viewBox="0 0 24 24">
                                                    <path fill="currentColor"
                                                        d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10s10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zm3.59-13L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                            <div className={"edit-button"}>
                                <img className={"profile-img"} src={userData.customAvatarUrl ? userData.customAvatarUrl : session.user.image} alt={`Avatar de ${session.user.name}`} />
                                <button className={"display-button display-button-img align-baseline text-xl gap-05"}
                                    onClick={handleEditImg}>Éditer <svg
                                        xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                        viewBox="0 0 24 24">
                                        <path fill="none" stroke="currentColor" strokeLinecap="round"
                                            strokeLinejoin="round" strokeWidth="1.5"
                                            d="m5 16l-1 4l4-1L19.586 7.414a2 2 0 0 0 0-2.828l-.172-.172a2 2 0 0 0-2.828 0L5 16ZM15 6l3 3m-5 11h8" />
                                    </svg>
                                </button>
                            </div>
                            <div className={"flex flex-col gap-2"}>
                                <div className={"flex gap-05 align-baseline"}>
                                    <p className={"text-2xl"}>{userData.name}</p>
                                    {editPseudo ? (
                                        <div className={"flex gap-05"}>
                                            <form className={"flex gap-05"} onSubmit={handleSubmitEditPseudo}>
                                                <input className={"edit-input text-2xl text-gray"}
                                                    defaultValue={userData.pseudo ? userData.pseudo : pseudo}
                                                    onChange={(e) => {
                                                        setPseudo(e.target.value)
                                                    }} />
                                                <button className={"buttonpage align-baseline text-xl gap-05"}
                                                    type={"submit"}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                                        viewBox="0 0 24 24">
                                                        <path fill="currentColor"
                                                            d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5l-5-5l1.41-1.41L11 12.67V3h2z" />
                                                    </svg>
                                                </button>
                                                <button className={"buttonpage align-baseline text-xl gap-05 hover-red"}
                                                    onClick={() => {
                                                        handleEditPseudo()
                                                    }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                                        viewBox="0 0 24 24">
                                                        <path fill="currentColor"
                                                            d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10s10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zm3.59-13L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z" />
                                                    </svg>
                                                </button>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className={"edit-button flex gap-05 align-baseline"}>
                                            <p className={"text-2xl text-gray"}>{userData.pseudo ? userData.pseudo : pseudo}</p>
                                            <button className={"display-button align-baseline text-xl gap-05"}
                                                onClick={handleEditPseudo}>Éditer <svg
                                                    xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                                    viewBox="0 0 24 24">
                                                    <path fill="none" stroke="currentColor" strokeLinecap="round"
                                                        strokeLinejoin="round" strokeWidth="1.5"
                                                        d="m5 16l-1 4l4-1L19.586 7.414a2 2 0 0 0 0-2.828l-.172-.172a2 2 0 0 0-2.828 0L5 16ZM15 6l3 3m-5 11h8" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className={"flex flex-col gap-2"}>
                                    {editBio ? (
                                        <div className={"flex flex-col gap-05"}>
                                            <p>Présentation</p>
                                            <div className={"flex gap-05"}>
                                                <form className={"flex flex-col gap-05"} onSubmit={handleSubmitEditBio}>
                                                    <textarea className={"edit-input w-full b-none"} onChange={(e) => {
                                                        setBio(e.target.value)
                                                    }}>{userData.bio ? userData.bio : bio}</textarea>
                                                    <div className={"flex"}>
                                                        <button className={"buttonpage align-baseline gap-05"}
                                                            type={"submit"}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="20"
                                                                height="20"
                                                                viewBox="0 0 24 24">
                                                                <path fill="currentColor"
                                                                    d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5l-5-5l1.41-1.41L11 12.67V3h2z" />
                                                            </svg>
                                                        </button>
                                                        <button className={"buttonpage align-baseline gap-05 hover-red"}
                                                            onClick={() => {
                                                                handleEditBio()
                                                            }}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="20"
                                                                height="20"
                                                                viewBox="0 0 24 24">
                                                                <path fill="currentColor"
                                                                    d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10s10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zm3.59-13L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={"flex flex-col gap-05"}>
                                            <div className={"edit-button flex gap-05 align-baseline"}>
                                                <p>Présentation</p>
                                                <button className={"display-button align-baseline gap-05"}
                                                    onClick={handleEditBio}>Éditer <svg
                                                        xmlns="http://www.w3.org/2000/svg" width="10" height="10"
                                                        viewBox="0 0 24 24">
                                                        <path fill="none" stroke="currentColor" strokeLinecap="round"
                                                            strokeLinejoin="round" strokeWidth="1.5"
                                                            d="m5 16l-1 4l4-1L19.586 7.414a2 2 0 0 0 0-2.828l-.172-.172a2 2 0 0 0-2.828 0L5 16ZM15 6l3 3m-5 11h8" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <p>{userData.bio ? userData.bio : bio}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {userData && userData.outings && (
                        <>
                            <h2>Mes Sorties Organisées :</h2>
                            <div className={"flex flex-col gap-2 px-20"}>
                                {userData.outings.map(outing => (
                                    <div className={"event flex justify-between align-center"} key={outing.id}>
                                        <div className={"flex flex-col gap-1"}>
                                            <p className={"text-xl"}>{outing.eventName}</p>
                                        </div>
                                        <Link className={"button w-max h-max"} href={`/outings/${outing.id}`}>En savoir
                                            +</Link>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    {userData && userData.outingsJoined && (
                        <>
                            <h2>Je Participe À :</h2>
                            <div className={"flex flex-col gap-2 px-20"}>
                                {userData.outingsJoined
                                    .filter(participant => !userData.outings.find(outing => outing.id === participant.outing.id))
                                    .map(participant => (
                                        <div className={"event flex justify-between align-center"}
                                            key={participant.outing.id}>
                                            <p className={"text-xl"}>{participant.outing.eventName}</p>
                                            <Link href={`/outings/${participant.outing.id}`}
                                                className={"button w-max h-max"}>En savoir +</Link>
                                        </div>
                                    ))}
                            </div>
                        </>
                    )}
                </div>

            </div>
        );
    }

    return (
        <div className={"flex flex-col p-10"}>
            <div className={"event flex flex-col gap-2"}>
                <p>Pour voir votre profil, veuillez vous connecter.</p>
                <a className={"button w-max"} href="/api/auth/signin">Se connecter</a>
            </div>
        </div>
    );

}