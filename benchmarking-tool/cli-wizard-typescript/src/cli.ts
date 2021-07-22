#!/usr/bin/env node
import { runConfigurationWizard } from './lib/helpers/config-generator';

(async () => {
  await runConfigurationWizard();
})();