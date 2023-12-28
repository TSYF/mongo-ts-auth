import { auth } from "../firebase/firebaseAdmin";
import { AuthController } from "./AuthController";
import { left } from "../utils/either";

it('should return an error message when given an authorization header without a Bearer token', async () => {
  // Arrange
  const request = {
    headers: {
      authorization: 'TokenWithoutBearer'
    }
  };
  const errorMessage = "Formato de header inválido";
  const authController = new AuthController(auth);

  // Act
  const result = await authController.getUser(request);

  // Assert
  expect(result).toEqual(left(errorMessage));
});