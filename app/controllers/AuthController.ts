import { Auth, UserCredential, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { UserDTO } from "../models/UserDTO";
import { User } from 'firebase/auth';

export class AuthController {
    
    public constructor(
        private auth: Auth,
    ) {}

    public getUser(): User | null {
        return this.auth.currentUser;
    }

    public async signInWithEmailAndPassword(user: UserDTO): Promise<Object> {
        const { user: fbUser } = await signInWithEmailAndPassword(this.auth, user.getEmail(), user.getPassword());

        const newUser = new UserDTO("" + fbUser.email);
        newUser.fill(fbUser);

        return newUser;
    }
}