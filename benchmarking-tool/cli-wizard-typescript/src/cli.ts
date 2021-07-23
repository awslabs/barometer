#!/usr/bin/env node
import { ConfigurationModule } from './lib/wizard/modules/configuration';
import { Configuration } from './lib/impl/configuration';

(async () => {
  await new ConfigurationModule().run(new Configuration());
})();
