import { Request, Response, Router } from 'express';
import { auth } from '../firebase/firebase';
import { auth as adminAuth } from '../firebase/firebaseAdmin';
import { AuthController } from '../controllers/AuthController';
import { isLeft, right } from '../utils/either';
import { UserDTO } from '../DTO/UserDTO';

const router = Router();

router.get("", async (req, res) => {
    const authController = new AuthController(adminAuth);
    
    try {
        
        const user = await authController.getUser(req);
    
        if (!isLeft(user)) {
            res.send({
                status: "success",
                data: {
                    user: user.right
                }
            });
        } else {
            res.status(404).send({
                status: "fail",
                message: user.left
            });
        }
    } catch (error) {
        res.status(500).send({
            status: "fail",
            message: "Error obteniendo el usuario"
        });
    }
});

router.post("/signUp", async (req, res) => {
    const { email, password } = req.body;

    const userSignIn = new UserDTO(undefined, email, password);

    const authController = new AuthController(auth);
    const user = await authController.createUserWithEmailAndPassword(userSignIn);

    if (!isLeft(user)) {

        res.status(200).send({
            status: "success",
            data: {
                user: user.right
            }
        });
    } else {
        res.status(400).send({
            status: "fail",
            message: user.left
        });
    }
});

router.post("/signIn", async (req, res) => {

    const { email, password } = req.body;

    const userSignIn = new UserDTO(undefined, email, password);

    const authController = new AuthController(auth);
    const user = await authController.signInWithEmailAndPassword(userSignIn);

    if (!isLeft(user)) {

        /*
            Iba a hacer un .set("Authorization", `Bearer ${token}`)
            pero este servicio estará detrás del BFF.
        */
        res.status(200).send({
            status: "success",
            data: {
                user: user.right
            }
        });
    } else {
        res.status(400).send({
            status: "fail",
            message: user.left
        });
    }
});

router.post("token/verify", async (req, res) => {
    const authController = new AuthController(adminAuth);
    const { token } = req.body;

    const user = await authController.verify(token);
    if (!isLeft(user)) {
        res.status(200).send({
            status: "success",
            data: {
                user: user.right
            }
        });
    } else {
        res.status(400).send({
            status: "fail",
            message: user.left
        });
    }
});

router.post("/signOut", async (req, res) => {
    const authController = new AuthController(auth);
    authController.signOut();

    res.status(200).send({
        status: "success",
        data: {
            message: "Sesión cerrada"
        }
    });
});


export { router as authRouter };