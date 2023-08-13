import { FastifyPluginAsync } from 'fastify';
import { Static, Type } from '@sinclair/typebox';

export const QuizGet = Type.Object({
  count: Type.Optional(Type.Number()),
  group: Type.Optional(Type.String())
})

export const QuizPost = Type.Object({
  id: Type.String(),
  answer: Type.String(),
  salt: Type.String()
})

export const Authorization = Type.Object({
  authorization: Type.String(),
})

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get<{ Headers: Static<typeof Authorization>, Querystring: Static<typeof QuizGet> }>('/quiz', {
    schema: { querystring: QuizGet, headers: Authorization }
  }, async function (request, reply) {
    const user = fastify.model.user.checkAuthToken(request.headers.authorization);
    const count = request.query.count;
    const quiz = await fastify.model.quiz.getQuiz(user.id, count);
    return quiz;
  });

  fastify.get<{ Headers: Static<typeof Authorization>, Querystring: never }>('/quiz/group', {
    schema: {
      headers: Authorization
    }
  }, async function (request) {
    const user = fastify.model.user.checkAuthToken(request.headers.authorization);
    const groups = await fastify.model.quiz.getGroups(user.id);
    return groups;
  });

  fastify.post<{ Headers: Static<typeof Authorization>, Body: Static<typeof QuizPost> }>('/quiz', {
    schema: {
      body: QuizPost,
      headers: Authorization
    }
  }, async function (request) {
    const user = fastify.model.user.checkAuthToken(request.headers.authorization);
    const result = await fastify.model.quiz.checkAnswer(user.id, request.body.salt, request.body.id, request.body.answer);
    return result;
  });

  fastify.get<{ Headers: Static<typeof Authorization>, Body: Static<typeof QuizPost> }>('/quiz/words', {
    schema: {
      headers: Authorization
    }
  }, async function (request) {
    const user = fastify.model.user.checkAuthToken(request.headers.authorization);
    const result = await fastify.model.quiz.getWords(user.id);
    return {
      words: result
    };
  });
}

export default root;
