import { FastifyPluginAsync } from 'fastify';

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post<{Body: { token: string }  }>('/web_app_data', {
    schema: {
      body: {
        type: 'object',
        required: ['token'],
        properties: {
          token: { type: 'string' },
        }
      }
    }
  }, async function (request, reply) {
    const userTelegram = fastify.model.telegram.verify(request.body.token);
    const user = await fastify.model.user.getByTelegramId(userTelegram.id);
    if (!user) {
      reply.code(404).send({ error: 'User not found' });
      return;
    }
    const token = fastify.model.user.getAuthToken(user);
    return { 
      token,
      is_admin: user.name === 'admin',
      user,
      is_new_user: false,
    }
  })
}

export default root;
