import * as migration_20260730_054932_ghee_schema_sync from './20260730_054932_ghee_schema_sync';

export const migrations = [
  {
    up: migration_20260730_054932_ghee_schema_sync.up,
    down: migration_20260730_054932_ghee_schema_sync.down,
    name: '20260730_054932_ghee_schema_sync'
  },
];
