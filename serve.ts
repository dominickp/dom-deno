import Server from "https:/deno.land/x/lume/core/server.ts";
import cache_busting from "https:/deno.land/x/lume/middlewares/cache_busting.ts";
import not_found from "https:/deno.land/x/lume/middlewares/not_found.ts";

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

server.start();

console.log("Listening on http://localhost:8000");
