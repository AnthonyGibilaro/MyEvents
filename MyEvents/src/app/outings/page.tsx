"use client";
import {useEffect, useState} from 'react';
import {useSession} from "next-auth/react";
import Link from 'next/link';
import Loading from "../../../components/Loading";

interface Outing {
    id: number;
    openAgendaEventId: string;
    eventName: string;
    visibility: string;
    organizer: {
        pseudo: string;
    };
    Participant: {
        user: {
            pseudo: string;
            avatar: string;
            customAvatarUrl?: string;
        };
        role: string;
    }[];
}

const OutingsPage: React.FC = () => {
    const [outings, setOutings] = useState<Outing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const {data: session} = useSession();

    useEffect(() => {
        fetch('/api/outings')
            .then(response => response.json())
            .then(data => {
                setOutings(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des sorties:", error);
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return <Loading/>;
    }

    const relevantOutings = outings.filter(outing => {
        if (outing.visibility === 'public') return true;
        if (outing.organizerId === session?.userId) return true;
        const isParticipant = outing.Participant.some(participant => participant.userId === session?.userId);
        return isParticipant;
    });

    return (
        <div className={"flex flex-col gap-2 gap-4 p-10"}>
            {relevantOutings.map(outing => (
                <div className={"event"} key={outing.id}>
                    <div className={"flex flex-col gap-2"}>
                        <p className={"text-2xl"}>
                            {outing.eventName}
                        </p>
                        <p>Participants</p>
                        <div className={"sorties"}>
                            {outing.Participant.map(participant => (
                                <div className={"participant-sortie gap-2"} key={participant.user.pseudo}>
                                    <img className={"participant-sortie-img"} src={participant.user.customAvatarUrl ? participant.user.customAvatarUrl : participant.user.avatar}
                                         alt={`${participant.user.pseudo}'s avatar`}/>
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
                                </div>
                            ))}
                        </div>
                    </div>
                    <Link className={"savoir"} href={`/outings/${outing.id}`}>En savoir +
                    </Link>
                </div>
            ))}
        </div>
    );
};

export default OutingsPage;