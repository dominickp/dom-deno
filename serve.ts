import Server from "https://deno.land/x/lume@v1.18.4/core/server.ts";
import cache_busting from "https://deno.land/x/lume@v1.18.4/middlewares/cache_busting.ts";
import not_found from "https://deno.land/x/lume@v1.18.4/middlewares/not_found.ts";
import www from "https://deno.land/x/lume@v1.18.4/middlewares/www.ts";
import serveCLI from "./serveCLI.ts";

const server = new Server({
  port: 8000,
  root: `${Deno.cwd()}/_site`,
});

server.use(
  not_found({
    root: `${Deno.cwd()}/_site`,
    page404: "./not-found/index.html",
    directoryIndex: false,
  }),
);
server.use(cache_busting({ regex: /\/v[\d]+\//, replacement: "/" }));

server.use(www({
  add: false, // false to remove, true to add it.
}));

server.use(serveCLI());

server.start();

console.log("Listening on http://localhost:8000");
