import { PrismaClient } from '@prisma/client';
import { fetchEventDetails } from '@/app/services/openAgenda';


const prisma = new PrismaClient();

export async function POST(request: Request) {
    const { openAgendaEventId, visibility, organizerId, friendsPseudos } = await request.json();
    console.log("Data reçue:", { openAgendaEventId, visibility, organizerId });

    if (typeof openAgendaEventId !== 'string') {
        return new Response(JSON.stringify({ error: "L'ID de l'événement doit être une chaîne de caractères." }), {
            status: 400,
        });
    }

    let eventName = '';
    try {
        // Récupération des détails de l'événement depuis l'API OpenAgenda
        const eventDetails = await fetchEventDetails(openAgendaEventId);
        console.log('eventDetails', eventDetails);

        if (eventDetails && eventDetails.title_fr) {
            eventName = eventDetails.title_fr;
        } else {
            console.error('Failed to retrieve event details');
            return new Response(JSON.stringify({ error: "Impossible de récupérer les détails de l'événement." }), {
                status: 400,
            });
        }

        const newOuting = await prisma.outing.create({
            data: {
                openAgendaEventId,
                visibility,
                organizerId,
                eventName,
                Participant: {
                    create: {
                        userId: organizerId,
                        role: 'host'
                    }
                }
            }
        });

        // Si des pseudos d'amis sont fournis, ajoutez-les comme participants
        if (visibility === 'private' && friendsPseudos && friendsPseudos.length > 0) {
            const friendIds = await prisma.user.findMany({
                where: {
                    pseudo: {
                        in: friendsPseudos
                    }
                },
                select: {
                    id: true
                }
            });

            if (friendIds.length !== friendsPseudos.length) {
                // Pas tous les pseudos sont valides
                return new Response(JSON.stringify({ error: "Certains pseudos ne sont pas valides." }), {
                    status: 400,
                });
            }

            // Ajouter ces amis en tant que participants
            for (const friendId of friendIds) {
                await prisma.participant.create({
                    data: {
                        userId: friendId.id,
                        outingId: newOuting.id,
                        role: "guest"
                    }
                });
            }
        }

        return new Response(JSON.stringify(newOuting), {
            status: 201,
        });
    } catch (error) {
        console.error("ERROR");
        console.error(error);
        return new Response(JSON.stringify({ error: "Une erreur s'est produite lors de la création de la sortie: " + error }), {
            status: 500,
        });
    }
}

export async function GET(request: Request) {
    try {
        const outings = await prisma.outing.findMany({
            select: {
                id: true,
                openAgendaEventId: true,
                visibility: true,
                eventName: true,
                organizerId: true,
                organizer: {
                    select: {
                        pseudo: true
                    }
                },
                Participant: {
                    select: {
                        userId: true,
                        user: {
                            select: {
                                pseudo: true,
                                avatar: true,
                                customAvatarUrl: true,
                            }
                        },
                        role: true
                    }
                }
            }
        });



        return new Response(JSON.stringify(outings), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 200,
            statusText: 'OK'
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des sorties:", error);
        return new Response(JSON.stringify({ error: "Une erreur s'est produite lors de la récupération des sorties." }), {
            status: 500,
            statusText: 'Internal Server Error'
        });
    }
}

