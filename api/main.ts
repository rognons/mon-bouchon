import { Application, Router } from "@oak/oak";
import { oakCors } from "cors";

// Infrastructure
import { JsonBouchonRepository } from "./src/infrastructure/repositories/JsonBouchonRepository.ts";
import { BouchonController } from "./src/infrastructure/adapters/BouchonController.ts";

// Application
import { SearchBouchonsUseCase } from "./src/application/usecases/SearchBouchonsUseCase.ts";
import { GetFilterOptionsUseCase } from "./src/application/usecases/GetFilterOptionsUseCase.ts";

// Dependency Injection
const bouchonRepository = new JsonBouchonRepository(
  "./src/infrastructure/data/bouchons.json",
);
const searchBouchonsUseCase = new SearchBouchonsUseCase(bouchonRepository);
const getFilterOptionsUseCase = new GetFilterOptionsUseCase(bouchonRepository);
const bouchonController = new BouchonController(
  searchBouchonsUseCase,
  getFilterOptionsUseCase,
);

// Router setup
const router = new Router();

// Endpoints
router.get("/bouchons", (ctx) => bouchonController.getBouchons(ctx));
router.get("/filters", (ctx) => bouchonController.getFilterOptions(ctx));

// Health check
router.get("/health", (ctx) => {
  ctx.response.body = {
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Mon Bouchon API - Architecture Hexagonale",
  };
});

// App setup
const app = new Application();

// CORS middleware
app.use(oakCors({
  origin: "*",
  methods: ["GET"],
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

// Start server
const port = 8000;

console.log(
  `🚀 Mon Bouchon API started at http://localhost:${port}`,
);
console.log("📍 Available routes:");
console.log(
  "   GET /bouchons - Search bouchons with optional filters (paginated, 6 per page)",
);
console.log("   GET /filters - Get all available filter options");
console.log("   GET /health - API status");

await app.listen({ port });
