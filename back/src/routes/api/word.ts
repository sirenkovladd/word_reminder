import { FastifyPluginAsync } from 'fastify';
import { Static, Type } from '@sinclair/typebox';

export const Authorization = Type.Object({
  authorization: Type.String(),
});

enum Service {
  Dictionary
}

export const explainWord = {
  querystring: Type.Object({
    service: Type.Optional(Type.Enum(Service))
  }),
  headers: Authorization,
  params: Type.Object({
    word: Type.String()
  })
}

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get<{ Headers: Static<typeof Authorization>, Querystring: Static<typeof explainWord.querystring>, Params: Static<typeof explainWord.params> }>('/word/explain/:word', {
    schema: explainWord
  }, async function (request, reply) {
    fastify.model.user.checkAuthToken(request.headers.authorization);
    const word = request.params.word;
    const service = request.query.service;
    if (service === Service.Dictionary) {
      return fastify.model.dictionary.explain(word);
    } else {
      return fastify.model.dictionary.explain(word);
    }
  });
}

export default root;
