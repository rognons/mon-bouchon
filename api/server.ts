import { Application, Router } from "@oak/oak";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

// Infrastructure
import { JsonBouchonRepository } from "./src/infrastructure/repositories/JsonBouchonRepository.ts";
import { BouchonController } from "./src/infrastructure/adapters/BouchonController.ts";

// Application
import { SearchBouchonsUseCase } from "./src/application/usecases/SearchBouchonsUseCase.ts";

// Configuration
const DATA_FILE_PATH = "./data/bouchons.json";
const PORT = 8000;

// Dependency Injection Container
class DIContainer {
  private static instance: DIContainer;

  // Repositories
  public readonly bouchonRepository: JsonBouchonRepository;

  // Use Cases
  public readonly searchBouchonsUseCase: SearchBouchonsUseCase;

  // Controllers
  public readonly bouchonController: BouchonController;

  private constructor() {
    // Infrastructure
    this.bouchonRepository = new JsonBouchonRepository(DATA_FILE_PATH);

    // Application
    this.searchBouchonsUseCase = new SearchBouchonsUseCase(
      this.bouchonRepository,
    );

    // Controllers
    this.bouchonController = new BouchonController(this.searchBouchonsUseCase);
  }

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }
}

// Setup
const container = DIContainer.getInstance();
const router = new Router();

// Routes
router.get("/bouchons", async (ctx) => {
  await container.bouchonController.getBouchons(ctx);
});

router.get("/health", async (ctx) => {
  await container.bouchonController.health(ctx);
});

// Application setup
const app = new Application();

// CORS
app.use(oakCors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  headers: ["Content-Type", "Authorization"],
}));

// Logging middleware
app.use(async (context, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(
    `${context.request.method} ${context.request.url.pathname} - ${ms}ms`,
  );
});

// Routes
app.use(router.routes());
app.use(router.allowedMethods());

// Error handling
app.addEventListener("error", (evt) => {
  console.error("Application error:", evt.error);
});

console.log(
  `🚀 API Mon Bouchon (Architecture Hexagonale) démarrée sur http://localhost:${PORT}`,
);
console.log(`📍 Routes disponibles:`);
console.log(
  `   GET /bouchons - Liste tous les bouchons (avec critères optionnels)`,
);
console.log(`   GET /health - Statut de l'API`);

await app.listen({ port: PORT });
