import { Request, Response, Router } from 'express';
import { auth } from '../firebase/firebase';
import { auth as adminAuth } from '../firebase/firebaseAdmin';
import { AuthController } from '../controllers/AuthController';

const router = Router();

router.get("", async (req: Request, res: Response) => {
    const authController = new AuthController(adminAuth);
    
    try {
        
        const user = await authController.getUser(req);
    
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
            });
        }
    } catch (error) {
        res.status(500).send({
            status: "fail",
            message: "Error obteniendo el usuario"
        });
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
    });
});

router.post("/signOut", async (req: Request, res: Response) => {
    const authController = new AuthController(auth);
    authController.signOut();

    res.status(200).send({
        status: "success",
        data: {
            message: "Cierre de sesión completado"
        }
    });
});


export { router as authRouter };