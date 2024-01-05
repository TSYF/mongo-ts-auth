import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { UserDTO } from "../DTO/UserDTO";
import { Either, isLeft, left, right } from "../utils/either";
import { Request } from "express";
import { Auth as AdminAuth } from "firebase-admin/auth";
import { Auth } from "firebase/auth";
import { UserEither, cExists, cGetToken, cHasBearer, cVerifyToken, createUser, signIn, verifyToken } from "../utils/eitherUtils";
import { compose, curry } from "../utils/functionalUtils";
// import { refreshToken as fbRefreshToken } from "firebase-admin/app";

export class AuthController {

    private readonly TOKEN_KEYWORD = "Bearer ";
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
    
    public constructor(
        private auth: AdminAuth | Auth,
    ) {}

    public async getUser(request: Request | { headers: { authorization: string }}): Promise<UserEither> {
        const authorization = right(request.headers.authorization!)
        const auth = <AdminAuth>this.auth
        const kw = right(this.TOKEN_KEYWORD)

        return await compose(
            cVerifyToken(),
            cGetToken(kw),
            cHasBearer(kw),
            cExists
        )(authorization)
    }

    public async verify(user: UserDTO): Promise<UserEither> {
        const auth = <AdminAuth>this.auth
        const token = right(user.accessToken!)
        
        const userDTO = await verifyToken(auth, this.errorMessages, token)
        return userDTO
    }

    // public async refresh(user: UserDTO): Promise<UserEither> {
    //     const auth = <Auth>this.auth;
        
    //     try {
    //         const { uid, email } = await (user.accessToken!)
    //         const userDTO = new UserDTO(uid, email);
    //         return right(userDTO);
    //     } catch (error) {
    //         return left(this.errorMessages[error.code] ?? error.message);
    //     }
    // }
    
    public async signIn(user: UserDTO): Promise<UserEither> {
        const auth = <Auth>this.auth;

        return await signIn(auth, this.errorMessages, right(user))
    }
    
    public async createUser(user: UserDTO): Promise<UserEither> {
        const auth = <Auth>this.auth;
        
        return await createUser(auth, this.errorMessages, right(user))
    }

    public signOut(): void {
        const auth = <Auth>this.auth;
        signOut(auth);
    }
}