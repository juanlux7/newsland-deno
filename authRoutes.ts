import { renderFileToString } from './deno_dependencies/dejs-0.8.0/mod.ts';
import { hashSync, compareSync } from "https://deno.land/x/bcrypt@v0.2.4/mod.ts";
import { users, User } from "./models/User.ts";
import { makeJwt, setExpiration, Jose, Payload } from "https://deno.land/x/djwt@v1.7/create.ts";
import { db } from "./utils/db.ts";
import { validate, required, isNumber, isEmail, match, maxLength } from "https://deno.land/x/validasaur@v0.15.0/mod.ts";


const header:Jose = {
    alg: "HS256",
    typ: "JWT",
  };

export const home = async (ctx: any) => {

    ctx.response.body = await renderFileToString(`${Deno.cwd()}/views/home.ejs`, {
        user: null
    });

}


export const login = async(ctx: any) => {


    ctx.response.body = await renderFileToString(`${Deno.cwd()}/views/main-login.ejs`, {
        error: '',
        user: ctx.state.currentUser || null,
        title: "Login"
    })

}

export const register = async (ctx: any) => {


    ctx.response.body = await renderFileToString(`${Deno.cwd()}/views/main-register.ejs`, {
        error: null,
        user: ctx.state.currentUser || null,
        title: "Register"
    });


}


// custom function for retreiving the user info from the form
async function getUserInfo(ctx: any) {

    const result = ctx.request.body({ type: "text" });
    const keys = await result.value;
    let formObj:any = {};
    let values = keys.split("&");

    for(let field of values) {

        let item = field.split("=");


        formObj[item[0]] = item[1];

    }


    return formObj;


}



export const postRegister = async (ctx: any) => {
            

    const userInfo = await getUserInfo(ctx);

    // a simple validation for the user fields
    const [ passes, errors ] = await validate(userInfo, {
        name: required,
        email: [required, isEmail],
        username: [required, match(/^[a-zA-Z0-9]$/)],
        password: [required, maxLength(30)]
      });


      if(userInfo['password'] !== userInfo['password-confirm']) {
        ctx.response.body = await renderFileToString(`${Deno.cwd()}/views/main-register.ejs`, { error: 'Passwords must match', title: 'Register', user: null});
      } else {

        // fetch the user collection before inserting a new one
        const usersDB = db.collection<any>("users");

        // hashed the password before saving it in the database
        const hashedPassword = hashSync(userInfo["password"]);


        // convert the email to the right format
        userInfo["email"] = userInfo["email"].replace("%40", "@")


        // check if the email is already registered in the system by getting the object

        const emailAlreadyExists = await usersDB.findOne({ email: userInfo["email"]});


        // return an error if the email is already registered
        if(emailAlreadyExists) {
            
            ctx.response.body = await renderFileToString(`${Deno.cwd()}/views/main-register.ejs`, { error: 'Email is already in use', title: 'Register', user: null});
        
        } else {

                    // building a new User object
                    const user:User = {

                        name: userInfo["name"],
                        username: userInfo["username"],
                        email: userInfo["email"],
                        password: hashedPassword,
                        isAdmin: false
                    };


                    // inserting a new user
                    await usersDB.insertOne(user);

                    // redirecting to the login page
                    ctx.response.redirect('/login');
                
                }

        }        

}

export const postLogin = async (ctx: any) => {

    const userInfo = await getUserInfo(ctx);

    const usersDB = db.collection<any>("users");

    const user = await usersDB.findOne({ username: userInfo["username"] });

    if(!user) {
        ctx.response.body = await renderFileToString(`${Deno.cwd()}/views/main-login.ejs`, {error: 'user does not exist', title: 'Login', user: null});
    } else if (!compareSync(userInfo["password"], user.password)) {

        ctx.response.body = await renderFileToString(`${Deno.cwd()}/views/main-login.ejs`, {error: 'password is not correct', title: 'Login', user: user});

    } else {

            const payload: Payload = {
                iss: user.username,
                exp: setExpiration(new Date().getTime() + 1000 * 60 * 60),
            };


            const key:string = Deno.env.get("KEY") || '';

            const jwt:string = await makeJwt({key, header, payload});
            // const jwt:string = await create({ alg: "HS256", typ: "JWT" }, payload, key)

            ctx.cookies.set('jwt', jwt);


            ctx.response.redirect('/');

          

    }


}


export const logout = async (ctx: any) => {

    ctx.cookies.delete("jwt");


    ctx.response.redirect("/");

}