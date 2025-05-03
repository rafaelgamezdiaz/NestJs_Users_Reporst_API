import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { UsersService } from "../users.service";
import { User } from "../users.entity";

// Se agrega o actualiza la propiedad currentUser en la interfaz Request de express
declare global {
    namespace Express {
        interface Request {
            currentUser?: User | null; // Define el tipo de currentUser según tu modelo de usuario
        }
    }

}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {

    constructor(private usersService: UsersService) { }

    async use(req: Request, res: Response, next: NextFunction) {
        const { userId } = req.session || {};

        if (userId && !isNaN(parseInt(userId))) {
            try {
                const user = await this.usersService.findOne(parseInt(userId));

                req.currentUser = user;
            } catch (error) {
                console.error('Error fetching user in CurrentUserMiddleware:', error);
                req.currentUser = null;
            }
        } else {
            req.currentUser = null;
        }


        next();
    }

}