#!/usr/bin/env node

import { Configuration } from './lib/impl/configuration';

(async () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const conf_module = require('./lib/wizard/modules/configuration');
  await conf_module.Module.getInstance(new Configuration()).runConfigurationModule();
})();
