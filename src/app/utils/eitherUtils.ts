import { Auth as AdminAuth } from "firebase-admin/auth"
import { Either, Left, Right, isLeft, left, map_either, match, right } from "./either"
import { ComposableFunction, curry } from "./functionalUtils"
import { UserDTO } from "../DTO/UserDTO"
import { ErrorMessages } from "../interfaces/ErrorMessages"

export type TokenEither = Either<string, string>
export type UserEither = Either<string, UserDTO>

type HasBearer = (keyword: string, header: TokenEither) => TokenEither
export const hasBearer: HasBearer = (keyword, header) => match(
        (value: string) => left(value),
        (value: string) => value.startsWith(keyword) ? right(value) : left("Formato de header inválido")
    )(header)

export const curriedHasBearer = curry(hasBearer)

type Exists = (value: TokenEither) => TokenEither
export const exists: Exists = match(
    (val) => left(val),
    (val) => val !== null && val !== undefined ? right(val) : left("Formato de header inválido")
)

export const curriedExists = curry(exists)


type GetToken = (keyword: string, header: TokenEither) => TokenEither
export const getToken: GetToken = (keyword, header) => match(
    (value: string) => left(value),
    (value: string) => right(value.slice(keyword.length - 1))
)(header)

export const curriedGetToken = curry(getToken)

type VerifyToken = (auth: AdminAuth, errorMessages: ErrorMessages, header: TokenEither) => Promise<UserEither>
export const verifyToken: VerifyToken = (auth, errorMessages, header) => match(
    async (value: string) => left(value) as UserEither,
    (value: string) => {
        return new Promise(async (resolve, reject) => {
            try {
                const { uid, email } = await auth.verifyIdToken(value);
                resolve(right(new UserDTO(uid, email)));
            } catch (error) {
                reject(left(errorMessages[error.code] ?? error.message));
            }
        })
    }
)(header)

export const curriedVerifyToken = curry(verifyToken)