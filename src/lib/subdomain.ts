export function getSubdomain(host: string | null, rootDomain: string): string | null {
  if (!host) return null;

  // Remove porta
  const cleanHost = host.split(":")[0].toLowerCase();

  // Localhost / IP
  if (cleanHost === "localhost" || /^(\d{1,3}\.){3}\d{1,3}$/.test(cleanHost)) {
    return null;
  }

  // Domínio raiz (ex: metodogl.site ou www.metodogl.site)
  if (cleanHost === rootDomain || cleanHost === `www.${rootDomain}`) {
    return null;
  }

  // Subdomínio: joao.metodogl.site
  if (cleanHost.endsWith(`.${rootDomain}`)) {
    return cleanHost.replace(`.${rootDomain}`, "");
  }

  return null;
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
