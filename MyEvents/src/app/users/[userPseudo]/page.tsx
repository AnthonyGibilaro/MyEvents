"use client"
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Loading from "../../../../components/Loading";

interface User {
    name: string;
    pseudo: string;
    avatar: string;
    customAvatarUrl?: string;
    bio: string;
}

interface APIState {
    isLoading: boolean;
    user: User | null;
    error: string | null;
}

function ProfilePage({ params }: { params: { userPseudo: string } }) {

    const [apiState, setApiState] = useState<APIState>({
        isLoading: true,
        user: null,
        error: null,
    });

    useEffect(() => {
        if (params.userPseudo) {
            fetch(`http://localhost:3000/api/users/${params.userPseudo}`)
                .then(response => response.json())
                .then(user => {
                    setApiState({
                        isLoading: false,
                        user,
                        error: null,
                    });
                })
                .catch(error => {
                    setApiState({
                        isLoading: false,
                        user: null,
                        error: error.message,
                    });
                });
        }
    }, [params.userPseudo]);

    if (apiState.isLoading) {
        return <Loading />;
    }

    if (apiState.error) {
        return (
            <div className={"flex flex-col p-10"}>
                <div className={"event flex flex-col gap-2"}>
                    <p>Profil non trouvé.</p>
                    <a className={"button w-max"} href="/">Retour à l'accueil</a>
                </div>
            </div>
        )
    }

    if (!apiState.user) {
        return (
            <div className={"flex flex-col p-10"}>
                <div className={"event flex flex-col gap-2"}>
                    <p>Profil non trouvé.</p>
                    <a className={"button w-max"} href="/">Retour à l'accueil</a>
                </div>
            </div>
        )
    }

    return (
        <div className={"p-10"}>
            <div className={"event flex flex-col gap-4"}>
                <div className={"flex gap-4"}>
                    <img className={"profile-img"} src={apiState.user.customAvatarUrl ? apiState.user.customAvatarUrl : apiState.user.avatar} alt={`Avatar de ${apiState.user.pseudo}`} />
                    <div className={"flex flex-col gap-2"}>
                        <p className={"text-2xl"}>{apiState.user.pseudo}</p>
                        <div className={"flex flex-col gap-05"}>
                            <p>Présentation</p>
                            <p>{apiState.user.bio}</p>
                        </div>
                    </div>
                </div>

                {apiState.user.outings && apiState.user.outings.length > 0 && (
                    <>
                        <h2>Sorties organisées :</h2>
                        <div className={"flex flex-col gap-2 px-20"}>
                            {apiState.user.outings.map(outing => (
                                <div className={"event flex justify-between align-center"} key={outing.id}>
                                    <p className={"text-xl"}>{outing.eventName}</p>
                                    <div className={"flex flex-col gap-1"}>
                                        <Link className={"button w-max h-max"} href={`/outings/${outing.id}`}>En savoir
                                            +</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                {apiState.user.outingsJoined && apiState.user.outingsJoined.length > 0 && (
                    <>
                        <h2>Sorties rejointes :</h2>
                        <div className={"flex flex-col gap-2 px-20"}>
                            {apiState.user.outingsJoined
                                .filter(outingJoined => !apiState.user.outings.find(outing => outing.id === outingJoined.outing.id))
                                .map(outingJoined => (
                                    <div className={"event flex justify-between align-center"}
                                        key={outingJoined.outing.id}>
                                        <p className={"text-xl"}>{outingJoined.outing.eventName}</p>
                                        <Link href={`/outings/${outingJoined.outing.id}`}
                                            className={"button w-max h-max"}>En savoir +</Link>
                                    </div>
                                ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;