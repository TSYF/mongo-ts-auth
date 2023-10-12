import { Request, Response, Router } from 'express';
import { auth } from '../firebase/firebase'
import { AuthController } from '../controllers/AuthController';

const router = Router();

router.get("", async (req: Request, res: Response) => {
    const userController = new AuthController(auth);
    
    const user = userController.getUser();

    if (user) {
        res.send({
            status: "success",
            data: {
                user
            }
        });
    } else {
        res.status(404).send({
            status: "fail",
            message: "Usuario no está autenticado"
        })
    }
});

router.post("/signIn", async (req: Request, res: Response) => {

    const { email, password } = req.body;

    const user = {
        email,
        password
    };

    const authController = new AuthController(auth);
    

    const token          = await authController.signInWithEmailAndPassword(user);

    /*
        Iba a hacer un .set("Authorization", `Bearer ${token}`)
        pero este servicio estará detrás del BFF.
    */
    res.status(200).send({
        status: "success",
        data: {
            token
        }
    })
});


export { router as authRouter };