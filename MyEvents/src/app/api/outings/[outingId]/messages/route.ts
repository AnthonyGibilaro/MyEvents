import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { userId, message } = await request.json();

        // Récupération et décodage de l'outingId à partir de l'URL
        console.log('URL:', request.url);
        let outingIdString = decodeURIComponent((request.url.split("/")[5] || ""));
        const outingId = parseInt(outingIdString);
        console.log('outingIdString:', outingIdString);
        console.log('outingId:', outingId);


        // console.log('userId:', userId);
        // console.log('message:', message);
        // console.log('outingId:', outingId);

        if (!userId || !message || isNaN(outingId) || outingId <= 0) {
            return new Response(JSON.stringify({ error: "Données invalides." }), {
                status: 400,
                statusText: 'Bad Request'
            });
        }


        const newMessage = await prisma.message.create({
            data: {
                userId: userId,
                outingId: outingId,
                message: message,
                timestamp: new Date()
            },
            select: {
                id: true,
                message: true,
                timestamp: true,
                user: {
                    select: {
                        pseudo: true,
                        avatar: true,
                        name: true,
                    }
                }
            }
        });

        return new Response(JSON.stringify(newMessage), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 201,
            statusText: 'Created'
        });

    } catch (error) {
        console.error("Erreur lors de la création du message:", error);
        return new Response(JSON.stringify({ error: "Une erreur s'est produite lors de la création du message." }), {
            status: 500,
            statusText: 'Internal Server Error'
        });
    }
}

export async function GET(request: Request) {
    try {
        // Récupération et décodage de l'outingId à partir de l'URL
        let outingIdString = decodeURIComponent((request.url.split("/")[5] || ""));
        const outingId = parseInt(outingIdString);

        if (isNaN(outingId) || outingId <= 0) {
            return new Response(JSON.stringify({ error: "ID de sortie invalide." }), {
                status: 400,
                statusText: 'Bad Request'
            });
        }

        const messages = await prisma.message.findMany({
            where: { outingId: outingId },
            include: {
                user: true
            },
            orderBy: {
                timestamp: 'asc'
            }
        });

        return new Response(JSON.stringify(messages), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 200,
            statusText: 'OK'
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des messages:", error);
        return new Response(JSON.stringify({ error: "Une erreur s'est produite lors de la récupération des messages." }), {
            status: 500,
            statusText: 'Internal Server Error'
        });
    }
}
