"use client";
import {useEffect, useState} from 'react';
import {fetchEventDetails} from '@/app/services/openAgenda';
import {useSession} from "next-auth/react";
import {useRouter} from 'next/navigation';
import Select from 'react-select';
import Loading from "../../../components/Loading";
import Image from "next/image";
import {toast} from "react-toastify";

interface Event {
    uid: string;
    slug: string;
    title_fr: string;
    description_fr: string;
    longdescription_fr: string;
    conditions_fr: string;
    daterange_fr: string;
    firstdate_begin: string;
    location_name: string;
    location_coordinates: string;
    location_address: string;
    location_city: string;
    location_department: string;
    location_region: string;
    location_website: string;
    registration: string;
    image: string;
}

function EventDetailPage({params}: { params: { eventId: string } }) {
    const {data: session} = useSession();
    const eventId = params.eventId;
    const router = useRouter();

    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateOutingForm, setShowCreateOutingForm] = useState(false);
    const [visibility, setVisibility] = useState('public');
    const [friends, setFriends] = useState([]);
    const [friendsList, setFriendsList] = useState<any[]>([]);

    useEffect(() => {
        const loadFriendsList = async () => {
            try {
                const response = await fetch('/api/users');
                const data = await response.json();
                // Filtrer l'hôte de la liste des amis à inviter
                const filteredData = data.filter((user: any) => user.id !== session?.userId);
                setFriendsList(filteredData.map((user: any) => ({value: user.pseudo, label: user.pseudo})));
            } catch (error) {
                console.error('Error loading friends list:', error);
            }
        };

        loadFriendsList();

        if (eventId) {
            fetchEventDetails(eventId as string)
                .then(eventDetails => {
                    setEvent(eventDetails);
                    setIsLoading(false);
                })
                .catch(err => {
                    setError(err.message);
                    setIsLoading(false);
                });
        }
    }, [eventId, session?.userId]);

    const handleOpenCreateOutingForm = (e) => {
        e.preventDefault();
        setShowCreateOutingForm(true);
    };

    const handleCloseCreateOutingForm = () => {
        setShowCreateOutingForm(false);
    };

    const handleCreateOuting = async (e) => {
        e.preventDefault();
        if (!session) {
            toast.info('Veuillez vous connecter pour créer une sortie.');
            return;
        }

        try {
            const response = await fetch('/api/outings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    openAgendaEventId: eventId,
                    visibility: visibility,
                    organizerId: session.userId,
                    eventName: event.title_fr,
                    friendsPseudos: friends.map((friend: any) => friend.value)
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Sortie créée avec succès!');
                router.push(`/outings/${data.id}`);
            } else {
                toast.error('Erreur lors de la création de la sortie: ' + (data.error || 'Erreur inconnue'));
            }
        } catch (error) {
            toast.error('Erreur lors de la création de la sortie: ' + error.message);
        }
    };

    if (isLoading) {
        return <Loading/>;
    }

    if (error) {
        return (
            <div className={"flex flex-col p-10"}>
                <div className={"event flex flex-col gap-2"}>
                    <p>Évènement non trouvé.</p>
                    <a className={"button w-max"} href="/">Retour à l'accueil</a>
                </div>
            </div>
        )
    }

    if (!event) {
        return (
            <div className={"flex flex-col p-10"}>
                <div className={"event flex flex-col gap-2"}>
                    <p>Évènement non trouvé.</p>
                    <a className={"button w-max"} href="/">Retour à l'accueil</a>
                </div>
            </div>
        )
    }

    return (
        <div className={"flex flex-col gap-2 gap-4 p-10"}>
            <div className={"event"}>
                <div className={"flex flex-col gap-4"}>
                    <div className={"flex gap-4"}>
                        {event.image ? (
                            <img className={"one-event-img"} src={event.image} alt={`Image pour ${event.title_fr}`}/>
                        ) : (
                            <Image priority={true} className={"one-event-img default"} width={300} height={300}
                                   src={"/my_events.png"}
                                   alt={`Image par défault`}></Image>
                        )
                        }
                        <div className={"flex flex-col gap-2"}>
                            <p className={"text-2xl"}>{event.title_fr}</p>
                            <p className={"flex gap-05"}>Date: {event.daterange_fr}
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256">
                                    <path fill="#0056b3"
                                          d="M208 32h-24v-8a8 8 0 0 0-16 0v8H88v-8a8 8 0 0 0-16 0v8H48a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16Zm-96 152a8 8 0 0 1-16 0v-51.06l-4.42 2.22a8 8 0 0 1-7.16-14.32l16-8A8 8 0 0 1 112 120Zm56-8a8 8 0 0 1 0 16h-32a8 8 0 0 1-6.4-12.8l28.78-38.37a8 8 0 1 0-13.31-8.83a8 8 0 1 1-13.85-8A24 24 0 0 1 176 136a23.76 23.76 0 0 1-4.84 14.45L152 176ZM48 80V48h24v8a8 8 0 0 0 16 0v-8h80v8a8 8 0 0 0 16 0v-8h24v32Z"/>
                                </svg>
                            </p>
                            <p>Lieu: {event.location_name}</p>
                            <p className={"flex gap-05"}>Adresse: <a className={"event-a flex gap-05"}
                                                                     href={`http://maps.google.com/?q=${event.location_coordinates}`}
                                                                     target="_blank"
                                                                     rel="noopener noreferrer">{event.location_address}, {event.location_city}
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 15 15">
                                    <g fill="none" fillRule="evenodd" stroke="#0056b3" strokeLinecap="square"
                                       clipRule="evenodd">
                                        <path d="M7.5 8.495a2 2 0 0 0 2-1.999a2 2 0 0 0-4 0a2 2 0 0 0 2 1.999Z"/>
                                        <path
                                            d="M13.5 6.496c0 4.997-5 7.995-6 7.995s-6-2.998-6-7.995A5.999 5.999 0 0 1 7.5.5c3.313 0 6 2.685 6 5.996Z"/>
                                    </g>
                                </svg>
                            </a>
                            </p>
                            {event.location_website && (
                                <p className={"flex gap-05"}>
                                    Site web: <a className={"event-a"} href={event.location_website} target="_blank"
                                                 rel="noopener noreferrer">{event.location_website}</a>
                                </p>
                            )}
                            <div className={"flex gap-4"}>
                                <button className={"button w-max"} onClick={handleOpenCreateOutingForm}>Créer une sortie
                                </button>

                                {showCreateOutingForm && (
                                    <div className={"modal"}>
                                        <form onSubmit={handleCreateOuting} className={"event flex align-center gap-2"}>
                                        <label>Visibilité: </label>
                                        <select
                                            className={"button"}
                                            name="visibility"
                                            value={visibility}
                                            onChange={e => setVisibility(e.target.value)}>
                                            <option value="public">Public</option>
                                            <option value="private">Privé</option>
                                        </select>
                                        {visibility === 'private' && (
                                            <>
                                                <label>Inviter des amis (pseudo): </label>
                                                <Select
                                                    isMulti
                                                    name="friends"
                                                    options={friendsList}
                                                    className="basic-multi-select"
                                                    classNamePrefix="select"
                                                    onChange={setFriends}
                                                    styles={{
                                                        menu: (provided) => ({...provided, color: 'black'}), // Adjustez les styles ici
                                                        option: (provided) => ({...provided, color: 'black'}) // Adjustez les styles ici
                                                    }}
                                                />
                                            </>
                                        )}
                                        <button className={"button"} type="submit">Valider</button>
                                        <button className={"button"} type="button"
                                                onClick={handleCloseCreateOutingForm}>Annuler
                                        </button>
                                    </form>
                                    </div>

                                )}
                            </div>
                        </div>
                    </div>
                    {event.longdescription_fr ? (
                        <div
                            dangerouslySetInnerHTML={{__html: event.longdescription_fr.replace("href", "target=\"_blank\" rel=\"noopener noreferrer\" href")}}/>
                    ) : (
                        <p>{event.description_fr}</p>
                    )}
                    {event.registration && JSON.parse(event.registration).map(reg => (
                        <div key={reg.type}>
                            {reg.type === "email" &&
                                <div className={"flex gap-05"}><p>Email de contact :</p><a className={"event-a"}
                                                                                           href={`mailto:${reg.value}`}>{reg.value}</a>
                                </div>}
                            {reg.type === "phone" &&
                                <div className={"flex gap-05"}><p>Numéro de téléphone :</p><a className={"event-a"}
                                                                                              href={`tel:${reg.value}`}>{reg.value}</a>
                                </div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EventDetailPage;