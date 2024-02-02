import { UserDTO } from "../DTO/UserDTO";
import { Either, isLeft, left, right } from "../utils/either";
import { Request } from "express";
import { UserEither, cCreateUser, cExists, cGetToken, cHasBearer, cVerifyToken, createUser, signIn, verifyToken } from "../utils/eitherUtils";
import { compose, curry } from "../utils/functionalUtils";
// import { refreshToken as fbRefreshToken } from "firebase-admin/app";
import { sign } from 'jsonwebtoken';
import { hash } from 'bcrypt';

export class AuthController {

    private static readonly TOKEN_KEYWORD = "Bearer ";
    // private errorMessages = {
    //     "auth/missing-password": "Falta Contraseña",
    //     "auth/invalid-email": "Email Inválido",
    //     "auth/user-not-found": "Usuario no Existe",
    //     "auth/wrong-password": "Contraseña Incorrecta",
    //     "auth/email-already-in-use": "Email ya está en uso",
    //     "auth/operation-not-allowed": "Operación no Permitida",
    //     "auth/weak-password": "Contraseña Débil",
    //     "auth/argument-error": "Decodificación de token fallida"
    // };
    
    public static async getUser(request: Request | { headers: { authorization: string }}): Promise<UserEither> {
        const authorization = right(request.headers.authorization!)
        const kw = right(this.TOKEN_KEYWORD)

        return await compose(
            cVerifyToken(),
            cGetToken(kw),
            cHasBearer(kw),
            cExists
        )(authorization)
    }

    public static async verify(user: UserDTO): Promise<UserEither> {
        const token = right(user.accessToken!)
        
        const userDTO = await verifyToken(token)
        return userDTO
    }

    // public static async refresh(user: UserDTO): Promise<UserEither> {
    //     const auth = <Auth>this.auth;
        
    //     try {
    //         const { uid, email } = await (user.accessToken!)
    //         const userDTO = new UserDTO(uid, email);
    //         return right(userDTO);
    //     } catch (error) {
    //         return left(this.errorMessages[error.code] ?? error.message);
    //     }
    // }
    
    public static async signIn(user: UserDTO): Promise<UserEither> {

        return await signIn(hash, right(user))
    }
    
    public static async createUser(user: UserDTO): Promise<UserEither> {
        
        return await cCreateUser(
            sign,
            hash
        )(right(user))
    }
    
    // public signOut(): void {
    //     signOut();
    // }
}