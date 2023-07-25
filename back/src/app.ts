import { join } from 'path';
import AutoLoad, {AutoloadPluginOptions} from '@fastify/autoload';
import { FastifyPluginAsync } from 'fastify';
import { TelegramClient } from './telegram';
import { Service } from './service';
import { Model } from './model';

export type AppOptions = {
  // Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>;


// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
}

declare module 'fastify' {
  interface FastifyInstance {
    service: Service;
    model: Model;
  }
}

const app: FastifyPluginAsync<AppOptions> = async (
    fastify,
    opts
): Promise<void> => {
  const telegram = new TelegramClient({
    token: process.env.TELEGRAM_TOKEN || '',
  });

  telegram.start();

  const service = new Service();
  const model = new Model(service, { telegram: { token: process.env.TELEGRAM_TOKEN || '' } });

  fastify.decorate('service', service);
  fastify.decorate('model', model);
  // Place here your custom code!

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts
  })
};

export default app;
export { app, options }
