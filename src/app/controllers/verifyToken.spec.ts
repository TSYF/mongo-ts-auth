import { UserDTO } from "../DTO/UserDTO";
import { auth } from "../firebase/firebaseAdmin";
import { isLeft } from "../utils/either";
import { AuthController } from "./AuthController";


// Verify a undefined user token and return an error message.
it('should verify a undefined user token and return an error message', async () => {
    const authController = new AuthController(auth);
    const user = new UserDTO();
    user.accessToken = undefined;

    const result = await authController.verify(user);

    expect(isLeft(result)).toBe(true);
    expect(result.left).toBe("Decodificación de token fallida");
});

// Verify a user token with a length of 101 and return an error message.
it('should verify a user token with a length of 101 and return an error message', async () => {
    const authController = new AuthController(auth);
    const user = new UserDTO();
    user.accessToken = "a".repeat(101);

    const result = await authController.verify(user);

    expect(isLeft(result)).toBe(true);
    expect(result.left).toBe("Decodificación de token fallida");
});

// Verify a user token with a length of 1001 and return an error message.
it('should verify a user token with a length of 1001 and return an error message', async () => {
    const authController = new AuthController(auth);
    const user = new UserDTO();
    user.accessToken = "a".repeat(1001);

    const result = await authController.verify(user);

    expect(isLeft(result)).toBe(true);
    expect(result.left).toBe("Decodificación de token fallida");
});