import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const query = url.searchParams.get('query');

        const users = await prisma.user.findMany({
            where: query ? {
                pseudo: {
                    contains: query,
                    mode: 'insensitive'
                }
            } : {},
            select: {
                id: true,
                name: false,
                pseudo: true,
                avatar: true,
                customAvatarUrl: true,
            }
        });

        return new Response(JSON.stringify(users), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 200,
            statusText: 'OK'
        });


    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
        return new Response(JSON.stringify({ error: "Une erreur s'est produite lors de la récupération des utilisateurs." }), {
            status: 500,
            statusText: 'Internal Server Error'
        });
    }
}
