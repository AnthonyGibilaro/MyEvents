import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    // Récupération et décodage du userPseudo à partir de l'URL
    let userPseudo = decodeURIComponent((request.url.split("/").pop() || ""));

    // Vérification de la validité du userPseudo
    if (!userPseudo) {
        await prisma.$disconnect();
        return new Response(JSON.stringify({ error: "Pseudo de l'utilisateur invalide." }), {
            status: 400,
        });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { pseudo: userPseudo },
            select: {
                id: false,
                pseudo: true,
                name: false,
                avatar: true,
                customAvatarUrl: true,
                bio: true,
                outings: {
                    where: { visibility: 'public' },
                    select: {
                        id: true,
                        openAgendaEventId: true,
                        eventName: true,
                        organizer: {
                            select: {
                                pseudo: true,
                            },
                        },
                    },
                },
                outingsJoined: {
                    where: { outing: { visibility: 'public' } },
                    select: {
                        outing: {
                            select: {
                                id: true,
                                openAgendaEventId: true,
                                eventName: true,
                                organizer: {
                                    select: {
                                        pseudo: true
                                    }
                                }
                            }
                        },
                        role: true
                    }
                }
            },
        });


        if (!user) {
            await prisma.$disconnect();
            return new Response(JSON.stringify({ error: "Utilisateur non trouvé." }), {
                status: 404,
                statusText: 'Not Found'
            });
        }

        await prisma.$disconnect();
        return new Response(JSON.stringify(user), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 200,
            statusText: 'OK'
        });

    } catch (error) {
        await prisma.$disconnect();
        console.error("Erreur lors de la récupération de l'utilisateur:", error);
        return new Response(JSON.stringify({ error: "Une erreur s'est produite lors de la récupération de l'utilisateur." }), {
            status: 500,
            statusText: 'Internal Server Error'
        });
    }
}
