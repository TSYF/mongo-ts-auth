import { UserCredential, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { IUser } from "../interfaces/IUser";
import { User } from 'firebase/auth';
import { Request } from "express";
import { Auth as AdminAuth } from "firebase-admin/auth";
import { Auth } from "firebase/auth";

export class AuthController {

    private readonly TOKEN_KEYWORD = "Bearer ";
    
    public constructor(
        private auth: AdminAuth | Auth,
    ) {}

    public async getUser(request: Request): Promise<IUser | false> {
        
        const { authorization: bearer } = request.headers;
        const auth = <AdminAuth>this.auth;

        if (
            bearer
            && bearer.startsWith(this.TOKEN_KEYWORD)
        ) {
            const token = bearer.slice(this.TOKEN_KEYWORD.length - 1);
            
            try {
                const { email } = await auth.verifyIdToken(token);
    
                return <IUser>{ email };
            } catch (error) {
                return false;
            }
        }
        return false;
    }

    public async signInWithEmailAndPassword(user: IUser): Promise<string> {
        const auth = <Auth>this.auth;

        const { user: fbUser } = await signInWithEmailAndPassword(auth, user.email, user.password!);

        const token = fbUser.getIdToken();

        return token;
    }

    public signOut(): void {
        const auth = <Auth>this.auth;
        signOut(auth);
    }
}