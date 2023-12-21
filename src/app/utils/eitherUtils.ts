import { Auth as AdminAuth } from "firebase-admin/auth"
import { Either, left, match, right } from "./either"
import { compose, curry } from "./functionalUtils"
import { UserDTO } from "../DTO/UserDTO"
import { ErrorMessages } from "../interfaces/ErrorMessages"
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"

export type TokenEither = Either<string, string>
export type UserEither = Either<string, UserDTO>

type HasBearer = (keyword: string, header: TokenEither) => TokenEither
export const hasBearer: HasBearer = (keyword, header) => match(
        (value: string) => left(value),
        (value: string) => value.startsWith(keyword) ? right(value) : left("Formato de header inválido")
    )(header)

type Exists = (value: TokenEither) => TokenEither
export const exists: Exists = match(
    (val) => left(val),
    (val) => val !== null && val !== undefined ? right(val) : left("Formato de header inválido")
)

type GetToken = (keyword: string, header: TokenEither) => TokenEither
export const getToken: GetToken = (keyword, header) => match(
    (value: string) => left(value),
    (value: string) => right(value.slice(keyword.length - 1))
)(header)

type VerifyToken = (auth: AdminAuth, errorMessages: ErrorMessages, header: TokenEither) => Promise<UserEither>
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

export const cHasBearer   = curry(hasBearer)
export const cExists      = curry(exists)
export const cGetToken    = curry(getToken)
export const cVerifyToken = curry(verifyToken)
export const cSignIn      = curry(signIn)