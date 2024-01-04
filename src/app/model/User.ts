import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase/firebase";

export class UserModel {
    constructor(
        private readonly uid: string,
        private readonly email: string,
        private readonly password: string,
        private readonly image: string
    ) {}

    async Add_User({ commit }, user) {
        try {
            const collectionRef = collection(db, "usuarios");
            await addDoc(collectionRef, user);
        } catch (error) {
            console.error("Error adding User to FireStore");
            console.error(error);
        }
    }
}