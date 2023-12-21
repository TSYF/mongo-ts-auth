import { Auth as AdminAuth } from "firebase-admin/auth"
import { Either, left, match, right } from "./either"
import { compose, curry } from "./functionalUtils"
import { UserDTO } from "../DTO/UserDTO"
import { ErrorMessages } from "../interfaces/ErrorMessages"
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"

export type TokenEither = Either<string, string>
export type UserEither = Either<string, UserDTO>

type HasBearer = (keyword: string, header: TokenEither) => TokenEither
/**
 * Checks if the given header value starts with the provided keyword.
 * 
 * @param keyword - The keyword to check for at the start of the header value
 * @param header - The header value to check
 * @returns A right with the header value if it starts with the keyword, 
 *          otherwise a left with an error message
 */
export const hasKeyword: HasBearer = (keyword, header) => match(
    (value: string) => left(value),
    (value: string) => value.startsWith(keyword) ? right(value) : left("Formato de header inválido")
)(header)

type Exists = (value: TokenEither) => TokenEither
/**
 * Checks if the given value exists by matching on the Either type.
 * 
 * @param value - The value to check
 * @returns A left with the original value if it does not exist, 
 *          otherwise a right with the value
 */
export const exists: Exists = match(
    (value) => left(value),
    (value) => value !== null && value !== undefined ? right(value) : left("Formato de header inválido")
)

type GetToken = (keyword: string, header: TokenEither) => TokenEither
/**
 * Gets the token from the header by matching on the Either type.
 * 
 * @param keyword - The keyword to slice from the start of the header value
 * @param header - The header value containing the token
 * @returns A left with the original header value if invalid, 
 *          otherwise a right with the extracted token
 */
export const getToken: GetToken = (keyword, header) => match(
    (value: string) => left(value),
    (value: string) => right(value.slice(keyword.length - 1))
)(header)

type VerifyToken = (auth: AdminAuth, errorMessages: ErrorMessages, header: TokenEither) => Promise<UserEither>
/**
 * Verifies a JWT token by decoding it with the Auth object. 
 * Returns a UserDTO if valid, otherwise an error message.
 * 
 * @param auth - The Firebase Auth object
 * @param errorMessages - Map of error codes to error messages
 * @param header - The Authorization header containing the JWT token
 * @returns A UserEither with the decoded UserDTO or an error message
 */
export const verifyToken: VerifyToken = (auth, errorMessages, header) => match(
    async (value: string) => left(value),
    async (value: string) => {
        try {
            const { uid, email } = await auth.verifyIdToken(value);
            return right(new UserDTO(uid, email));
        } catch (error) {
            return left(errorMessages[error.code] ?? error.message);
        }
    }
)(header)


type SignIn = (auth: Auth, errorMessages: ErrorMessages, user: UserEither) => Promise<UserEither>
/**
 * Signs in a user with email and password authentication. 
 * 
 * @param auth - The Firebase Auth object
 * @param errorMessages - Map of error codes to error messages  
 * @param user - A UserEither with the user credentials
 * @returns A UserEither with the signed in user info or an error message
*/
export const signIn: SignIn = (auth, errorMessages, user) => match(
    async (value: string) => left(value),
    async (value: UserDTO) => {
        try {
            let { user: fbUser } = await signInWithEmailAndPassword(auth, value.email!, value.password!);
            const token = await fbUser.getIdToken();
            const returnedUser = compose(
                buildUser("refreshToken", fbUser.refreshToken!),
                buildUser("accessToken", token),
                buildUser("email", fbUser.email!)
            )(new UserDTO());
            return right(returnedUser);
        } catch (error) {
            return left(errorMessages[error.code] ?? error.message);
        }
    }
)(user)

type CreateUser = (auth: Auth, errorMessages: ErrorMessages, user: UserEither) => Promise<UserEither>
/**
 * Creates a new user with the given credentials.
 * 
 * @param auth - The Firebase Auth object
 * @param errorMessages - Map of error codes to error messages
 * @param user - UserEither with credentials 
 * @returns - Contains created user info or error message
*/
export const createUser: CreateUser = (auth, errorMessages, user) => match(
    async (value: string) => left(value),
    async (value: UserDTO) => {
        try {
            const { user: signedUser } = await createUserWithEmailAndPassword(auth, value.email!, value.password!);
            const { uid, email, getIdToken, refreshToken } = signedUser;
            const accessToken = await getIdToken()!;
            const userDTO = compose(
                buildUser("refreshToken", refreshToken!),
                buildUser("accessToken", accessToken),
                buildUser("email", email!),
                buildUser("uid", uid),
            )(new UserDTO());
            return right(userDTO);
        } catch (error) {
            return left(errorMessages[error.code] ?? error.message);
        }
    }
)(user)



const buildUser = curry((key: keyof UserDTO, value: UserDTO[keyof UserDTO], user: UserDTO): UserDTO => {
    const userDTO = { ...user };
    userDTO[key] = value;
    return userDTO;
})

export const cHasBearer   = curry(hasKeyword)
export const cExists      = curry(exists)
export const cGetToken    = curry(getToken)
export const cVerifyToken = curry(verifyToken)
export const cSignIn      = curry(signIn)