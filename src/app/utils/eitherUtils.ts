import { Either, left, match, right } from "./either"
import { compose, curry } from "./functionalUtils"
import { UserDTO } from "../DTO/UserDTO"
import { ErrorMessages } from "../interfaces/ErrorMessages"
import jwt, { Secret, SignOptions } from "jsonwebtoken"
import bcrypt from "bcrypt"
import { v4 } from "uuid";
import { readFileSync } from "fs"
import { UserDAO } from "../model/UserDAO"
import mongoose from "mongoose"


const User = mongoose.model("users", new mongoose.Schema({
    _id: String,
    email: String,
    password: String,
    image: String
}));

mongoose.connect(process.env.MONGO_CONN_STRING!);


type HashFunction    = (data: string | Buffer, saltOrRounds: string | number) => Promise<string>;
type JWTSignFunction = (payload: string | Buffer | object, key: Secret, options?: SignOptions) => string;

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

type VerifyToken = (header: TokenEither) => Promise<UserEither>
export const verifyToken: VerifyToken = (header) => match(
    async (value: string) => left(value),
    async (value: string) => {
        try {
            const key = readFileSync("../../keys/jwtRS256.key.pub", "utf8");
            const { _id, email } = <UserDTO>jwt.verify(value, key, { algorithms: ["RS256"] });
            return right(new UserDTO(_id, email));
        } catch ({ message }) {
            return left(message);
        }
    }
)(header)


type SignIn = (hash: HashFunction, user: UserEither) => Promise<UserEither>
export const signIn: SignIn = (hash, user) => match(
    async (value: string) => left(value),
    async (value: UserDTO) => {
        try {

            const { email, password } = value;
            
            const pass = await User.find(mongoose.sanitizeFilter({
                email
            })).then(res => res!.at(0)!.password);

            if (await hash(password!, 10) !== pass) return left("Invalid password");
            
            const key = readFileSync("../../src/keys/jwtRS256.key", "utf8");
            const accessToken  = jwt.sign(user, key, { expiresIn: "30m", algorithm: "RS256" });
            const refreshToken = jwt.sign(user, key, { expiresIn: "3h", algorithm: "RS256" });
            
            const returnedUser = compose(
                buildUser("refreshToken", refreshToken),
                buildUser("accessToken", accessToken),
                // buildUser("image", image),
                buildUser("email", email)
            )(new UserDTO());
            return right(returnedUser);
        } catch ({ message }) {
            return left(message);
        }
    }
)(user)

type CreateUser = (sign: JWTSignFunction, hash: HashFunction, user: UserEither) => Promise<UserEither>
export const createUser: CreateUser = (sign, hash, user) => match(
    async (value: string) => left(value),
    async (user: UserDTO) => {
        try {
            // const { user: signedUser } = await createUserWithEmailAndPassword(auth, value.email!, value.password!);
            // const { _id, email, getIdToken, refreshToken } = signedUser;

            user._id = v4();
            const { email, image } = user;

            user.password = await hash(user.password!, 10);

            const key = readFileSync("../../src/keys/jwtRS256.key", "utf8");
            const accessToken  = sign({ user }, key, { expiresIn: "30m", algorithm: "RS256" });
            const refreshToken = sign({ user }, key, { expiresIn: "3h", algorithm: "RS256" });
            
            UserDAO.addUser(user);

            delete user.password;

            const userDTO = compose(
                buildUser("refreshToken", refreshToken),
                buildUser("accessToken", accessToken),
                buildUser("image", image!),
                buildUser("email", email!),
                buildUser("_id", user._id),
            )(new UserDTO());
            return right(userDTO);
        } catch ({message }) {
            return left(message);
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
export const cCreateUser  = curry(createUser)