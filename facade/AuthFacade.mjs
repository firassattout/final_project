import AuthService from "../services/authService.mjs";

class AuthFacade {
  constructor() {
    this.authService = new AuthService();
  }

  async handleFirstRegister(data) {
    return this.authService.firstRegister(data);
  }
  async handleSecondRegister(data) {
    return this.authService.secondRegister(data);
  }

  async handleLogin(data) {
    return this.authService.login(data);
  }

  async handleRefreshToken(refreshToken) {
    return this.authService.refreshAccessToken(refreshToken);
  }
}

export default AuthFacade;
