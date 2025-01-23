const jsonOrThrowIfError = async (response) => {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || "Une erreur inconnue s'est produite");
    } catch (err) {
      throw new Error("Erreur réseau ou réponse non valide");
    }
  }
  try {
    return await response.json();
  } catch (err) {
    throw new Error("Réponse JSON invalide");
  }
};

class Api {
  constructor({ baseUrl }) {
    this.baseUrl = baseUrl;
  }

  async get({ url, headers }) {
    return jsonOrThrowIfError(
      await fetch(`${this.baseUrl}${url}`, {
        headers,
        method: "GET",
      })
    );
  }

  async post({ url, data, headers }) {
    return jsonOrThrowIfError(
      await fetch(`${this.baseUrl}${url}`, {
        headers,
        method: "POST",
        body: JSON.stringify(data), // Sérialise les données pour éviter des erreurs
      })
    );
  }

  async delete({ url, headers }) {
    return jsonOrThrowIfError(
      await fetch(`${this.baseUrl}${url}`, {
        headers,
        method: "DELETE",
      })
    );
  }

  async patch({ url, data, headers }) {
    return jsonOrThrowIfError(
      await fetch(`${this.baseUrl}${url}`, {
        headers,
        method: "PATCH",
        body: JSON.stringify(data), // Sérialise les données
      })
    );
  }
}

const getHeaders = (headers = {}) => {
  const h = {};
  if (!headers.noContentType) h["Content-Type"] = "application/json";
  const jwt = localStorage.getItem("jwt");
  if (jwt && !headers.noAuthorization) h["Authorization"] = `Bearer ${jwt}`;
  return { ...h, ...headers };
};

class ApiEntity {
  constructor({ key, api }) {
    this.key = key;
    this.api = api;
  }

  async select({ selector, headers = {} }) {
    return await this.api.get({
      url: `/${this.key}/${selector}`,
      headers: getHeaders(headers),
    });
  }

  async list({ headers = {} } = {}) {
    return await this.api.get({
      url: `/${this.key}`,
      headers: getHeaders(headers),
    });
  }

  async update({ data, selector, headers = {} }) {
    return await this.api.patch({
      url: `/${this.key}/${selector}`,
      headers: getHeaders(headers),
      data,
    });
  }

  async create({ data, headers = {} }) {
    return await this.api.post({
      url: `/${this.key}`,
      headers: getHeaders(headers),
      data,
    });
  }

  async delete({ selector, headers = {} }) {
    return await this.api.delete({
      url: `/${this.key}/${selector}`,
      headers: getHeaders(headers),
    });
  }
}

class Store {
  constructor() {
    this.api = new Api({ baseUrl: "http://localhost:5678" });
  }

  user = (uid) =>
    new ApiEntity({ key: "users", api: this.api }).select({
      selector: uid,
    });

  users = () => new ApiEntity({ key: "users", api: this.api });

  login = (data) =>
    this.api.post({
      url: "/auth/login",
      data,
      headers: getHeaders({ noAuthorization: true }),
    });

  bill = (bid) =>
    new ApiEntity({ key: "bills", api: this.api }).select({
      selector: bid,
    });

  bills = () => new ApiEntity({ key: "bills", api: this.api });
}

export default new Store();
