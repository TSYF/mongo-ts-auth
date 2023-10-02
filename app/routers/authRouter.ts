import { Request, Response, Router } from 'express';
import { User } from '../models/User';
import { auth } from '../firebase/firebase'
import { AuthController } from '../controllers/AuthController';

const router = Router();

router.get("", async (req: Request, res: Response) => {
    const userController = new AuthController(auth);
    
    if (auth.currentUser) {
        const user = userController.getUser();
        
        res.send(user);
    } else {
        res.status(404).send({
            success: false,
            error: true,
            message: "Usuario no está autenticado"
        })
    }
});

router.post("/signIn", (req: Request, res: Response) => {

    const { email, password } = req.body;

    const user = new User(email);
    user.setPassword(password);

    const userController = new AuthController(auth);
    userController.signInWithEmailAndPassword(user).then(u => res.send(u))
});


export { router as authRouter };