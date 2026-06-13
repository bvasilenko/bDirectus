import { defineInterface } from '@directus/extensions-sdk';
import DirectiveDisplay from './DirectiveDisplay.vue';

export default defineInterface({
  id: 'bsuite-directive',
  name: 'b-suite directive',
  icon: 'verified',
  description: 'Read-only display for b-suite directive bundles.',
  component: DirectiveDisplay as never,
  types: ['json'],
  options: null
});
