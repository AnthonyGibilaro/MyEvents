import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    const { userIds, requesterId } = await request.json();

    let urlSegments = request.url.split("/");
    let outingIdString = decodeURIComponent(urlSegments[urlSegments.length - 2]);
    const outingId = parseInt(outingIdString);

    if (isNaN(outingId) || outingId <= 0) {
        await prisma.$disconnect();
        return new Response(JSON.stringify({ error: "ID de sortie invalide." }), {
            status: 400,
        });
    }

    const outingDetails = await prisma.outing.findUnique({
        where: { id: outingId },
        include: { Participant: true }
    });

    if (!outingDetails) {
        await prisma.$disconnect();
        return new Response(JSON.stringify({ error: "Sortie non trouvée." }), {
            status: 404,
        });
    }

    if (outingDetails.visibility === 'private' && outingDetails.organizerId !== requesterId && !outingDetails.Participant.some(p => p.userId === requesterId)) {
        await prisma.$disconnect();
        return new Response(JSON.stringify({ error: "Vous n'êtes pas autorisé à inviter des participants à cette sortie privée." }), {
            status: 403,
        });
    }

    try {

        const newParticipants = userIds.map((userId: string) => ({
            userId,
            outingId,
            role: "guest",
        }));

        await prisma.participant.createMany({
            data: newParticipants,
        });

        await prisma.$disconnect();
        return new Response(JSON.stringify({ message: "Les participants ont été ajoutés avec succès." }), {
            status: 201,
        });
    } catch (error) {
        await prisma.$disconnect();
        console.error("Erreur lors de l'ajout des participants :", error);
        return new Response(JSON.stringify({ error: "Une erreur s'est produite lors de l'ajout des participants." }), {
            status: 500,
        });
    }
}

export async function DELETE(request: Request) {
    const { userId, requesterId } = await request.json();

    if (!userId) {
        await prisma.$disconnect();
        return new Response(JSON.stringify({ error: "L'ID de l'utilisateur est requis." }), {
            status: 400,
        });
    }

    let urlSegments = request.url.split("/");
    let outingIdString = decodeURIComponent(urlSegments[urlSegments.length - 2]);
    const outingId = parseInt(outingIdString);

    if (isNaN(outingId) || outingId <= 0) {
        return new Response(JSON.stringify({ error: "ID de sortie invalide." }), {
            status: 400,
        });
    }

    // Récupérer les détails de la sortie pour vérifier si le requesterId est l'hôte
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

    // Autoriser la suppression seulement si le requester est l'hôte ou l'utilisateur lui-même
    if (outingDetails.organizerId !== requesterId && userId !== requesterId) {
        await prisma.$disconnect();
        return new Response(JSON.stringify({ error: "Vous n'êtes pas autorisé à retirer ce participant." }), {
            status: 403,
        });
    }


    try {
        const existingParticipant = await prisma.participant.findFirst({
            where: {
                userId: userId,
                outingId: outingId,
            }
        });

        if (!existingParticipant) {
            await prisma.$disconnect();
            return new Response(JSON.stringify({ error: "Vous n'êtes pas participant à cette sortie." }), {
                status: 400,
            });
        }

        await prisma.participant.delete({
            where: {
                id: existingParticipant.id,
            }
        });

        await prisma.$disconnect();
        return new Response(JSON.stringify({ message: "Participant retiré avec succès." }), {
            status: 200,
        });
    } catch (error) {
        await prisma.$disconnect();
        console.error("Erreur lors de la suppression d'un participant:", error);
        return new Response(JSON.stringify({ error: "Une erreur s'est produite lors de la suppression du participant." }), {
            status: 500,
        });
    }
}

