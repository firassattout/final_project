import AuthService from "../services/authService.mjs";

class AuthFacade {
  async handleFirstRegister(data) {
    return AuthService.firstRegister(data);
  }
  async handleSecondRegister(data) {
    return AuthService.secondRegister(data);
  }

  async handleLogin(data) {
    return AuthService.login(data);
  }
  async handleDeactivation(data) {
    return AuthService.userDeactivation(data);
  }
  async getUser(data) {
    return AuthService.getUser(data);
  }
  async getCompanyType(data) {
    return AuthService.getCompanyType(data);
  }

  async handleRefreshToken(refreshToken) {
    return AuthService.refreshAccessToken(refreshToken);
  }
}

export default new AuthFacade();
