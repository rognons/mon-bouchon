import { Application, Router } from "@oak/oak";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

// Infrastructure
import { JsonBouchonRepository } from "./src/infrastructure/repositories/JsonBouchonRepository.ts";
import { BouchonController } from "./src/infrastructure/adapters/BouchonController.ts";

// Application
import { SearchBouchonsUseCase } from "./src/application/usecases/SearchBouchonsUseCase.ts";

// Dependency Injection
const bouchonRepository = new JsonBouchonRepository(
  "./src/infrastructure/data/bouchons.json",
);
const searchBouchonsUseCase = new SearchBouchonsUseCase(bouchonRepository);
const bouchonController = new BouchonController(searchBouchonsUseCase);

// Router setup
const router = new Router();

// Single endpoint: GET /bouchons (with optional filters)
router.get("/bouchons", (ctx) => bouchonController.getBouchons(ctx));

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
  "🚀 API Mon Bouchon (Architecture Hexagonale) démarrée sur http://localhost:" +
    port,
);
console.log("📍 Route disponible:");
console.log("   GET /bouchons - Tous les bouchons avec filtres optionnels");
console.log("   GET /health - Statut de l'API");

await app.listen({ port });
