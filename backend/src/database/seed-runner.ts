import { DataSource } from 'typeorm';
import { seedDatabase } from './seed';

export async function runSeed(dataSource: DataSource): Promise<void> {
  await seedDatabase(dataSource);
}

// Entry point for Docker startup seed
async function bootstrap() {
  const { default: dataSource } = await import('./data-source');
  await dataSource.initialize();
  await seedDatabase(dataSource);
  await dataSource.destroy();
}

if (require.main === module) {
  bootstrap().catch(console.error);
}
