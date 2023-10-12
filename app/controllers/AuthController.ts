import { Auth, UserCredential, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { IUser } from "../interfaces/IUser";
import { User } from 'firebase/auth';

export class AuthController {
    
    public constructor(
        private auth: Auth,
    ) {}

    public getUser(): IUser | false {
        const { currentUser } = this.auth;
        
        if (currentUser) {

            const { email } = currentUser;
            
            return <IUser>{ email };
        } else {
            return false;
        }

    }

    public async signInWithEmailAndPassword(user: IUser): Promise<string> {
        const { user: fbUser } = await signInWithEmailAndPassword(this.auth, user.email, user.password!);

        const token = fbUser.getIdToken();

        return token;
    }
}