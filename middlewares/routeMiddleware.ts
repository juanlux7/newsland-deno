import { validateJwt } from "https://deno.land/x/djwt@v1.7/validate.ts";
import { User } from "../models/User.ts";
import { db } from "../utils/db.ts";

const routeMiddleware = async (ctx: any, next: Function) => {

    const jwt = ctx.cookies.get('jwt');
    const usersDB = db.collection<any>("users");

    if(jwt) {


        try {

        const key = Deno.env.get("KEY") || '';

        const data:any = await validateJwt({ jwt, key, algorithm: "HS256" });

            if(data) {

                const user = await usersDB.findOne({ username: data.payload.iss })
                ctx.state.currentUser = user;

            } else {
                ctx.cookies.delete('jwt');
            }

        } catch(e) {
            console.log(e)
        }

    } else {

        ctx.state.currentUser = null;

    }

    await next();

}

export default routeMiddleware;