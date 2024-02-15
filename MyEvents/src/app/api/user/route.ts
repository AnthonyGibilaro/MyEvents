import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
    const id = req.nextUrl.searchParams.get('id');

    if (!id) {
        return new Response(JSON.stringify({ error: 'L\'id est requis' }), {
            status: 400,
            statusText: 'Bad Request',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: id as string
            },
            select: {
                id: true,
                pseudo: true,
                name: true,
                avatar: true,
                customAvatarUrl: true,
                bio: true,
                outings: {
                    select: {
                        id: true,
                        eventName: true,
                        visibility: true,
                        organizer: {
                            select: {
                                pseudo: true
                            }
                        }
                    }
                },
                outingsJoined: {
                    select: {
                        outing: {
                            select: {
                                id: true,
                                eventName: true,
                                visibility: true,
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
            }
        });


        if (!user) {
            return new Response(JSON.stringify({ error: "Utilisateur non trouvé." }), {
                status: 404,
                statusText: 'Not Found'
            });
        }

        return new Response(JSON.stringify(user), {
            status: 200,
            statusText: 'OK',
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error);
        return new Response(JSON.stringify({ error: "Une erreur s'est produite lors de la récupération de l'utilisateur." }), {
            status: 500,
            statusText: 'Internal Server Error'
        });
    }
}

export async function POST(request: Request) {
    const { userId, pseudo, bio, customAvatarUrl } = await request.json();

    if (!userId || (!pseudo && !bio && !customAvatarUrl)) {
        await prisma.$disconnect();
        return new Response(JSON.stringify({ error: "L'ID de l'utilisateur et au moins un champ à mettre à jour (pseudo, bio, ou avatar) sont requis." }), {
            status: 400,
        });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            await prisma.$disconnect();
            return new Response(JSON.stringify({ error: "Utilisateur non trouvé." }), {
                status: 404,
            });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                pseudo: pseudo ?? user.pseudo,
                bio: bio ?? user.bio,
                customAvatarUrl: customAvatarUrl ?? user.customAvatarUrl,
            },
        });

        await prisma.$disconnect();
        return new Response(JSON.stringify({ message: "Profil mis à jour avec succès.", user: updatedUser }), {
            status: 200,
        });
    } catch (error) {
        await prisma.$disconnect();
        console.error("Erreur lors de la mise à jour du profil :", error);
        return new Response(JSON.stringify({ error: "Une erreur s'est produite lors de la mise à jour du profil." }), {
            status: 500,
        });
    }

}








