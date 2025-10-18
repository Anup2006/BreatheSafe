import { Router } from "express";

const authRouter = Router();

Router.route("/register").post();
Router.route("/login").get();

export default authRouter;
