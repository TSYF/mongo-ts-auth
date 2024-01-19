import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { isRight } from '../utils/either';
import { UserDTO } from '../DTO/UserDTO';

const router = Router({
    // strict: true
    // mergeParams: true
    // caseSensitive: true
});

router.get("", async (req, res) => {
    
    try {
        
        const user = await AuthController.getUser(req);
    
        if (isRight(user)) {
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

    const user = await AuthController.createUser(userSignIn);

    if (isRight(user)) {

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

    const user = await AuthController.signIn(userSignIn);

    if (isRight(user)) {

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
    const { token } = req.body;

    const user = await AuthController.verify(token);
    if (isRight(user)) {
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
    // AuthController.signOut();

    res.status(200).send({
        status: "success",
        data: {
            message: "Sesión cerrada"
        }
    });
});


export { router as authRouter };