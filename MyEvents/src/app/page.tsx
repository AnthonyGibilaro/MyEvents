"use client"
import { useEffect, useState } from 'react';
import { fetchEvents } from './services/openAgenda';
import Link from 'next/link';
import Loading from "../../components/Loading";
import Image from "next/image";
import {fetchData} from "next-auth/client/_utils";

const HomePage = () => {
    const [upcomingEvents, setUpcomingEvents] = useState(null);
    const [sortFilter, setSortFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;
    const [currentFilter, setCurrentFilter] = useState([]);

        const fetchData = async () => {
            try {
                const events = await fetchEvents(limit, (page - 1) * limit, currentFilter[0], currentFilter[1]);
                setUpcomingEvents(events);
            } catch (error) {
                console.error("Erreur lors de la récupération des événements :", error);
            }
        };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setCurrentFilter([sortFilter, locationFilter]);
        fetchData();
    };

    useEffect(() => {
        fetchData();
    }, [page, currentFilter]);

    return (
        <div className={"flex flex gap-2 gap-4 p-10"}>
            <div className={"event filter"}>
                <div className={"flex flex-col gap-2"}>
                    <p className={"text-xl"}>Filtres</p>
                    <form onSubmit={handleFormSubmit} className={"flex flex-col align-end gap-2"}>
                        <label className={"flex flex-col w-full gap-05"}>
                            <select
                                className={"button"}
                                value={sortFilter}
                                onChange={(e) => setSortFilter(e.target.value)}
                            >
                                <option value="">- Catégories -</option>
                                <option value="bibliothèque">Bibliothèques</option>
                                <option value="cinema">Cinémas</option>
                                <option value="concert">Concerts</option>
                                <option value="conférence">Conférences</option>
                                <option value="exposition">Expositions</option>
                                <option value="jeux vidéo">Jeux vidéo</option>
                                <option value="musée">Musées</option>
                                <option value="sport">Sports</option>
                                <option value="théâtre">Théâtres</option>
                            </select>
                        </label>
                        <label className={"flex w-full flex-col gap-05"}>
                            Lieu :
                            <input
                                className={"button"}
                                type="text"
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                            />
                        </label>
                        <button
                            className={"button not-column w-max flex gap-05 align-center"}
                            type={"submit"}
                        >
                            Filtrer
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="19.2" viewBox="0 0 25 24">
                                <path fill="currentColor"
                                    d="m20.887 2.27l-1.568.78l1.569.782l.78 1.569l.781-1.57l1.57-.78l-1.57-.781l-.78-1.569l-.782 1.569ZM7.96 1.515l1.097 2.204l2.204 1.097l-2.204 1.097L7.96 8.117L6.863 5.913L4.659 4.816l2.204-1.097L7.96 1.515Zm9.28 1.887l5.148 5.149L7.298 23.64L2.15 18.491L17.24 3.402Zm-2.005 4.833l2.32 2.32l2.005-2.004l-2.32-2.32l-2.005 2.004Zm.906 3.735l-2.32-2.32l-8.842 8.841l2.32 2.32l8.842-8.841Z" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
            <div className={"flex flex-col gap-4 w-full"}>
                {upcomingEvents ? (
                    upcomingEvents.map(event => (
                        <div className={"event"} key={event.uid}>
                            <div className={"flex gap-4"}>
                                {event.image ? (
                                    <img className={"event-img"} src={event.image ? event.image : 'https://www.referenseo.com/wp-content/uploads/2019/03/image-attractive-960x540.jpg'} alt={`Image pour ${event.title_fr}`} />
                                ) : (
                                    <Image priority={true} className={"event-img default"} width={300} height={300} src={"/my_events.png"} alt={`Image par défault`}></Image>
                                )}
                                <div className={"flex flex-col gap-2"}>
                                    <p className={"text-2xl"}>{event.title_fr}</p>
                                    <p>{event.description_fr}</p>
                                </div>
                            </div>
                            <Link className={"savoir"} href={`/${event.uid}`}>En savoir +</Link>
                        </div>
                    ))
                ) : (
                    <Loading />
                )}
                <div className={"flex not-column gap-2 align-center justify-center"}>
                    <button className={"buttonpage"} onClick={() => {
                        setPage(prev => Math.max(prev - 1, 1));
                        scrollTo(0, 0)
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
                            <path fill="currentColor"
                                d="M18.464 2.114a.998.998 0 0 0-1.033.063l-13 9a1.003 1.003 0 0 0 0 1.645l13 9A1 1 0 0 0 19 21V3a1 1 0 0 0-.536-.886zM17 19.091L6.757 12L17 4.909v14.182z" />
                        </svg>

                    </button>
                    <p className={"text-xl"}>page n°{page}</p>
                    <button className={"buttonpage"} onClick={() => {
                        setPage(prev => prev + 1);
                        scrollTo(0, 0)
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
                            <path fill="currentColor"
                                d="M5.536 21.886a1.004 1.004 0 0 0 1.033-.064l13-9a1 1 0 0 0 0-1.644l-13-9A.998.998 0 0 0 5 3v18a1 1 0 0 0 .536.886zM7 4.909L17.243 12L7 19.091V4.909z" />
                        </svg>

                    </button>
                </div>
            </div>
        </div>

    );
};

export default HomePage;