import { addDoc, collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { UserDTO } from "../DTO/UserDTO";

export class UserDAO {

    static async addUser(user: UserDTO) {
        try {
            const collectionRef = collection(db, "usuarios");
            await addDoc(collectionRef, user);
        } catch (error) {
            console.error("Error adding User to FireStore");
            console.error(error);
        }
    }

    async getUser(user: UserDTO) {
        try {
            const q = query(
                collection(db, "usuarios"),
                where("email", "==", user.email)
            );

            /* 
                const unsuscribe = onAuthStateChanged(
                    auth,
                    async (user) => {
                        if (user) {
                            await this.setUser({
                                uid: user.uid,
                                email: user.email,
                                displayName: user.displayName,
                                photoURL: user.photoURL,
                            });
                        } else {
                            this.user = {};
                        }
                        resolve(user);
                    },
                    (e) => reject(e)
                );
                unsuscribe();
            */
            return new Promise((resolve, reject) => {
                onSnapshot(q, (querySnapshot) => {
                    querySnapshot.docs.forEach((doc) => {
                        resolve(doc.data());
                    });
                });
            });
        } catch (error) {
            console.error("Error signin in with e-mail");
            console.error(error);
        }
    }
}