"use client";
import {useEffect, useState} from 'react';
import {useSession} from 'next-auth/react';
import Select from 'react-select';
import {MapContainer, Marker, Popup, TileLayer} from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import Loading from "../../../../components/Loading";
import {toast} from "react-toastify";

interface OutingDetails {
    id: number;
    openAgendaEventId: string;
    eventName: string;
    visibility: string;
    organizer: {
        id: string;
        pseudo: string;
    };
    Participant: {
        user: {
            id: string;
            pseudo: string;
            avatar: string;
            customAvatarUrl?: string;
        };
        role: string;
    }[];
    messages: {
        id: number;
        message: string;
        timestamp: string;
        user: {
            pseudo: string;
            avatar: string;
            customAvatarUrl?: string;
            name: string;
        };
    }[];
}

function OutingDetailsPage({params}: { params: { outingId: string } }) {
    const [outingDetails, setOutingDetails] = useState<OutingDetails | null>(null);
    const [newMessage, setNewMessage] = useState<string>('');
    const {data: session, status} = useSession();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [friendsList, setFriendsList] = useState<any[]>([]);
    const [selectedFriends, setSelectedFriends] = useState<any[]>([]);


    const handleJoinOuting = async () => {
        if (!session) {
            toast.info("Veuillez vous connecter pour rejoindre une sortie.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/outings/${params.outingId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: session.userId
                }),
            });

            const result = await response.json();
            if (response.ok) {
                toast.success('Vous avez rejoint cette sortie !');
                setOutingDetails(prevState => {
                    if (prevState) {
                        return {
                            ...prevState,
                            Participant: [...prevState.Participant, {
                                user: {
                                    id: session.userId,
                                    pseudo: session.user.name,
                                    avatar: session.user.image
                                }, role: 'guest'
                            }]
                        };
                    }
                    return prevState;
                });

            } else {
                toast.error('Erreur lors de la jointure : ' + (result.error || 'Erreur inconnue'));
            }
        } catch (error) {
            toast.error('Erreur lors de la jointure : ' + error.message);
        }
    };

    useEffect(() => {
        if (params.outingId && session?.userId) {
            fetch(`http://localhost:3000/api/outings/${params.outingId}?userId=${session.userId}`)
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(data => Promise.reject(data));
                    }
                    return response.json();
                })
                .then(data => {
                    setOutingDetails(data);
                })
                .catch(error => {
                    console.error("Erreur lors de la récupération des détails de la sortie:", error);
                    if (error.error) {
                        setErrorMessage(error.error);
                    } else {
                        setErrorMessage('Une erreur est survenue lors de la récupération des détails de la sortie.');
                    }
                });
        }
    }, [params.outingId, session?.userId]);

    useEffect(() => {
        const loadFriendsList = async () => {
            try {
                const response = await fetch('/api/users');
                const data = await response.json();
                const filteredData = data.filter((user: any) => user.id !== session?.userId);
                setFriendsList(filteredData.map((user: any) => ({value: user.id, label: user.pseudo})));
            } catch (error) {
                console.error('Error loading friends list:', error);
            }
        };

        loadFriendsList();
    }, [session?.userId]);


    if (status === "loading") {
        return <Loading/>;
    }

    if (status !== "authenticated") {
        return (
            <div className={"flex flex-col p-10"}>
                <div className={"event flex flex-col gap-2"}>
                    <p>Pour voir cette sortie, veuillez vous connecter.</p>
                    <a className={"button w-max"} href="/api/auth/signin">Se connecter</a>
                </div>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className={"flex flex-col p-10"}>
                <div className={"event flex flex-col gap-2"}>
                    <p>{errorMessage}</p>
                    <a className={"button w-max"} href="/">Retour à l'accueil</a>
                </div>
            </div>
        )
    }

    if (!outingDetails) {
        return <Loading/>;
    }

    const handlePostMessage = async () => {
        if (!session) {
            toast.info("Veuillez vous connecter pour poster un message.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/outings/${params.outingId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: session.userId,
                    message: newMessage,
                }),
            });

            const result = await response.json();
            if (response.ok) {
                setOutingDetails(prevState => {
                    if (prevState) {
                        return {
                            ...prevState,
                            messages: [...prevState.messages, result],
                        };
                    }
                    return prevState;
                });
                setNewMessage('');
            } else {
                toast.error('Erreur lors de l’envoi du message : ' + (result.error || 'Erreur inconnue'));
            }
        } catch (error) {
            toast.error('Erreur lors de l’envoi du message : ' + error.message);
        }
    };

    const handleDeleteOuting = async () => {
        if (!session) {
            toast.info("Veuillez vous connecter pour supprimer une sortie.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/outings/${params.outingId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: session.userId,
                }),
            });

            if (response.ok) {
                toast.success('La sortie a été supprimée avec succès.');
                window.location.href = '/';
            } else {
                const result = await response.json();
                toast.error('Erreur lors de la suppression de la sortie : ' + (result.error || 'Erreur inconnue'));
            }
        } catch (error) {
            toast.error('Erreur lors de la suppression de la sortie : ' + error.message);
        }
    };

    const handleLeaveOuting = async () => {
        if (!session) {
            toast.info("Veuillez vous connecter pour quitter une sortie.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/outings/${params.outingId}/participants`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: session.userId,  // ID de l'utilisateur à retirer
                    requesterId: session.userId  // ID de l'utilisateur faisant la requête
                }),
            });


            const result = await response.json();
            if (response.ok) {
                toast.success('Vous avez quitté cette sortie !');
                setOutingDetails(prevState => {
                    if (prevState) {
                        return {
                            ...prevState,
                            Participant: prevState.Participant.filter(p => p.user.id !== session?.userId)
                        };
                    }
                    return prevState;
                });
            } else {
                toast.error('Erreur lors de la tentative de quitter la sortie : ' + (result.error || 'Erreur inconnue'));
            }
        } catch (error) {
            toast.error('Erreur lors de la tentative de quitter la sortie : ' + error.message);
        }
    };

    const handleInviteFriends = async (e: any) => {
        e.preventDefault();
        if (!session) {
            toast.info('Veuillez vous connecter pour inviter des amis.');
            return;
        }

        try {
            // Obtenez les IDs des participants actuels
            const currentParticipantIds = outingDetails?.Participant.map(p => p.user.id) || [];

            // Filtrez les amis sélectionnés pour exclure ceux qui sont déjà participants
            const friendsToInvite = selectedFriends.filter(friend => !currentParticipantIds.includes(friend.value));

            // Si aucun nouvel ami à inviter, retournez tôt
            if (friendsToInvite.length === 0) {
                toast.info('Tous les amis sélectionnés sont déjà participants.');
                return;
            }

            // Étape 1: Récupérez les détails des utilisateurs (y compris les URLs d'avatar) depuis l'API
            const friendDetailsPromises = friendsToInvite.map(friend =>
                fetch(`/api/users/${encodeURIComponent(friend.label)}`)
                    .then(response => response.json())
            );
            const friendDetails = await Promise.all(friendDetailsPromises);

            // Étape 2: Utilisez les détails récupérés pour créer les nouveaux objets participants
            const newParticipants = friendDetails.map((details, index) => ({
                user: {
                    id: friendsToInvite[index].value,
                    pseudo: friendsToInvite[index].label,
                    avatar: details.avatar // Utilisez l'URL d'avatar depuis la réponse de l'API
                },
                role: "guest"
            }));

            // Étape 3: Envoyez les IDs des utilisateurs à l'API pour les ajouter en tant que participants
            const response = await fetch(`/api/outings/${params.outingId}/participants`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userIds: friendsToInvite.map(friend => friend.value),
                    requesterId: session.userId,
                }),
            });

            const result = await response.json();
            if (response.ok) {
                toast.success('Les amis ont été invités avec succès !');
                setOutingDetails(prevState => {
                    if (prevState) {
                        return {
                            ...prevState,
                            Participant: [...prevState.Participant, ...newParticipants]
                        };
                    }
                    return prevState;
                });
            } else {
                toast.error('Erreur lors de l’invitation des amis : ' + (result.error || 'Erreur inconnue'));
            }
        } catch (error) {
            toast.error('Erreur lors de l’invitation des amis : ' + error.message);
        }
    };

    const handleRemoveParticipant = async (userIdToRemove: string) => {
        if (!session) {
            toast.info('Veuillez vous connecter pour retirer un participant.');
            return;
        }

        try {
            const response = await fetch(`/api/outings/${params.outingId}/participants`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userIdToRemove,
                    requesterId: session.userId,
                }),
            });

            const result = await response.json();
            if (response.ok) {
                toast.success('Participant retiré avec succès !');
                setOutingDetails(prevState => {
                    if (prevState) {
                        return {
                            ...prevState,
                            Participant: prevState.Participant.filter(p => p.user.id !== userIdToRemove)
                        };
                    }
                    return prevState;
                });
            } else {
                toast.error('Erreur lors du retrait du participant : ' + (result.error || 'Erreur inconnue'));
            }
        } catch (error) {
            toast.error('Erreur lors du retrait du participant : ' + error.message);
        }
    };


    return (
        <>
        <div className={"flex flex-col gap-2 gap-4 p-10"}>
            <div className={"event"}>
                <MapContainer
                    center={outingDetails && outingDetails.eventDetails.location_coordinates ? [outingDetails.eventDetails.location_coordinates[0], outingDetails.eventDetails.location_coordinates[1]] : [0, 0]}
                    zoom={13}
                    style={{zIndex: "1", height: "400px", width: "100%"}}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker
                        position={outingDetails && outingDetails.eventDetails.location_coordinates ? [outingDetails.eventDetails.location_coordinates[0], outingDetails.eventDetails.location_coordinates[1]] : [0, 0]}>
                        <Popup>
                            {outingDetails ? (
                                <>
                                    <strong>Nom de l'événement :</strong> {outingDetails.eventDetails.title_fr} <br/>
                                    <strong>Adresse :</strong> {outingDetails.eventDetails.location_address} <br/>
                                    <strong>Ville :</strong> {outingDetails.eventDetails.location_city} <br/>
                                    <strong>Région :</strong> {outingDetails.eventDetails.location_region} <br/>
                                    <strong>Description :</strong> {outingDetails.eventDetails.description_fr} <br/>
                                    <strong>Date :</strong> {outingDetails.eventDetails.daterange_fr} <br/>
                                    <strong>Site web :</strong> <a href={outingDetails.eventDetails.location_website}
                                                                   target="_blank"
                                                                   rel="noopener noreferrer">{outingDetails.eventDetails.location_website}</a>
                                    <br/>
                                </>
                            ) : (
                                <Loading/>
                            )}
                        </Popup>

                    </Marker>
                </MapContainer>

                <div className={"flex flex-col gap-4 p-10"}>
                    <div className={"flex align-center gap-2"}>
                    <p className={"text-2xl"}>{outingDetails.eventName}</p>
                    {
                        outingDetails && outingDetails.organizer.id !== session?.userId && !outingDetails.Participant.some(p => p.user.id === session?.userId) && (
                            <button className={"w-max button"} onClick={handleJoinOuting}>Rejoindre</button>
                        )
                    }
                    </div>
                    <div className={"flex gap-4"}>
                        <div className={"flex flex-col gap-2"}>
                            <div className={"messagerie"}>
                                <p className={"text-xl"}>Participants</p>
                                <div className={"participants"}>
                                    {outingDetails.Participant.map(participant => (
                                        <div className={"participant"} key={participant.user.pseudo}>
                                            <img className={"participant-img"} src={participant.user.customAvatarUrl ? participant.user.customAvatarUrl : participant.user.avatar}
                                                 alt={`${participant.user.pseudo}'s avatar`}/>
                                            <div className={"flex align-center gap-05"}>
                                            {participant.role === "host" ? (
                                                <a href={`/users/${participant.user.pseudo}`} className={"event-a flex align-center gap-05"}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                                         viewBox="-2 -4 24 24">
                                                        <path fill="#0056b3"
                                                              d="M2.776 5.106L3.648 11h12.736l.867-5.98l-3.493 3.02l-3.755-4.827l-3.909 4.811l-3.318-2.918zm10.038-1.537l-.078.067l.141.014l1.167 1.499l1.437-1.242l.14.014l-.062-.082l2.413-2.086a1 1 0 0 1 1.643.9L18.115 13H1.922L.399 2.7a1 1 0 0 1 1.65-.898L4.35 3.827l-.05.06l.109-.008l1.444 1.27l1.212-1.493l.109-.009l-.06-.052L9.245.976a1 1 0 0 1 1.565.017l2.005 2.576zM2 14h16v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1z"/>
                                                    </svg>
                                                    {participant.user.pseudo}</a>) : (
                                                <a className={"event-a"} href={`/users/${participant.user.pseudo}`}>{participant.user.pseudo}</a>
                                            )}
                                            {outingDetails.organizer.id === session?.userId && (
                                                <>
                                                    {participant.user.id === session?.userId ? (
                                                        <button className={"display-button"}
                                                                onClick={handleDeleteOuting}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 2048 2048"><path fill="currentColor" d="M2048 1536v128h-646l211 211l-90 90l-365-365l365-365l90 90l-211 211h646zm-756-433l-88 93q-89-84-201-128t-235-44q-88 0-170 23t-153 64t-129 100t-100 130t-65 153t-23 170H0q0-117 35-229t101-207t157-169t203-113q-56-36-100-83t-76-103t-47-118t-17-130q0-106 40-199t109-163T568 40T768 0q106 0 199 40t163 109t110 163t40 200q0 137-63 248t-177 186q70 26 133 66t119 91zM384 512q0 80 30 149t82 122t122 83t150 30q79 0 149-30t122-82t83-122t30-150q0-79-30-149t-82-122t-123-83t-149-30q-80 0-149 30t-122 82t-83 123t-30 149z"/></svg>

                                                        </button>
                                                    ) : (
                                                        <button className={"display-button"}
                                                                onClick={() => handleRemoveParticipant(participant.user.id)}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 2048 2048"><path fill="currentColor" d="M2048 1536v128h-646l211 211l-90 90l-365-365l365-365l90 90l-211 211h646zm-756-433l-88 93q-89-84-201-128t-235-44q-88 0-170 23t-153 64t-129 100t-100 130t-65 153t-23 170H0q0-117 35-229t101-207t157-169t203-113q-56-36-100-83t-76-103t-47-118t-17-130q0-106 40-199t109-163T568 40T768 0q106 0 199 40t163 109t110 163t40 200q0 137-63 248t-177 186q70 26 133 66t119 91zM384 512q0 80 30 149t82 122t122 83t150 30q79 0 149-30t122-82t83-122t30-150q0-79-30-149t-82-122t-123-83t-149-30q-80 0-149 30t-122 82t-83 123t-30 149z"/></svg>

                                                        </button>
                                                    )}
                                                </>
                                            )}
                                            {outingDetails.organizer.id !== session?.userId && participant.user.id === session?.userId && (
                                                <button className={"display-button"} onClick={handleLeaveOuting}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 2048 2048"><path fill="currentColor" d="M2048 1536v128h-646l211 211l-90 90l-365-365l365-365l90 90l-211 211h646zm-756-433l-88 93q-89-84-201-128t-235-44q-88 0-170 23t-153 64t-129 100t-100 130t-65 153t-23 170H0q0-117 35-229t101-207t157-169t203-113q-56-36-100-83t-76-103t-47-118t-17-130q0-106 40-199t109-163T568 40T768 0q106 0 199 40t163 109t110 163t40 200q0 137-63 248t-177 186q70 26 133 66t119 91zM384 512q0 80 30 149t82 122t122 83t150 30q79 0 149-30t122-82t83-122t30-150q0-79-30-149t-82-122t-123-83t-149-30q-80 0-149 30t-122 82t-83 123t-30 149z"/></svg>

                                                </button>
                                            )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {
                                (outingDetails.organizer.id === session?.userId || (outingDetails.visibility === 'public' && outingDetails.Participant.some(p => p.user.id === session?.userId))) &&
                                (
                                    <div>
                                        <h2>Inviter des amis :</h2>
                                        <form className={"flex w-full"} onSubmit={handleInviteFriends}>
                                            <Select
                                                isMulti
                                                name="friends"
                                                options={friendsList}
                                                className="w-full button"
                                                onChange={setSelectedFriends}
                                                styles={{
                                                    menu: (provided) => ({...provided, color: 'black'}),
                                                    option: (provided) => ({...provided, color: 'black'})
                                                }}
                                            />
                                            <button className={"button"} type="submit">Inviter</button>
                                        </form>
                                    </div>
                                )
                            }
                        </div>
                        <div className={"flex flex-col gap-2 w-full"}>
                            <div className={"messagerie b-black"}>
                                <div className={"event b-none flex flex-col gap-2"}>
                                    {outingDetails.messages.map(message => (
                                        <div className={"flex flex-col"} key={message.id}>
                                            {message.user ? (
                                                <div className={"flex align-center gap-2"}>
                                                    <img className={"messagerie-img"} src={message.user.customAvatarUrl ? message.user.customAvatarUrl : message.user.avatar}
                                                         alt={`${message.user.pseudo}'s avatar`}/>
                                                    <div className={"flex flex-col gap-05"}>
                                                        <div className={"flex gap-05"}>
                                                            <p>{message.user.pseudo}</p>
                                                            <p className={"text-gray"}>{new Date(message.timestamp).toLocaleString()}</p>
                                                        </div>
                                                        <p>{message.message}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <Loading/>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className={"flex gap-2 w-full"}>
                                <input
                                    type="text"
                                    value={newMessage}
                                    className={"button w-full"}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Écrivez votre message ici"
                                />
                                <button className={"button"} onClick={handlePostMessage}>Envoyer</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
            </>
    );
};

export default OutingDetailsPage;
