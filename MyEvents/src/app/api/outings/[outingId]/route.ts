import { PrismaClient } from '@prisma/client';
import { fetchEventDetails } from '@/app/services/openAgenda';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    const { userId } = await request.json();

    // Vérification de la validité du userId
    if (!userId) {
        await prisma.$disconnect();
        return new Response(JSON.stringify({ error: "L'ID de l'utilisateur est requis." }), {
            status: 400,
        });
    }

    // Récupération et décodage de l'outingId à partir de l'URL
    let outingIdString = decodeURIComponent((request.url.split("/").pop() || ""));
    const outingId = parseInt(outingIdString);

    const outingDetails = await prisma.outing.findUnique({
        where: {
            id: outingId
        }
    });

    if (outingDetails && outingDetails.organizerId === userId) {
        await prisma.$disconnect();
        return new Response(JSON.stringify({ error: "Vous ne pouvez pas rejoindre votre propre sortie." }), {
            status: 400,
        });
    }

    // Vérification de la validité de l'outingId
    if (isNaN(outingId) || outingId <= 0) {
        return new Response(JSON.stringify({ error: "ID de sortie invalide." }), {
            status: 400,
        });
    }

    try {
        const existingParticipant = await prisma.participant.findFirst({
            where: {
                userId: userId,
                outingId: outingId,
            }
        });

        if (existingParticipant) {
            await prisma.$disconnect();
            return new Response(JSON.stringify({ error: "Vous avez déjà rejoint cette sortie." }), {
                status: 400,
            });
        }

        const newParticipant = await prisma.participant.create({
            data: {
                userId: userId,
                outingId: outingId,
                role: "guest"
            }
        });

        await prisma.$disconnect();
        return new Response(JSON.stringify(newParticipant), {
            status: 201,
        });
    } catch (error) {
        await prisma.$disconnect();
        console.error("Erreur lors de l'ajout d'un participant:", error);
        return new Response(JSON.stringify({ error: "Une erreur s'est produite lors de l'ajout du participant." }), {
            status: 500,
        });
    }
}

export async function GET(request: Request) {
    let outingIdString = decodeURIComponent((request.url.split("/").pop() || ""));
    const outingId = parseInt(outingIdString);

    // Obtenez l'ID de l'utilisateur à partir des paramètres de requête
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    try {
        const outing = await prisma.outing.findUnique({
            where: { id: outingId },
            select: {
                id: true,
                openAgendaEventId: true,
                organizerId: true,
                visibility: true,
                eventName: true,
                organizer: {
                    select: {
                        id: true,
                        pseudo: true,
                        avatar: true,
                        customAvatarUrl: true,
                    }
                },
                Participant: {
                    select: {
                        id: true,
                        userId: true,
                        role: true,
                        user: {
                            select: {
                                id: true,
                                pseudo: true,
                                avatar: true,
                                customAvatarUrl: true,
                            }
                        }
                    }
                },
                messages: {
                    select: {
                        id: true,
                        message: true,
                        timestamp: true,
                        user: {
                            select: {
                                id: true,
                                pseudo: true,
                                avatar: true,
                                customAvatarUrl: true,
                            }
                        }
                    },
                    orderBy: {
                        timestamp: 'asc'
                    }
                }
            }
        });

        if (!outing) {
            return new Response(JSON.stringify({ error: "Sortie non trouvée." }), {
                status: 404,
                statusText: 'Not Found'
            });
        }

        const eventDetails = await fetchEventDetails(outing.openAgendaEventId);


        if (outing.visibility === 'private' && outing.organizerId !== userId && !outing.Participant.some(p => p.userId === userId)) {
            return new Response(JSON.stringify({ error: "Accès refusé." }), {
                status: 403,
                statusText: 'Forbidden'
            });
        }

        return new Response(JSON.stringify({ ...outing, eventDetails }), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 200,
            statusText: 'OK'
        });
    } catch (error) {
        console.error("Erreur lors de la récupération de la sortie:", error);
        return new Response(JSON.stringify({ error: "Une erreur s'est produite lors de la récupération de la sortie." }), {
            status: 500,
            statusText: 'Internal Server Error'
        });
    }
}

export async function DELETE(request: Request) {
    const { userId } = await request.json();

    if (!userId) {
        await prisma.$disconnect();
        return new Response(JSON.stringify({ error: "L'ID de l'utilisateur est requis." }), {
            status: 400,
        });
    }

    let outingIdString = decodeURIComponent((request.url.split("/").pop() || ""));
    const outingId = parseInt(outingIdString);

    const outingDetails = await prisma.outing.findUnique({
        where: {
            id: outingId
        }
    });

    if (!outingDetails) {
        await prisma.$disconnect();
        return new Response(JSON.stringify({ error: "Sortie non trouvée." }), {
            status: 404,
        });
    }

    if (outingDetails.organizerId !== userId) {
        await prisma.$disconnect();
        return new Response(JSON.stringify({ error: "Vous n'êtes pas autorisé à supprimer cette sortie." }), {
            status: 403,
        });
    }

    try {
        await prisma.message.deleteMany({
            where: {
                outingId: outingId
            }
        });

        await prisma.participant.deleteMany({
            where: {
                outingId: outingId
            }
        });

        await prisma.outing.delete({
            where: {
                id: outingId
            }
        });

        await prisma.$disconnect();
        return new Response(JSON.stringify({ message: "Sortie supprimée avec succès." }), {
            status: 200,
        });
    } catch (error) {
        await prisma.$disconnect();
        console.error("Erreur lors de la suppression de la sortie:", error);
        return new Response(JSON.stringify({ error: "Une erreur s'est produite lors de la suppression de la sortie." }), {
            status: 500,
        });
    }
}

