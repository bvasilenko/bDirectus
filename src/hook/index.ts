import { defineHook } from '@directus/extensions-sdk';
import { loadBDirectusConfig } from '../config.js';
import { processPayload } from './process-payload.js';

interface HookLogger {
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;
}

interface HookContext {
  logger?: HookLogger;
}

interface ItemMeta {
  collection?: string;
}

export default defineHook(({ filter, action }, context) => {
  const config = loadBDirectusConfig();

  for (const collection of config.collections) {
    filter(`items.${collection}.create`, async (payload: unknown) => processPayload({ payload, collection, config }));
    filter(`items.${collection}.update`, async (payload: unknown) => processPayload({ payload, collection, config }));
  }

  action('items.create', (meta: ItemMeta) => logTelemetry(context, 'create', meta.collection));
  action('items.update', (meta: ItemMeta) => logTelemetry(context, 'update', meta.collection));
});

function logTelemetry(context: HookContext, event: 'create' | 'update', collection: string | undefined): void {
  context.logger?.info('bdirectus item lifecycle observed', { event, collection });
}
