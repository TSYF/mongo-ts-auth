import { Auth, UserCredential, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { User } from "../models/User";
import { User as FBUser } from 'firebase/auth';

export class AuthController {
    
    public constructor(
        private auth: Auth,
    ) {}

    public getUser(): FBUser | null {
        return this.auth.currentUser;
    }

    public async signInWithEmailAndPassword(user: User): Promise<Object> {
        const { user: fbUser } = await signInWithEmailAndPassword(this.auth, user.getEmail(), user.getPassword());

        const newUser = new User("" + fbUser.email);
        newUser.fill(fbUser);

        return newUser;
    }
}