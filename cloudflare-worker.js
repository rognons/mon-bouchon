export default {
  async fetch(request) {
    const url = new URL(request.url);
    const hostname = url.hostname;

    let servers;

    switch (hostname) {
      case "mon-bouchon.fr":
      case "www.mon-bouchon.fr":
        servers = [
          "https://front-primary.mon-bouchon.fr",
          "https://front-secondary.mon-bouchon.fr",
        ];
        break;
      case "api.mon-bouchon.fr":
        servers = [
          "https://api-primary.mon-bouchon.fr",
          "https://api-secondary.mon-bouchon.fr",
        ];
        break;
      default:
        return fetch(request);
    }

    const targetUrl = url.pathname + url.search;

    for (const server of servers) {
      try {
        const resp = await fetch(server + targetUrl);
        if (resp.status < 300) {
          return resp;
        }
      } catch {
        continue;
      }
    }

    // All servers failed, try last one and return whatever we get
    return fetch(servers[servers.length - 1] + targetUrl);
  }
};
