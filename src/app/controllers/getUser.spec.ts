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

  // Act
  const result = await AuthController.getUser(request);

  // Assert
  expect(result).toEqual(left(errorMessage));
});