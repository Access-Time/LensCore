import { DockerValidationService } from './utils/docker-validation';
import { DockerOperationsService } from './utils/docker-operations';

export class DockerService {
  private port = 3001;
  private validationService: DockerValidationService;
  private operationsService: DockerOperationsService;

  constructor(port?: number) {
    if (port) {
      this.port = port;
    }
    this.validationService = new DockerValidationService();
    this.operationsService = new DockerOperationsService(port);
  }

  async checkDocker(): Promise<boolean> {
    return this.validationService.checkDocker();
  }

  async checkDockerDaemon(): Promise<boolean> {
    return this.validationService.checkDockerDaemon();
  }

  async checkDockerCompose(): Promise<boolean> {
    return this.validationService.checkDockerCompose();
  }

  async build(): Promise<void> {
    return this.operationsService.build();
  }

  async start(): Promise<void> {
    return this.operationsService.start();
  }

  async stop(): Promise<void> {
    return this.operationsService.stop();
  }

  async status(): Promise<void> {
    return this.operationsService.status();
  }

  async validatePort(): Promise<boolean> {
    return this.validationService.validatePort(this.port);
  }

  async validateImage(): Promise<boolean> {
    return this.validationService.validateImage();
  }

  async ensureServicesReady(): Promise<void> {
    return this.operationsService.ensureServicesReady();
  }

}
