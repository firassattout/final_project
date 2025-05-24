import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: "https://gusc1-calm-eel-31697.upstash.io",
  token:
    "AXvRASQgODE1OGE5ZDctYjdlOS00ZmMwLWIzYjQtMmVmZmE5MzE0NGY4NGEwNzRkODFkY2FjNGJkMGFkM2UyOGYzMWEyOWU2OWU=",
});

export default redis;
