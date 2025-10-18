import { Application, Router } from "@oak/oak";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

// Infrastructure
import { JsonBouchonRepository } from "./src/infrastructure/repositories/JsonBouchonRepository.ts";
import { BouchonController } from "./src/infrastructure/adapters/BouchonController.ts";

// Application
import { SearchBouchonsUseCase } from "./src/application/usecases/SearchBouchonsUseCase.ts";
import { GetBouchonByIdUseCase } from "./src/application/usecases/GetBouchonByIdUseCase.ts";
import { GetAllBouchonsUseCase } from "./src/application/usecases/GetAllBouchonsUseCase.ts";

// Configuration
const DATA_FILE_PATH = "./data/bouchons.json";
const PORT = 8000;

// Dependency Injection Container
class DIContainer {
  private static instance: DIContainer;
  private _bouchonRepository?: JsonBouchonRepository;
  private _bouchonController?: BouchonController;

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  getBouchonRepository(): JsonBouchonRepository {
    if (!this._bouchonRepository) {
      this._bouchonRepository = new JsonBouchonRepository(DATA_FILE_PATH);
    }
    return this._bouchonRepository;
  }

  getBouchonController(): BouchonController {
    if (!this._bouchonController) {
      const repository = this.getBouchonRepository();

      // Injection des use cases
      const searchBouchonsUseCase = new SearchBouchonsUseCase(repository);
      const getBouchonByIdUseCase = new GetBouchonByIdUseCase(repository);
      const getAllBouchonsUseCase = new GetAllBouchonsUseCase(repository);

      this._bouchonController = new BouchonController(
        searchBouchonsUseCase,
        getBouchonByIdUseCase,
        getAllBouchonsUseCase,
      );
    }
    return this._bouchonController;
  }
}

// Configuration des routes
function setupRoutes(): Router {
  const router = new Router();
  const container = DIContainer.getInstance();
  const bouchonController = container.getBouchonController();

  // Routes avec délégation au controller
  router.get("/search", async (ctx) => {
    await bouchonController.search(ctx);
  });

  router.get("/bouchons", async (ctx) => {
    await bouchonController.getAll(ctx);
  });

  router.get("/bouchons/:id", async (ctx) => {
    await bouchonController.getById(ctx);
  });

  router.get("/health", async (ctx) => {
    await bouchonController.health(ctx);
  });

  return router;
}

// Configuration du serveur
async function startServer(): Promise<void> {
  const app = new Application();
  const router = setupRoutes();

  // Middlewares
  app.use(oakCors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }));

  // Logging middleware
  app.use(async (context, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`${context.request.method} ${context.request.url} - ${ms}ms`);
  });

  // Routes
  app.use(router.routes());
  app.use(router.allowedMethods());

  console.log("🚀 API Mon Bouchon démarrée sur http://localhost:" + PORT);
  console.log("📍 Routes disponibles:");
  console.log("   GET /search - Recherche avec critères");
  console.log("   GET /bouchons - Tous les bouchons");
  console.log("   GET /bouchons/:id - Bouchon spécifique");
  console.log("   GET /health - Statut de l'API");
  console.log("");
  console.log("🏗️  Architecture: Hexagonale (Ports & Adapters)");
  console.log("📦 Domain: Entities, Services, Ports");
  console.log("🔧 Application: Use Cases");
  console.log("🌐 Infrastructure: Repositories, Controllers");

  await app.listen({ port: PORT });
}

// Point d'entrée
if (import.meta.main) {
  try {
    await startServer();
  } catch (error) {
    console.error("❌ Erreur lors du démarrage du serveur:", error);
    Deno.exit(1);
  }
}
