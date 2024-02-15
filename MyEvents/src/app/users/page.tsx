"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Loading from "../../../components/Loading";


interface User {
    id: string;
    pseudo: string;
    name: string;
    avatar: string;
    customAvatarUrl?: string;
}

interface APIState {
    isLoading: boolean;
    users: User[] | null;
    error: string | null;
}

const UsersPage: React.FC = () => {
    const [apiState, setApiState] = useState<APIState>({
        isLoading: true,
        users: null,
        error: null,
    });

    useEffect(() => {
        fetch('http://localhost:3000/api/users')
            .then(response => response.json())
            .then(users => {
                setApiState({
                    isLoading: false,
                    users,
                    error: null,
                });
            })
            .catch(error => {
                setApiState({
                    isLoading: false,
                    users: null,
                    error: error.message,
                });
            });
    }, []);

    if (apiState.isLoading) {
        return <Loading />;
    }

    if (apiState.error) {
        return <h1>Erreur : {apiState.error}</h1>;
    }

    return (
        <div className={"sorties gap-4 p-10"}>
            {Array.isArray(apiState.users) && apiState.users.length > 0 ? (
                apiState.users.map(user => (
                    <div className={"event participant gap-2"} key={user.pseudo}>
                        <img className={"participant-img"} src={user.customAvatarUrl ? user.customAvatarUrl : user.avatar} alt={`Avatar de ${user.pseudo}`} />
                        <Link className={"event-a text-xl"} href={`/users/${user.pseudo}`}>{user.pseudo}</Link>
                    </div>
                ))
            ) : (
                <p>Aucun utilisateur trouvé.</p>
            )}
        </div>
    );
};

export default UsersPage;
