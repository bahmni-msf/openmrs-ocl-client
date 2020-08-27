import { authenticatedInstance, unAuthenticatedInstance } from "../../api";

const api = {
  login: (username: string, password: string) =>
    unAuthenticatedInstance.post("/users/login/", { username, password }),
  getProfile: () => authenticatedInstance.get("/user/"),
  getUserOrgs: () => authenticatedInstance.get("/user/orgs/?limit=0")
};

export default api;
