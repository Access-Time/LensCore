/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import chalk from 'chalk';
import ora from 'ora';
import { LensCoreClient } from '../services/lenscore-client.js';

export async function healthCommand() {
  const spinner = ora('Checking LensCore health...').start();

  try {
    const client = new LensCoreClient();
    
    spinner.text = 'Checking API health...';
    const isHealthy = await client.checkHealth();

    if (isHealthy) {
      spinner.succeed('LensCore is healthy');
      
      try {
        const response = await fetch('http://localhost:3001/api/health');
        if (response.ok) {
          const healthData = await response.json();
          
          console.log(chalk.green.bold('\n✅ Health Status:'));
          console.log(chalk.gray(`Status: ${healthData.status}`));
          console.log(chalk.gray(`Timestamp: ${healthData.timestamp}`));
          
          if (healthData.services) {
            console.log(chalk.blue('\n🔧 Services:'));
            Object.entries(healthData.services).forEach(([service, status]) => {
              const statusColor = status === 'up' ? chalk.green : chalk.red;
              console.log(chalk.gray(`  ${service}: ${statusColor(status)}`));
            });
          }
        }
      } catch {
        console.log(chalk.green('✅ LensCore is running'));
      }
      
      console.log(chalk.blue('\n🌐 API available at: http://localhost:3001'));
      console.log(chalk.gray('📊 Redis cache: localhost:6379'));
      
    } else {
      spinner.fail('LensCore is not healthy');
      console.log(chalk.red('\n❌ LensCore is not responding'));
      console.log(chalk.gray('💡 Try running: lens-core up'));
    }
    
  } catch (error: any) {
    spinner.fail('Health check failed');
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}
