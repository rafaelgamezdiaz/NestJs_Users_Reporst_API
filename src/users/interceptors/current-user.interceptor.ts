import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { UsersService } from "../users.service";

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {

    constructor(private userService: UsersService) { }

    async intercept(context: ExecutionContext, next: CallHandler<any>) {
        const request = context.switchToHttp().getRequest();
        const { userId } = request.session || {};

        if (userId && !isNaN(parseInt(userId))) {
            try {
                const user = await this.userService.findOne(parseInt(userId));
                request.currentUser = user;
            } catch (error) {
                console.error('Error fetching user in CurrentUserInterceptor:', error);
                request.currentUser = null;
            }
        } else {
            request.currentUser = null;
        }

        return next.handle();
    }
}