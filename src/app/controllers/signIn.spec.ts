import { auth } from "../firebase/firebase";
import { UserDTO } from "../DTO/UserDTO";
import { AuthController } from "./AuthController";
import { right } from "../utils/either";

// Should return a UserDTO with accessToken and refreshToken
it('should return a UserDTO with accessToken and refreshToken', async () => {
    // Arrange
    const errorMessages = {};
    const user = new UserDTO('uid', 'test@example.com', 'password', "token", "");

    const controller = new AuthController(auth);
    
    controller.signIn = jest.fn().mockResolvedValue(right(user));

    // Act
    const result = await controller.signIn(user);

    // Assert
    expect(result).toEqual(right(expect.objectContaining({ accessToken: 'token', refreshToken: expect.any(String) })));
});